import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({
    message: "Login successful.",
    user: { id: data.id, name: data.name, email: data.email, role: data.role ?? "customer" },
  }, { status: 200 });
}
