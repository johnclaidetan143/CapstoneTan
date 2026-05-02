import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ count: 0, users: [] }, { status: 200 });

  const users = (data ?? []).map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at }));
  return NextResponse.json({ count: users.length, users }, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { email, name, phone, password } = body;
  if (!email) return NextResponse.json({ message: "Email required." }, { status: 400 });

  const updates: Record<string, string> = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (password) updates.password = password;

  const { error } = await supabase.from("profiles").update(updates).eq("email", email.toLowerCase());
  if (error) return NextResponse.json({ message: "Update failed." }, { status: 500 });
  return NextResponse.json({ message: "Updated." });
}
