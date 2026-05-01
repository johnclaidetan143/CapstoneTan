import { NextRequest, NextResponse } from "next/server";
import { readJsonArray } from "@/lib/server/db";
import type { UserRecord } from "@/lib/server-types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  // Check registered users from file
  try {
    const users = await readJsonArray<UserRecord>("users.json");
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful.",
      user: { id: user.id, name: user.name, email: user.email, role: user.role || "customer" },
    }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
}
