import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ count: 0, users: [] }, { status: 200 });
  }

  const users = (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.created_at,
  }));

  return NextResponse.json({ count: users.length, users }, { status: 200 });
}
