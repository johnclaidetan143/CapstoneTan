import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { email, token } = await req.json();
  const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (!process.env.RESEND_API_KEY) {
    console.log("[reset email] No RESEND_API_KEY, reset URL:", resetUrl);
    return NextResponse.json({ message: "Email skipped (no API key).", resetUrl }, { status: 200 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Cheni Craft <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password 🔐",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#fafaf8;border-radius:16px;">
          <h2 style="color:#d97706;text-align:center;">Cheni Craft</h2>
          <div style="background:white;border-radius:12px;padding:24px;margin:16px 0;text-align:center;">
            <p style="font-size:32px;margin:0 0 12px;">🔐</p>
            <h3 style="color:#111;margin:0 0 8px;">Reset Your Password</h3>
            <p style="color:#666;font-size:14px;margin:0 0 20px;">Click the button below to reset your password. This link expires in 30 minutes.</p>
            <a href="${resetUrl}" style="background:#d97706;color:white;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:bold;font-size:14px;">Reset Password</a>
          </div>
          <p style="text-align:center;font-size:12px;color:#999;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    return NextResponse.json({ message: "Reset email sent." });
  } catch (err) {
    console.error("[reset email]", err);
    return NextResponse.json({ message: "Failed to send email." }, { status: 500 });
  }
}
