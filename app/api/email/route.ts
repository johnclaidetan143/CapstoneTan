import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const statusMessages: Record<string, { subject: string; emoji: string; message: string }> = {
  "Confirmed":  { subject: "Your order has been confirmed! 🎉", emoji: "📦", message: "Great news! Your order has been confirmed and is being prepared." },
  "Shipped":    { subject: "Your order is on its way! 🚚",      emoji: "🚚", message: "Your order has been shipped and is on its way to you!" },
  "Delivered":  { subject: "Your order has been delivered! ✅",  emoji: "✅", message: "Your order has been delivered. We hope you love it!" },
  "Cancelled":  { subject: "Your order has been cancelled ❌",   emoji: "❌", message: "Your order has been cancelled. Contact us if you have questions." },
};

export async function POST(req: NextRequest) {
  const { customerEmail, customerName, orderNumber, trackingStatus, total } = await req.json();

  if (!customerEmail || !orderNumber || !trackingStatus) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const info = statusMessages[trackingStatus];
  if (!info) return NextResponse.json({ message: "No email for this status." }, { status: 200 });

  if (!process.env.RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY not set, skipping email.");
    return NextResponse.json({ message: "Email skipped (no API key)." }, { status: 200 });
  }

  try {
    await resend.emails.send({
      from: "Cheni Craft <onboarding@resend.dev>",
      to: customerEmail,
      subject: info.subject,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#fafaf8;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <img src="https://sdfpguuquoragpeztqwz.supabase.co/storage/v1/object/public/assets/logo.png" alt="Cheni Craft" style="height:60px;" onerror="this.style.display='none'" />
            <h2 style="color:#d97706;margin-top:12px;">Cheni Craft</h2>
          </div>
          <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;">
            <p style="font-size:32px;text-align:center;margin:0 0 12px;">${info.emoji}</p>
            <h3 style="text-align:center;color:#111;margin:0 0 8px;">Hi ${customerName || "there"}!</h3>
            <p style="text-align:center;color:#666;margin:0 0 16px;">${info.message}</p>
            <div style="background:#fef3c7;border-radius:8px;padding:12px;text-align:center;">
              <p style="font-size:11px;color:#92400e;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Order Number</p>
              <p style="font-size:20px;font-weight:bold;color:#d97706;margin:0;">${orderNumber}</p>
              ${total ? `<p style="font-size:13px;color:#666;margin:4px 0 0;">Total: ₱${total}.00</p>` : ""}
            </div>
          </div>
          <p style="text-align:center;font-size:12px;color:#999;">Thank you for shopping at Cheni Craft! 🌸</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Email sent." }, { status: 200 });
  } catch (err) {
    console.error("[email]", err);
    return NextResponse.json({ message: "Failed to send email." }, { status: 500 });
  }
}
