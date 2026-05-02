import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function sendOtpEmail(email: string, otp: string, name: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[OTP] No SMTP config. OTP for ${email}: ${otp}`);
    return;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Cheni Craft" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Cheni Craft OTP Code 🔐",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fdfaf7;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:#9f1239;margin:0;">Cheni Craft</h2>
          <p style="color:#666;font-size:13px;margin:4px 0 0;">Security Verification</p>
        </div>
        <div style="background:white;border-radius:12px;padding:28px;text-align:center;border:1px solid #f0e6e6;">
          <p style="font-size:32px;margin:0 0 12px;">🔐</p>
          <h3 style="color:#111;margin:0 0 8px;">Hi ${name || "there"}!</h3>
          <p style="color:#666;font-size:14px;margin:0 0 24px;">Use this code to complete your sign in. It expires in <strong>5 minutes</strong>.</p>
          <div style="background:#fef3c7;border-radius:12px;padding:20px;display:inline-block;min-width:200px;">
            <p style="font-size:11px;color:#92400e;font-weight:bold;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Your OTP Code</p>
            <p style="font-size:36px;font-weight:900;color:#d97706;letter-spacing:0.3em;margin:0;">${otp}</p>
          </div>
          <p style="color:#999;font-size:12px;margin:20px 0 0;">If you didn't request this, please ignore this email.</p>
        </div>
        <p style="text-align:center;font-size:11px;color:#bbb;margin-top:20px;">© 2026 Cheni Craft. All rights reserved.</p>
      </div>
    `,
  });
}

// POST — generate and send OTP
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: "Email required." }, { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Get user name for email
  const { data: profile } = await supabase.from("profiles").select("name").eq("email", email.toLowerCase()).single();

  await supabase.from("profiles")
    .update({ otp_code: otp, otp_expires: expires })
    .eq("email", email.toLowerCase());

  try {
    await sendOtpEmail(email, otp, profile?.name || "");
    return NextResponse.json({ message: "OTP sent to your email." }, { status: 200 });
  } catch (err) {
    console.error("[OTP email error]", err);
    // Still return success but include OTP for fallback
    return NextResponse.json({ message: "OTP generated.", otp }, { status: 200 });
  }
}

// PATCH — verify OTP
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

  await supabase.from("profiles").update({ otp_code: null, otp_expires: null }).eq("email", email.toLowerCase());

  return NextResponse.json({
    message: "OTP verified.",
    user: { id: data.id, name: data.name, email: data.email, role: data.role },
  }, { status: 200 });
}
