import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// ─── Table: chat_messages ───────────────────────────────────────────────────
// Required columns:
//   id          uuid  primary key default gen_random_uuid()
//   user_id     text  not null          ← logged-in user's email (identifier)
//   user_name   text  not null default ''
//   sender      text  not null          ← 'user' | 'admin'
//   message     text  not null          ← message content
//   is_read     bool  not null default false
//   created_at  timestamptz default now()
//
// Run this in Supabase SQL Editor if the table doesn't exist:
//
//   create table if not exists chat_messages (
//     id         uuid primary key default gen_random_uuid(),
//     user_id    text not null,
//     user_name  text not null default '',
//     sender     text not null check (sender in ('user','admin')),
//     message    text not null,
//     is_read    boolean not null default false,
//     created_at timestamptz not null default now()
//   );
//   create index if not exists idx_chat_user_id on chat_messages(user_id, created_at);
//   alter table chat_messages disable row level security;
// ────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id")?.trim().toLowerCase();

  // ── Fetch single user's conversation ──────────────────────────────────────
  if (userId) {
    console.log("[chat GET] Fetching messages for user_id:", userId);

    const { data, error } = await supabaseServer
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[chat GET] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
      return NextResponse.json({ messages: [], error: error.message, code: error.code });
    }

    console.log("[chat GET] Found", data?.length ?? 0, "messages for", userId);
    return NextResponse.json({ messages: data ?? [] });
  }

  // ── Admin: all conversations grouped by user ───────────────────────────────
  console.log("[chat GET] Fetching all conversations for admin");

  const { data, error } = await supabaseServer
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[chat GET all] Supabase error:", error.message, "| code:", error.code, "| hint:", error.hint);
    return NextResponse.json({ conversations: [], error: error.message, code: error.code });
  }

  // Group by user_id — one entry per user, latest message + unread count
  const map = new Map<string, {
    user_id:      string;
    user_name:    string;
    last_message: string;
    last_time:    string;
    unread:       number;
  }>();

  for (const msg of data ?? []) {
    if (!map.has(msg.user_id)) {
      map.set(msg.user_id, {
        user_id:      msg.user_id,
        user_name:    msg.user_name,
        last_message: msg.message,
        last_time:    msg.created_at,
        unread:       msg.sender === "user" && !msg.is_read ? 1 : 0,
      });
    } else if (msg.sender === "user" && !msg.is_read) {
      map.get(msg.user_id)!.unread += 1;
    }
  }

  const conversations = Array.from(map.values());
  console.log("[chat GET all] Found", conversations.length, "conversations");
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const user_id   = String(body?.user_id   ?? "").trim().toLowerCase();
  const user_name = String(body?.user_name ?? "").trim();
  const message   = String(body?.message   ?? "").trim();
  const sender    = body?.sender === "admin" ? "admin" : "user";

  console.log("[chat POST] Incoming:", { user_id, user_name, sender, message: message.slice(0, 50) });

  if (!user_id || !message) {
    console.error("[chat POST] Missing required fields — user_id:", user_id, "| message:", message);
    return NextResponse.json({ message: "user_id and message are required." }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("chat_messages")
    .insert({ user_id, user_name, message, sender, is_read: false })
    .select()
    .single();

  if (error) {
    console.error(
      "[chat POST] Supabase insert error:", error.message,
      "| code:", error.code,
      "| details:", error.details,
      "| hint:", error.hint,
      "| payload:", { user_id, user_name, sender, message }
    );
    return NextResponse.json({ message: "Failed to send message.", detail: error.message, code: error.code }, { status: 500 });
  }

  console.log("[chat POST] Inserted message id:", data?.id);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const user_id = String(body?.user_id ?? "").trim().toLowerCase();
  if (!user_id) return NextResponse.json({ message: "user_id required." }, { status: 400 });

  const { error } = await supabaseServer
    .from("chat_messages")
    .update({ is_read: true })
    .eq("user_id", user_id)
    .eq("sender", "user");

  if (error) {
    console.error("[chat PATCH] Supabase error:", error.message);
  }

  return NextResponse.json({ message: "Marked as read." });
}
