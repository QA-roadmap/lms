import { NextRequest, NextResponse } from "next/server";
import { validateCallback } from "@/lib/hutko";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;

  const isValid = validateCallback(body, process.env.HUTKO_SECRET_KEY!);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { order_status, merchant_data, order_id, subscription_id } = body as {
    order_status: string;
    merchant_data: string;
    order_id: string;
    subscription_id?: string;
  };

  let meta: { userId: string; plan: "lifetime" | "monthly" };
  try {
    meta = JSON.parse(merchant_data);
  } catch {
    return NextResponse.json({ error: "Bad merchant_data" }, { status: 400 });
  }

  if (order_status === "approved") {
    if (meta.plan === "lifetime") {
      await db.user.update({
        where: { id: meta.userId },
        data: { lifetimeAccess: true },
      });
    } else if (meta.plan === "monthly") {
      await db.user.update({
        where: { id: meta.userId },
        data: {
          subscriptionStatus: "active",
          subscriptionId: subscription_id ?? order_id,
        },
      });
    }
  } else if (
    order_status === "declined" ||
    order_status === "expired" ||
    order_status === "reversed"
  ) {
    await db.user.update({
      where: { id: meta.userId },
      data: { subscriptionStatus: "canceled" },
    });
  }

  return NextResponse.json({ status: "ok" });
}
