import Link from "next/link";
import { BookOpen, Clock, Users, Star } from "lucide-react";
import type { SanityCourse } from "@/types/sanity";
import { courseLessonCount, getCourseDiscount } from "@/lib/courses";

type Props = {
  course: SanityCourse;
};

function totalDurationMinutes(course: SanityCourse): number {
  let total = 0;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.duration) {
        const m = lesson.duration.match(/(\d+)/);
        if (m) total += parseInt(m[1], 10);
      }
    }
  }
  return total;
}

export function CourseHero({ course }: Props) {
  const isAvailable = course.status === "available";
  const discount = getCourseDiscount(course);
  const lessonCount = courseLessonCount(course);
  const durationMin = totalDurationMinutes(course);
  const durationHours = durationMin > 0 ? Math.round(durationMin / 60) : null;

  return (
    <section className="relative overflow-hidden bg-zinc-950 px-4 pb-20 pt-20">
      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="animate-glow-pulse absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="absolute right-0 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Усі курси
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Left: content */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                <span className="text-xs font-medium text-blue-400">
                  {isAvailable ? "Доступний зараз" : "Скоро відкриється"}
                </span>
              </div>
              {isAvailable && discount && discount.discountPct > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-white">
                    Знижка {discount.discountPct}%
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-tight">
              {course.title}
            </h1>

            {course.tagline && (
              <p className="mt-4 text-xl text-zinc-400 leading-relaxed">{course.tagline}</p>
            )}

            {course.description && (
              <p className="mt-4 max-w-xl text-zinc-500 leading-relaxed">{course.description}</p>
            )}

            {/* Stats row */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span><strong className="text-white">{lessonCount}</strong> уроків</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span><strong className="text-white">{course.modules.length}</strong> модулів</span>
              </div>
              {durationHours !== null && durationHours > 0 && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span><strong className="text-white">{durationHours}+</strong> годин відео</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Users className="h-4 w-4 text-blue-500" />
                <span><strong className="text-white">855+</strong> студентів</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span><strong className="text-white">4.9</strong> рейтинг</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              {isAvailable ? (
                <>
                  <a
                    href="#pricing"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
                  >
                    {course.priceUSD !== undefined ? (
                      <>
                        Отримати доступ · ${course.priceUSD}
                        {discount && discount.discountPct > 0 && (
                          <span className="text-blue-200 line-through">${discount.originalPrice}</span>
                        )}
                      </>
                    ) : (
                      "Отримати доступ"
                    )}
                  </a>
                  <a
                    href="#curriculum"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/60 px-6 py-3 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    Переглянути програму
                  </a>
                </>
              ) : (
                <span className="inline-flex cursor-not-allowed rounded-xl border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-600">
                  Скоро з'явиться
                </span>
              )}
            </div>

            {/* Trust strip */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Довічний доступ
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                30 днів гарантія повернення
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Сертифікат після завершення
              </span>
            </div>
          </div>

          {/* Right: floating card */}
          <div className="animate-float hidden lg:block">
            <div className="card-hover-glow relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-2xl">
              {/* Subtle inner glow top */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)" }}
              />
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{course.title}</p>
                  <p className="text-xs text-zinc-500">{course.modules.length} модулів · {lessonCount} уроків</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {course.modules.slice(0, 5).map((mod) => (
                  <div key={mod._id} className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5">
                    <span className="shrink-0 text-[10px] font-bold tracking-widest text-blue-500">{mod.code}</span>
                    <span className="text-xs text-zinc-400 truncate">{mod.title}</span>
                    <span className="ml-auto shrink-0 text-[10px] text-zinc-600">{mod.lessons.length} ур.</span>
                  </div>
                ))}
                {course.modules.length > 5 && (
                  <p className="text-center text-xs text-zinc-600 pt-1">+ ще {course.modules.length - 5} модулів</p>
                )}
              </div>

              {isAvailable && course.priceUSD !== undefined && (
                <a
                  href="#pricing"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-colors hover:bg-blue-500"
                >
                  Отримати доступ · ${course.priceUSD}
                  {discount && discount.discountPct > 0 && (
                    <span className="text-blue-200 line-through">${discount.originalPrice}</span>
                  )}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
