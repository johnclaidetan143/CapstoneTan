import { NextRequest, NextResponse } from "next/server";
import { readJsonArray } from "@/lib/server/db";
import type { UserRecord } from "@/lib/server-types";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  let users: UserRecord[];
  try {
    users = await readJsonArray<UserRecord>("users.json");
  } catch (err) {
    console.error("[login] Failed to read users.json:", err);
    return NextResponse.json({ message: "Server error. Please try again." }, { status: 500 });
  }

  const user = users.find(
    (u) => u.email.trim().toLowerCase() === email && u.password === password
  );

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({
    message: "Login successful.",
    user: { id: user.id, name: user.name, email: user.email, role: user.role ?? "customer" },
  }, { status: 200 });
}
