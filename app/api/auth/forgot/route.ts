import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

async function sendResetEmail(email: string, resetUrl: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[RESET] No SMTP config. Reset link for ${email}: ${resetUrl}`);
    return;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Cheni Craft" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your Cheni Craft password",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#fdfaf7;border-radius:12px;">
        <h2 style="margin:0 0 8px;color:#9f1239;">Cheni Craft</h2>
        <p style="margin:0 0 16px;color:#555;">We received a request to reset your password.</p>
        <p style="margin:0 0 20px;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#9f1239;color:#fff;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p style="margin:0 0 6px;color:#666;font-size:13px;">This link expires in 30 minutes.</p>
        <p style="margin:0;color:#999;font-size:12px;">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ message: "No account found with this email." }, { status: 404 });
  }

  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { error: updateError } = await supabaseServer
    .from("profiles")
    .update({ reset_token: token, reset_expires: expires })
    .eq("email", normalizedEmail);

  if (updateError) {
    return NextResponse.json({ message: "Failed to create reset link." }, { status: 500 });
  }

  const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

  try {
    await sendResetEmail(normalizedEmail, resetUrl);
    return NextResponse.json({ message: "Reset email sent." }, { status: 200 });
  } catch (err) {
    console.error("[RESET email error]", err);
    return NextResponse.json({ message: "Failed to send reset email." }, { status: 500 });
  }
}

