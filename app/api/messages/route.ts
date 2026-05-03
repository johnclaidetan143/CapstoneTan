import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  let query = supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ messages: [] });

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const message = String(body?.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ message: "Name must be between 2 and 120 characters." }, { status: 400 });
  }
  if (message.length < 5 || message.length > 2000) {
    return NextResponse.json({ message: "Message must be between 5 and 2000 characters." }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({
    name,
    email,
    message,
    is_read: false,
    admin_reply: null,
    reply_read: false,
  });

  if (error) {
    console.error("[messages POST]", error);
    return NextResponse.json({ message: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ message: "Message sent." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = body?.id;
  const action = body?.action;

  if (action === "reply") {
    const adminReply = String(body?.adminReply ?? "").trim();
    if (!id || !adminReply) {
      return NextResponse.json({ message: "id and adminReply are required." }, { status: 400 });
    }
    const { error } = await supabase
      .from("messages")
      .update({
        admin_reply: adminReply,
        replied_at: new Date().toISOString(),
        reply_read: false,
      })
      .eq("id", id);
    if (error) return NextResponse.json({ message: "Failed to save reply." }, { status: 500 });
    return NextResponse.json({ message: "Reply saved." });
  }

  if (action === "clearReply") {
    if (!id) return NextResponse.json({ message: "id is required." }, { status: 400 });
    const { error } = await supabase
      .from("messages")
      .update({ admin_reply: null, replied_at: null, reply_read: true })
      .eq("id", id);
    if (error) return NextResponse.json({ message: "Failed to clear reply." }, { status: 500 });
    return NextResponse.json({ message: "Reply cleared." });
  }

  if (action === "markReplyRead") {
    if (!id) return NextResponse.json({ message: "id is required." }, { status: 400 });
    const { error } = await supabase.from("messages").update({ reply_read: true }).eq("id", id);
    if (error) return NextResponse.json({ message: "Failed to update reply status." }, { status: 500 });
    return NextResponse.json({ message: "Reply marked as read." });
  }

  if (id === "all") {
    await supabase.from("messages").update({ is_read: true }).eq("is_read", false);
  } else {
    await supabase.from("messages").update({ is_read: true }).eq("id", id);
  }

  return NextResponse.json({ message: "Updated." });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  if (!body?.id) return NextResponse.json({ message: "id is required." }, { status: 400 });
  await supabase.from("messages").delete().eq("id", body.id);
  return NextResponse.json({ message: "Deleted." });
}
