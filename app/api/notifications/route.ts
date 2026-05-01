import { NextRequest, NextResponse } from "next/server";
import { createId, readJsonArray, writeJsonArray } from "@/lib/server/db";

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
  const notifications = await readJsonArray<Notification>("notifications.json");
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ notifications: sorted });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const notification: Notification = {
    id: createId("notif"),
    orderId: body.orderId || "",
    orderNumber: body.orderNumber || "",
    title: body.title || "New Order",
    message: body.message || "A new order was received.",
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  const notifications = await readJsonArray<Notification>("notifications.json");
  notifications.unshift(notification);
  await writeJsonArray("notifications.json", notifications);
  return NextResponse.json({ notification }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const notifications = await readJsonArray<Notification>("notifications.json");
  const updated = notifications.map((n) => {
    if (body.id === "all" || n.id === body.id) return { ...n, isRead: true };
    return n;
  });
  await writeJsonArray("notifications.json", updated);
  return NextResponse.json({ message: "Updated." });
}
