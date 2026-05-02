import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  const orderNumber = req.nextUrl.searchParams.get("orderNumber");

  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", Number(productId));
  if (orderNumber) query = query.eq("order_number", orderNumber);

  const { data, error } = await query;
  if (error) return NextResponse.json({ reviews: [] });

  const reviews = (data ?? []).map((r) => ({
    id: r.id,
    productId: r.product_id,
    product_id: r.product_id,
    orderNumber: r.order_number,
    order_number: r.order_number,
    reviewer: r.reviewer,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
    admin_reply: r.admin_reply,
  }));

  return NextResponse.json({ reviews });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, orderNumber, reviewer, rating, comment } = body;

  if (!productId || !orderNumber || !reviewer || !rating || !comment) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  // Check duplicate
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("order_number", orderNumber)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Already reviewed." }, { status: 409 });
  }

  const { data, error } = await supabase.from("reviews").insert({
    product_id: productId,
    order_number: orderNumber,
    reviewer,
    rating,
    comment,
    date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
  }).select().single();

  if (error || !data) {
    console.error("[reviews POST]", error);
    return NextResponse.json({ message: "Failed to save review." }, { status: 500 });
  }

  return NextResponse.json({ message: "Review saved.", review: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, adminReply } = body;
  if (!id) return NextResponse.json({ message: "id required." }, { status: 400 });

  const { error } = await supabase
    .from("reviews")
    .update({ admin_reply: adminReply ?? null })
    .eq("id", id);

  if (error) return NextResponse.json({ message: "Failed to update." }, { status: 500 });
  return NextResponse.json({ message: "Updated." });
}
