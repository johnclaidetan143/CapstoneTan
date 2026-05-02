import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  // Check admin from env first
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === adminEmail && password === adminPassword) {
    return NextResponse.json({
      message: "Login successful.",
      user: { id: "admin-001", name: "Admin", email: adminEmail, role: "admin" },
    }, { status: 200 });
  }

  // Query Supabase profiles
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, password")
    .eq("email", email)
    .single();

  console.log("[login] email:", email);
  console.log("[login] supabase data:", data);
  console.log("[login] supabase error:", error?.message);

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
}
