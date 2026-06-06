"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

const FEATURES = [
  "40+ video lessons",
  "Full source code access",
  "Architecture diagrams",
  "Evaluation playbooks",
  "Verifiable certificate",
  "Discord community",
  "Live Q&A sessions",
  "Lifetime updates",
];

export function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<"lifetime" | "monthly" | null>(null);

  async function handleCheckout(plan: "lifetime" | "monthly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const { checkoutUrl } = (await res.json()) as { checkoutUrl: string };
      window.location.href = checkoutUrl;
    } finally {
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="bg-zinc-950 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, Honest Pricing
          </h2>
          <p className="mt-4 text-zinc-400">
            30-day money-back guarantee. No questions asked.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Monthly */}
          <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <p className="text-sm font-medium text-zinc-400">Monthly</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-white">$39</span>
              <span className="mb-1 text-zinc-500">/month</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Full access, cancel anytime
            </p>

            <ul className="my-8 space-y-3 flex-1">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout("monthly")}
              disabled={loading !== null}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {loading === "monthly" ? "Redirecting…" : "Start Monthly"}
            </button>
          </div>

          {/* Lifetime */}
          <div className="relative flex flex-col rounded-2xl border border-blue-500/50 bg-zinc-900 p-8 shadow-lg shadow-blue-600/10">
            <div className="absolute -top-3 right-6">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                BEST VALUE
              </span>
            </div>

            <p className="text-sm font-medium text-zinc-400">Lifetime</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-white">$197</span>
              <span className="mb-1 text-zinc-500 line-through">$299</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Pay once, own forever</p>

            <ul className="my-8 space-y-3 flex-1">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm font-medium text-blue-400">
                <CheckCircle className="h-4 w-4 shrink-0 text-blue-400" />
                Priority support
              </li>
            </ul>

            <button
              onClick={() => handleCheckout("lifetime")}
              disabled={loading !== null}
              className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading === "lifetime" ? "Redirecting…" : "Get Lifetime Access"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Payments secured via Hutko by ПУМБ bank · SSL encrypted
        </p>
      </div>
    </section>
  );
}
