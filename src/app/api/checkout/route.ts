import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCheckout } from "@/lib/hutko";
import { getCourseBySlug } from "@/lib/sanity";

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseSlug } = (await req.json()) as { courseSlug: string };

  const course = await getCourseBySlug(courseSlug);
  const usdPrice = course?.priceUSD;
  if (!course || course.status !== "available" || usdPrice === undefined) {
    return NextResponse.json({ error: "Course not purchasable" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const orderId = `${session.user.id}_${nanoid()}`;
  const rate = Number(process.env.USD_TO_UAH_RATE!);

  const checkout = await createCheckout({
    order_id: orderId,
    order_desc: `${course.title} — Course Access`,
    amount: Math.round(usdPrice * rate * 100),
    server_callback_url: `${baseUrl}/api/hutko/callback`,
    response_url: `${baseUrl}/academy/${courseSlug}?payment=success`,
    merchant_data: JSON.stringify({ userId: session.user.id, courseSlug }),
  });

  return NextResponse.json({ checkoutUrl: checkout.checkout_url });
}
