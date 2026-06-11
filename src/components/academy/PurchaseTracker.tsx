"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

type Props = {
  courseSlug: string;
  courseTitle: string;
  priceUSD: number;
};

/**
 * Fires a GTM "purchase" event once after the Monobank checkout redirect
 * (`?payment=success`), then strips the query param so refreshes don't refire it.
 */
export function PurchaseTracker({ courseSlug, courseTitle, priceUSD }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("payment") !== "success") return;

    const dedupeKey = `purchase_tracked_${courseSlug}`;
    if (!sessionStorage.getItem(dedupeKey)) {
      sessionStorage.setItem(dedupeKey, "1");
      sendGTMEvent({
        event: "purchase",
        ecommerce: {
          transaction_id: `${courseSlug}_${Date.now()}`,
          currency: "USD",
          value: priceUSD,
          items: [{ item_id: courseSlug, item_name: courseTitle, price: priceUSD, quantity: 1 }],
        },
      });
    }

    router.replace(pathname);
  }, [searchParams, pathname, router, courseSlug, courseTitle, priceUSD]);

  return null;
}
