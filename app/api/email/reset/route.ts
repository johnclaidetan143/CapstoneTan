import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, email } = await req.json();
  const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log("[reset] Reset URL:", resetUrl);
  return NextResponse.json({ message: "Email skipped.", resetUrl }, { status: 200 });
}
