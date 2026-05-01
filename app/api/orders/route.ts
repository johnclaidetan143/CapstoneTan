import { NextRequest, NextResponse } from "next/server";
import { createId, readJsonArray, writeJsonArray } from "@/lib/server/db";
import type { OrderItem, OrderRecord } from "@/lib/server-types";

type CreateOrderBody = {
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  payment?: string;
  items?: OrderItem[];
};

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const orders = await readJsonArray<OrderRecord>("orders.json");

  if (!email) {
    return NextResponse.json({ orders }, { status: 200 });
  }

  const filtered = orders.filter((o) => o.customerEmail.toLowerCase() === email);
  return NextResponse.json({ orders: filtered }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateOrderBody;
  const customerName = body.customerName?.trim();
  const customerEmail = body.customerEmail?.trim().toLowerCase();
  const phone = body.phone?.trim();
  const address = body.address?.trim();
  const city = body.city?.trim();
  const payment = body.payment?.trim() || "gcash";
  const items = body.items || [];

  if (!customerName || !customerEmail || !phone || !address || !city || items.length === 0) {
    return NextResponse.json(
      { message: "Customer info and at least one item are required." },
      { status: 400 }
    );
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order: OrderRecord = {
    id: createId("ord"),
    orderNumber: `CCH-${Date.now().toString().slice(-6)}`,
    customerName,
    customerEmail,
    phone,
    address,
    city,
    payment,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  const orders = await readJsonArray<OrderRecord>("orders.json");
  orders.push(order);
  await writeJsonArray("orders.json", orders);

  return NextResponse.json({ message: "Order placed.", order }, { status: 201 });
}
