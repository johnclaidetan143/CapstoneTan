import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  // Admin hardcoded check — always works regardless of Supabase
  if (email === "admin@gmail.com" && password === "admin123") {
    return NextResponse.json({
      message: "Login successful.",
      user: { id: "admin-001", name: "Admin", email: "admin@gmail.com", role: "admin" },
    }, { status: 200 });
  }

  // Regular user — check Supabase profiles
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, password")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (data.password !== password) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful.",
      user: { id: data.id, name: data.name, email: data.email, role: data.role ?? "customer" },
    }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
}
