import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET() {
  // 1. Try to select from chat_messages
  const { data, error, count } = await supabaseServer
    .from("chat_messages")
    .select("*", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({
      ok: false,
      step: "select chat_messages",
      error: error.message,
      code: error.code,
      hint: error.hint,
      detail: error.details,
      fix: error.code === "42P01"
        ? "Table does not exist. Run the CREATE TABLE SQL in Supabase SQL Editor."
        : "Check RLS policies or service role key.",
    });
  }

  // 2. Try a test insert then delete
  const { data: inserted, error: insertError } = await supabaseServer
    .from("chat_messages")
    .insert({
      user_id:   "test@test.com",
      user_name: "Test",
      message:   "diagnostic test",
      sender:    "user",
      is_read:   false,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({
      ok: false,
      step: "insert test row",
      error: insertError.message,
      code: insertError.code,
      hint: insertError.hint,
      fix: "Check column names match: user_id, user_name, message, sender, is_read",
    });
  }

  // Clean up test row
  await supabaseServer.from("chat_messages").delete().eq("id", inserted.id);

  return NextResponse.json({
    ok: true,
    message: "chat_messages table is working correctly.",
    row_count: count,
    test_insert_id: inserted.id,
  });
}
