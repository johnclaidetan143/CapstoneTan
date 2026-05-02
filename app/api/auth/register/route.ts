import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json({ message: "Name, email, and password are required." }, { status: 400 });
  }

  // Check if email already exists
  const { data: existing } = await supabaseServer
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Email is already registered." }, { status: 409 });
  }

  const { data, error } = await supabaseServer
    .from("profiles")
    .insert({ name, email, password, role: "customer" })
    .select("id, name, email, created_at")
    .single();

  if (error || !data) {
    const debugMessage =
      process.env.NODE_ENV === "development" ? (error?.message ?? "Unknown Supabase error") : undefined;
    return NextResponse.json(
      { message: "Registration failed. Please try again.", debug: debugMessage },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Registered successfully.",
    user: { id: data.id, name: data.name, email: data.email, createdAt: data.created_at },
  }, { status: 201 });
}
