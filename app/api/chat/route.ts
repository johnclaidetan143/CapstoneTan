import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (email) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ messages: [] });
    return NextResponse.json({ messages: data ?? [] });
  }

  // Admin: all messages, latest first
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ conversations: [] });

  // Group by user_email — one entry per user with latest message + unread count
  const map = new Map<string, {
    user_email: string;
    user_name: string;
    last_message: string;
    last_time: string;
    unread: number;
  }>();

  for (const msg of data ?? []) {
    if (!map.has(msg.user_email)) {
      map.set(msg.user_email, {
        user_email: msg.user_email,
        user_name: msg.user_name,
        last_message: msg.content,
        last_time: msg.created_at,
        unread: msg.sender === "user" && !msg.is_read ? 1 : 0,
      });
    } else if (msg.sender === "user" && !msg.is_read) {
      map.get(msg.user_email)!.unread += 1;
    }
  }

  return NextResponse.json({ conversations: Array.from(map.values()) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user_email = String(body?.user_email ?? "").trim().toLowerCase();
  const user_name = String(body?.user_name ?? "").trim();
  const content = String(body?.content ?? "").trim();
  const sender = body?.sender === "admin" ? "admin" : "user";

  if (!user_email || !content) {
    return NextResponse.json({ message: "user_email and content are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_email, user_name, content, sender, is_read: false })
    .select()
    .single();

  if (error) {
    console.error("[chat POST]", error);
    return NextResponse.json({ message: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ message: "email required." }, { status: 400 });

  await supabase
    .from("chat_messages")
    .update({ is_read: true })
    .eq("user_email", email)
    .eq("sender", "user");

  return NextResponse.json({ message: "Marked as read." });
}
