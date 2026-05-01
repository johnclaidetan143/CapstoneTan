import { NextRequest, NextResponse } from "next/server";
import { createId, readJsonArray, writeJsonArray } from "@/lib/server/db";
import type { Notification } from "@/app/api/notifications/route";

// Full order shape matching what checkout sends
export type StoredOrder = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customer: { name: string; phone: string; address: string; city: string };
  items: { productId: number; name: string; subtitle: string; price: number; img: string; quantity: number }[];
  total: number;
  payment: {
    method: string;
    bank: string | null;
    accountUsed: string | null;
    referenceNumber: string;
    status: string;
  };
  trackingStatus: string;
  notificationRead: boolean;
  createdAt: string;
};

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    const orders = await readJsonArray<StoredOrder>("orders.json");

    if (!email) {
      return NextResponse.json({ orders }, { status: 200 });
    }

    const filtered = orders.filter(
      (o) => o.customerEmail?.toLowerCase() === email
    );
    return NextResponse.json({ orders: filtered }, { status: 200 });
  } catch (err) {
    console.error("[orders GET]", err);
    return NextResponse.json({ orders: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Accept the full order object from checkout
    const order: StoredOrder = {
      id: createId("ord"),
      orderNumber: body.orderNumber || `CCH-${Date.now().toString().slice(-6)}`,
      date: body.date || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
      customerName: body.customer?.name || body.customerName || "",
      customerEmail: body.customerEmail || "",
      customer: body.customer || { name: "", phone: "", address: "", city: "" },
      items: body.items || [],
      total: body.total || 0,
      payment: body.payment || { method: "", bank: null, accountUsed: null, referenceNumber: "", status: "Pending Verification" },
      trackingStatus: body.trackingStatus || "Pending Verification",
      notificationRead: false,
      createdAt: new Date().toISOString(),
    };

    if (!order.customerName || order.items.length === 0) {
      return NextResponse.json({ message: "Customer name and items are required." }, { status: 400 });
    }

    const orders = await readJsonArray<StoredOrder>("orders.json");
    // Prevent duplicate order numbers
    const exists = orders.find((o) => o.orderNumber === order.orderNumber);
    if (!exists) {
      orders.unshift(order);
      await writeJsonArray("orders.json", orders);

      // Create admin notification
      const notification: Notification = {
        id: createId("notif"),
        orderId: order.id,
        orderNumber: order.orderNumber,
        title: "New Order Received",
        message: `New order from ${order.customerName} — ₱${order.total.toFixed(2)} (${order.payment.method === "gcash" ? "GCash" : "COD"})`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      const notifications = await readJsonArray<Notification>("notifications.json");
      notifications.unshift(notification);
      await writeJsonArray("notifications.json", notifications);
    }

    return NextResponse.json({ message: "Order saved.", order }, { status: 201 });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, trackingStatus, paymentStatus } = body;

    if (!orderNumber) {
      return NextResponse.json({ message: "orderNumber is required." }, { status: 400 });
    }

    const orders = await readJsonArray<StoredOrder>("orders.json");
    let found = false;

    const updated = orders.map((o) => {
      if (o.orderNumber !== orderNumber) return o;
      found = true;
      return {
        ...o,
        ...(trackingStatus ? { trackingStatus } : {}),
        ...(paymentStatus ? { payment: { ...o.payment, status: paymentStatus } } : {}),
        notificationRead: false,
      };
    });

    if (!found) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    await writeJsonArray("orders.json", updated);
    return NextResponse.json({ message: "Order updated." }, { status: 200 });
  } catch (err) {
    console.error("[orders PATCH]", err);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
