import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/auth/otp — generate OTP after credentials verified
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "Email required." }, { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  await supabase.from("profiles")
    .update({ otp_code: otp, otp_expires: expires })
    .eq("email", email.toLowerCase());

  // In production, send via SMS/email. For now, return in response for testing.
  console.log(`[OTP] ${email} → ${otp}`);

  return NextResponse.json({ message: "OTP generated.", otp }, { status: 200 });
}

// PATCH /api/auth/otp — verify OTP
export async function PATCH(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ message: "Email and OTP required." }, { status: 400 });

  const { data } = await supabase.from("profiles")
    .select("otp_code, otp_expires, id, name, email, role")
    .eq("email", email.toLowerCase())
    .single();

  if (!data) return NextResponse.json({ message: "User not found." }, { status: 404 });
  if (data.otp_code !== otp) return NextResponse.json({ message: "Invalid OTP code." }, { status: 401 });
  if (new Date(data.otp_expires) < new Date()) return NextResponse.json({ message: "OTP has expired. Please login again." }, { status: 401 });

  // Clear OTP after successful verification
  await supabase.from("profiles").update({ otp_code: null, otp_expires: null }).eq("email", email.toLowerCase());

  return NextResponse.json({
    message: "OTP verified.",
    user: { id: data.id, name: data.name, email: data.email, role: data.role },
  }, { status: 200 });
}
