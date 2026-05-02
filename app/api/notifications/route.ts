import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export type Notification = {
  id: string;
  orderId: string;
  orderNumber: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export async function GET() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ notifications: [] });
  }

  const notifications = (data ?? []).map((n) => ({
    id: n.id,
    orderId: n.order_id,
    orderNumber: n.order_number,
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    createdAt: n.created_at,
  }));

  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (body.id === "all") {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  } else {
    await supabase.from("notifications").update({ is_read: true }).eq("id", body.id);
  }

  return NextResponse.json({ message: "Updated." });
}
