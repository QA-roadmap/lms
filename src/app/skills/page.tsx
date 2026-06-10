import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { SkillsMap } from "@/components/marketing/SkillsMap";

export const metadata: Metadata = {
  title: "Карта навичок QA-інженера",
  description:
    "Які навички реально шукають роботодавці у QA — від основ ручного тестування до AI-інструментів. Пріоритети Must, Key, Bonus та AI-Era.",
  alternates: { canonical: "/skills" },
};

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Скіли QA-тестувальника у 2026
          </h1>
          <p className="mt-4 text-zinc-400">
            Карта навичок, які реально шукають роботодавці — від основ ручного тестування
            до AI-ери. Бейджі показують пріоритет:{" "}
            <span className="text-rose-400">Must</span> — база, без якої не візьмуть,{" "}
            <span className="text-amber-400">Key</span> — конкурентна перевага,{" "}
            <span className="text-sky-400">+Бонус</span> — для росту,{" "}
            <span className="text-emerald-400">AI-Era</span> — новий стандарт 2025–26.
          </p>
        </div>

        <SkillsMap />

        <div className="mt-16 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
          <p className="text-lg font-semibold text-white">
            Хочеш прокачати ці скіли системно, а не збирати по шматках з різних джерел?
          </p>
          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Наші курси покривають весь шлях — від першого тест-кейсу до автоматизації
            та AI-інструментів у тестуванні.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-500"
          >
            Переглянути курси
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
