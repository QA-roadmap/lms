"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Zap, Shield, Clock } from "lucide-react";
import type { SanityCourse } from "@/types/sanity";
import { getCourseDiscount } from "@/lib/courses";

const FEATURES = [
  "Миттєвий доступ до всіх уроків — без очікування",
  "Пишеш реальні AI-тести з LLM та агентами",
  "Capstone-проєкт: збираєш автономного QA-агента",
  "Discord-спільнота: ментори, відповіді, нетворк",
  "Всі майбутні оновлення курсу без доплат",
  "Сертифікат для LinkedIn та резюме",
  "Довічний доступ — платиш раз, дивишся завжди",
];

type Props = {
  course: SanityCourse;
  hasPurchased?: boolean;
};

export function Pricing({ course, hasPurchased }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const discount = getCourseDiscount(course);
  if (!discount) return null;
  const { price, originalPrice, discountPct } = discount;
  const uahPrice = Math.round(price * 41);

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
    <section id="pricing" className="relative overflow-hidden bg-zinc-950 px-4 py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-glow-pulse absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-xl">
        {/* Section header */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            Спеціальна пропозиція
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Один платіж —{" "}
            <span className="text-blue-400">кар'єра назавжди</span>
          </h2>
          <p className="mt-4 text-zinc-400">
            Навчись тестувати з AI зараз — поки це ще конкурентна перевага, а не вимога.
          </p>
        </div>

        {/* Discount badge — above card, no clipping */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-blue-600/40">
            <Zap className="h-3 w-3" />
            Знижка {discountPct}% — обмежена пропозиція
          </span>
        </div>

        {/* Pricing card */}
        <div className="animate-border-glow relative overflow-hidden rounded-2xl border border-blue-500/40 bg-zinc-900 shadow-2xl shadow-blue-600/10">
          {/* Top shimmer line */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)" }}
          />

          <div className="p-8">
            {/* Course title */}
            <p className="text-sm font-medium text-zinc-400">{course.title}</p>

            {/* Price block */}
            <div className="mt-3 flex items-start gap-4">
              <div>
                <p className="text-sm text-zinc-500 line-through">${originalPrice}</p>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold tracking-tight text-white">${price}</span>
                  <div className="mb-1 text-sm text-zinc-500">
                    <p>одноразовий</p>
                    <p>платіж</p>
                  </div>
                </div>
              </div>
              <span className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm font-bold text-emerald-400">
                −{discountPct}%
              </span>
            </div>
            <p className="mt-1.5 text-sm text-zinc-500">
              ≈ {uahPrice.toLocaleString("uk-UA")} грн за поточним курсом
            </p>

            {/* Divider */}
            <div className="my-6 border-t border-zinc-800" />

            {/* Features */}
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={handleCheckout}
              disabled={loading || hasPurchased}
              className="group relative mt-8 w-full overflow-hidden rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 disabled:cursor-default disabled:opacity-60"
            >
              <span className="relative z-10">
                {hasPurchased
                  ? "Доступ вже є — відкрити курс"
                  : loading
                  ? "Перенаправлення…"
                  : `Отримати доступ · $${price}`}
              </span>
            </button>

            {/* Urgency note */}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-amber-400/80">
              <Clock className="h-3 w-3" />
              Ціна дійсна до закриття набору першої групи
            </p>

            {/* Trust row */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                SSL-шифрування
              </span>
              <span>·</span>
              <span>monobank</span>
              <span>·</span>
              <span>30 днів повернення</span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["ОТ", "АМ", "ЮК", "МІ", "КБ"].map((init, i) => (
              <div
                key={init}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 text-[10px] font-bold text-white"
                style={{ background: ["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"][i] }}
              >
                {init}
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            Вже навчається <strong className="text-zinc-300">855+ студентів</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
