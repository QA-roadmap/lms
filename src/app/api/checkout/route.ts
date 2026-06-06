import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCheckout } from "@/lib/hutko";

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "lifetime" | "monthly" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const isLifetime = plan === "lifetime";
  const orderId = `${session.user.id}_${nanoid()}`;

  const checkout = await createCheckout({
    order_id: orderId,
    order_desc: isLifetime ? "Lifetime Access" : "Monthly Subscription",
    amount: isLifetime
      ? Number(process.env.HUTKO_LIFETIME_AMOUNT!)
      : Number(process.env.HUTKO_MONTHLY_AMOUNT!),
    server_callback_url: `${baseUrl}/api/hutko/callback`,
    response_url: `${baseUrl}/academy?payment=success`,
    merchant_data: JSON.stringify({ userId: session.user.id, plan }),
    ...(plan === "monthly"
      ? {
          subscription: "Y",
          subscription_callback_url: `${baseUrl}/api/hutko/callback`,
        }
      : {}),
  });

  return NextResponse.json({ checkoutUrl: checkout.checkout_url });
}
