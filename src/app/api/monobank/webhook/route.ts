import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, type MonobankInvoiceStatus } from "@/lib/monobank";
import { db } from "@/lib/db";

// Next.js App Router: disable body parsing so we can read raw bytes for ECDSA verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const xSign = req.headers.get("x-sign");
  if (!xSign) {
    return NextResponse.json({ error: "Missing X-Sign" }, { status: 400 });
  }

  const rawBody = Buffer.from(await req.arrayBuffer());

  const valid = await verifyWebhookSignature(rawBody, xSign);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody.toString()) as {
    invoiceId: string;
    status: MonobankInvoiceStatus;
  };

  const { invoiceId, status } = payload;

  if (status === "success") {
    await db.purchase.updateMany({
      where: { invoiceId },
      data: { status: "active" },
    });
  } else if (status === "failure" || status === "reversed" || status === "expired") {
    await db.purchase.updateMany({
      where: { invoiceId },
      data: { status: "canceled" },
    });
  }
  // "created", "processing", "hold" — no action needed

  return NextResponse.json({ status: "ok" });
}
