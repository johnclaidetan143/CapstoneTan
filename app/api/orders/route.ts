import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (email) {
    query = query.eq("customer_email", email);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ orders: [] }, { status: 200 });
  }

  // Map snake_case to camelCase for frontend
  const orders = (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    date: o.date,
    customerName: o.customer_name,
    customerEmail: o.customer_email,
    customer: o.customer,
    items: o.items,
    total: o.total,
    payment: o.payment,
    trackingStatus: o.tracking_status,
    notificationRead: o.notification_read,
    createdAt: o.created_at,
  }));

  return NextResponse.json({ orders }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const orderNumber = body.orderNumber || `CCH-${Date.now().toString().slice(-6)}`;

  // Check duplicate
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Order already exists." }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      date: body.date || new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
      customer_name: body.customer?.name || "",
      customer_email: body.customerEmail || "",
      customer: body.customer || {},
      items: body.items || [],
      total: body.total || 0,
      payment: body.payment || {},
      tracking_status: body.trackingStatus || "Pending Verification",
      notification_read: false,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[orders POST]", error);
    return NextResponse.json({ message: "Failed to save order." }, { status: 500 });
  }

  // Create admin notification
  await supabase.from("notifications").insert({
    order_id: data.id,
    order_number: orderNumber,
    title: "New Order Received",
    message: `New order from ${body.customer?.name} — ₱${Number(body.total).toFixed(2)} (${body.payment?.method === "gcash" ? "GCash" : "COD"})`,
    is_read: false,
  });

  return NextResponse.json({ message: "Order saved.", order: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { orderNumber, trackingStatus, paymentStatus } = body;

  if (!orderNumber) {
    return NextResponse.json({ message: "orderNumber is required." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { notification_read: false };
  if (trackingStatus) updates.tracking_status = trackingStatus;
  if (paymentStatus) {
    const { data: current } = await supabase
      .from("orders")
      .select("payment")
      .eq("order_number", orderNumber)
      .single();
    if (current) updates.payment = { ...current.payment, status: paymentStatus };
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("order_number", orderNumber)
    .select("customer_email, customer_name, total")
    .single();

  if (error) {
    return NextResponse.json({ message: "Failed to update order." }, { status: 500 });
  }

  // Send email notification if tracking status changed
  if (trackingStatus && updated?.customer_email) {
    try {
      await fetch(`${req.nextUrl.origin}/api/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: updated.customer_email,
          customerName: updated.customer_name,
          orderNumber,
          trackingStatus,
          total: updated.total,
        }),
      });
    } catch {
      // Non-blocking
    }
  }

  return NextResponse.json({ message: "Order updated." }, { status: 200 });
}
