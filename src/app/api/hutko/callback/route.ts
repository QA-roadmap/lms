import { NextRequest, NextResponse } from "next/server";
import { validateCallback } from "@/lib/hutko";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;

  const isValid = validateCallback(body, process.env.HUTKO_SECRET_KEY!);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { order_status, merchant_data } = body as {
    order_status: string;
    merchant_data: string;
  };

  let meta: { userId: string; courseSlug: string };
  try {
    meta = JSON.parse(merchant_data);
  } catch {
    return NextResponse.json({ error: "Bad merchant_data" }, { status: 400 });
  }

  const purchaseKey = { userId: meta.userId, courseSlug: meta.courseSlug };

  if (order_status === "approved") {
    await db.purchase.upsert({
      where: { userId_courseSlug: purchaseKey },
      create: { ...purchaseKey, status: "active" },
      update: { status: "active" },
    });
  } else if (
    order_status === "declined" ||
    order_status === "expired" ||
    order_status === "reversed"
  ) {
    await db.purchase.updateMany({
      where: purchaseKey,
      data: { status: "canceled" },
    });
  }

  return NextResponse.json({ status: "ok" });
}
