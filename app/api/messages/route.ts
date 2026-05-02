import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ messages: [] });

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  const { error } = await supabase.from("messages").insert({ name, email, message, is_read: false });

  if (error) {
    return NextResponse.json({ message: "Failed to send message." }, { status: 500 });
  }

  return NextResponse.json({ message: "Message sent." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (body.id === "all") {
    await supabase.from("messages").update({ is_read: true }).eq("is_read", false);
  } else {
    await supabase.from("messages").update({ is_read: true }).eq("id", body.id);
  }

  return NextResponse.json({ message: "Updated." });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  await supabase.from("messages").delete().eq("id", body.id);
  return NextResponse.json({ message: "Deleted." });
}
