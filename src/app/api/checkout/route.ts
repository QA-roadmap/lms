import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createInvoice } from "@/lib/monobank";
import { getCourseBySlug } from "@/lib/sanity";
import { db } from "@/lib/db";

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  try {
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const rate = Number(process.env.USD_TO_UAH_RATE);

    if (!baseUrl) return NextResponse.json({ error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });
    if (!rate || isNaN(rate)) return NextResponse.json({ error: "Missing or invalid USD_TO_UAH_RATE" }, { status: 500 });
    if (!process.env.MONOBANK_TOKEN) return NextResponse.json({ error: "Missing MONOBANK_TOKEN" }, { status: 500 });

    const amountKopecks = Math.round(usdPrice * rate * 100);
    const reference = `${session.user.id}_${nanoid()}`;

    const invoice = await createInvoice({
      amount: amountKopecks,
      reference,
      destination: `${course.title} — доступ до курсу`,
      redirectUrl: `${baseUrl}/academy/${courseSlug}?payment=success`,
      webHookUrl: `${baseUrl}/api/monobank/webhook`,
    });

    // Upsert a pending Purchase so the webhook can resolve userId + courseSlug from invoiceId
    await db.purchase.upsert({
      where: { userId_courseSlug: { userId: session.user.id, courseSlug } },
      create: {
        userId: session.user.id,
        courseSlug,
        status: "pending",
        invoiceId: invoice.invoiceId,
      },
      update: {
        status: "pending",
        invoiceId: invoice.invoiceId,
      },
    });

    return NextResponse.json({ checkoutUrl: invoice.pageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
