import { NextResponse } from "next/server";
import { readJsonArray } from "@/lib/server/db";
import type { UserRecord } from "@/lib/server-types";

export async function GET() {
  try {
    const users = await readJsonArray<UserRecord>("users.json");
    const customers = users.filter((u) => u.role === "customer");
    return NextResponse.json({
      count: customers.length,
      users: customers.map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt })),
    }, { status: 200 });
  } catch {
    return NextResponse.json({ count: 0, users: [] }, { status: 200 });
  }
}
