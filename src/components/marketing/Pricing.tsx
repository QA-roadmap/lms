"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Zap } from "lucide-react";
import type { SanityCourse } from "@/types/sanity";

const FEATURES = [
  "Повна бібліотека уроків цього курсу",
  "Практичні завдання та реальні проєкти",
  "Розбір фінального (capstone) проєкту",
  "Спільнота в Discord з менторами",
  "Довічний доступ — плати раз, назавжди твій",
  "Усі майбутні оновлення курсу включено",
  "Сертифікат для резюме та LinkedIn",
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
    <section id="pricing" className="relative overflow-hidden bg-zinc-950 px-4 py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-glow-pulse absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
            Ціна
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Один платіж — доступ назавжди
          </h2>
          <p className="mt-4 text-zinc-400">
            Гарантія повернення коштів протягом 30 днів. Без зайвих питань.
          </p>
        </div>

        {/* Pricing card */}
        <div className="animate-border-glow relative overflow-hidden rounded-2xl border border-blue-500/40 bg-zinc-900 shadow-2xl shadow-blue-600/10">
          {/* Top shimmer line */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)" }}
          />

          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-blue-600/40">
              <Zap className="h-3 w-3" />
              НАЙКРАЩИЙ ВИБІР
            </span>
          </div>

          <div className="p-8 pt-10">
            <p className="text-sm font-medium text-zinc-400">{course.title}</p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-5xl font-bold tracking-tight text-white">${price}</span>
              <div className="mb-1 text-sm text-zinc-500">
                <p>одноразовий</p>
                <p>платіж</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-zinc-500">≈ {Math.round(price * 41)} грн за поточним курсом</p>

            <ul className="my-8 space-y-3">
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
              className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 disabled:opacity-50"
            >
              <span className="relative z-10">
                {loading ? "Перенаправлення…" : `Отримати доступ · $${price}`}
              </span>
            </button>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL-шифрування
              </span>
              <span>·</span>
              <span>Hutko від ПУМБ</span>
              <span>·</span>
              <span>30 днів повернення</span>
            </div>
          </div>
        </div>

        {/* Social proof under card */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["ОТ","АМ","ЮК","МІ","КБ"].map((init, i) => (
              <div
                key={init}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 text-[10px] font-bold text-white"
                style={{ background: ["#2563eb","#7c3aed","#059669","#d97706","#e11d48"][i] }}
              >
                {init}
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500">
            Приєднуйся до <strong className="text-zinc-300">855+ студентів</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
