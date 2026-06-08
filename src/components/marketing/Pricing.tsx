"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import type { SanityCourse } from "@/types/sanity";

const FEATURES = [
  "Повна бібліотека уроків цього курсу",
  "Практичні завдання та проєкти",
  "Розбір фінального (capstone) проєкту",
  "Спільнота в Discord",
  "Довічний доступ — плати раз, користуйся назавжди",
  "Усі майбутні оновлення курсу включено",
];

type Props = {
  course: SanityCourse;
};

export function Pricing({ course }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (course.priceUSD === undefined) return null;
  const price = course.priceUSD;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: course.slug }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const { checkoutUrl } = (await res.json()) as { checkoutUrl: string };
      window.location.href = checkoutUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="pricing" className="bg-zinc-950 px-4 py-24">
      <div className="mx-auto max-w-lg">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Отримай повний доступ до курсу «{course.title}»
          </h2>
          <p className="mt-4 text-zinc-400">
            Гарантія повернення коштів протягом 30 днів. Без зайвих питань.
          </p>
        </div>

        <div className="relative flex flex-col rounded-2xl border border-blue-500/50 bg-zinc-900 p-8 shadow-lg shadow-blue-600/10">
          <div className="absolute -top-3 right-6">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
              ОДНОРАЗОВИЙ ПЛАТІЖ
            </span>
          </div>

          <p className="text-sm font-medium text-zinc-400">Повний доступ до курсу</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-bold text-white">${price}</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">Плати раз — і курс назавжди твій</p>

          <ul className="my-8 space-y-3 flex-1">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? "Перенаправлення…" : `Отримати доступ · $${price}`}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-600">
          Платежі захищені сервісом Hutko від банку ПУМБ · SSL-шифрування
        </p>
      </div>
    </section>
  );
}
