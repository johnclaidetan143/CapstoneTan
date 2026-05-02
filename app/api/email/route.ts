import { NextRequest, NextResponse } from "next/server";

type EmailBody = {
  customerEmail?: string;
  customerName?: string;
  orderNumber?: string;
  trackingStatus?: string;
  total?: number;
};

function statusTitle(status: string) {
  if (status === "Received") return "Delivery Confirmed";
  return `Order Update: ${status}`;
}

function customerHtml(name: string, orderNumber: string, status: string, total: number) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#fdfaf7;border-radius:12px;">
      <h2 style="margin:0 0 8px;color:#9f1239;">Cheni Craft</h2>
      <p style="margin:0 0 14px;color:#555;">Hi ${name || "Customer"},</p>
      <p style="margin:0 0 8px;color:#555;">Your order status has been updated.</p>
      <div style="background:#fff;border:1px solid #f1e7e7;border-radius:10px;padding:14px 16px;margin:10px 0 14px;">
        <p style="margin:0 0 6px;color:#666;font-size:13px;">Order Number</p>
        <p style="margin:0 0 10px;color:#111;font-weight:700;">${orderNumber}</p>
        <p style="margin:0 0 6px;color:#666;font-size:13px;">Status</p>
        <p style="margin:0 0 10px;color:#111;font-weight:700;">${status}</p>
        <p style="margin:0;color:#666;font-size:13px;">Total: <strong style="color:#111;">PHP ${Number(total || 0).toFixed(2)}</strong></p>
      </div>
      <p style="margin:0;color:#777;font-size:13px;">Thank you for shopping with Cheni Craft.</p>
    </div>
  `;
}

function adminHtml(customerName: string, customerEmail: string, orderNumber: string, total: number) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#f9fafb;border-radius:12px;">
      <h2 style="margin:0 0 8px;color:#111;">Delivery Confirmed by Customer</h2>
      <p style="margin:0 0 10px;color:#555;">A customer confirmed their order as received.</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;">
        <p style="margin:0 0 6px;color:#666;font-size:13px;">Order Number</p>
        <p style="margin:0 0 10px;color:#111;font-weight:700;">${orderNumber}</p>
        <p style="margin:0 0 6px;color:#666;font-size:13px;">Customer</p>
        <p style="margin:0 0 10px;color:#111;font-weight:700;">${customerName || "-"}</p>
        <p style="margin:0 0 6px;color:#666;font-size:13px;">Email</p>
        <p style="margin:0 0 10px;color:#111;">${customerEmail || "-"}</p>
        <p style="margin:0;color:#666;font-size:13px;">Total: <strong style="color:#111;">PHP ${Number(total || 0).toFixed(2)}</strong></p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as EmailBody;
  const customerEmail = body.customerEmail?.trim().toLowerCase() || "";
  const customerName = body.customerName?.trim() || "Customer";
  const orderNumber = body.orderNumber?.trim() || "N/A";
  const trackingStatus = body.trackingStatus?.trim() || "Updated";
  const total = Number(body.total || 0);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL] No SMTP config. ${orderNumber} -> ${trackingStatus}`);
    return NextResponse.json({ message: "SMTP not configured. Email skipped." }, { status: 200 });
  }

  if (!customerEmail) {
    return NextResponse.json({ message: "customerEmail is required." }, { status: 400 });
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
    to: customerEmail,
    subject: `Cheni Craft - ${statusTitle(trackingStatus)}`,
    html: customerHtml(customerName, orderNumber, trackingStatus, total),
  });

  if (trackingStatus === "Received" && process.env.ADMIN_EMAIL) {
    await transporter.sendMail({
      from: `"Cheni Craft" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Customer Confirmed Delivery - ${orderNumber}`,
      html: adminHtml(customerName, customerEmail, orderNumber, total),
    });
  }

  return NextResponse.json({ message: "Email notification sent." }, { status: 200 });
}
