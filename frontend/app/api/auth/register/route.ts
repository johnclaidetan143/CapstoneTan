import { NextRequest, NextResponse } from "next/server";
import { createId, readJsonArray, writeJsonArray } from "@/lib/server/db";
import type { UserRecord } from "@/lib/server-types";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RegisterBody;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return NextResponse.json({ message: "Name, email, and password are required." }, { status: 400 });
  }

  const users = await readJsonArray<UserRecord>("users.json");
  const exists = users.some((u) => u.email === email);
  if (exists) {
    return NextResponse.json({ message: "Email is already registered." }, { status: 409 });
  }

  const newUser: UserRecord = {
    id: createId("usr"),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeJsonArray("users.json", users);

  return NextResponse.json(
    {
      message: "Registered successfully.",
      user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
    },
    { status: 201 }
  );
}
