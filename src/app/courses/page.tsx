import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CourseTestimonials } from "@/components/marketing/CourseTestimonials";
import { getCourses } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";
import type { SanityCourse } from "@/types/sanity";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Star,
  Users,
  Trophy,
  Zap,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Курси з QA та автоматизації тестування",
  description:
    "Каталог курсів QA Roadmap — ручне тестування, автоматизація на Selenium і Playwright, API-тестування та AI-інструменти для QA-інженерів.",
  alternates: { canonical: "/courses" },
};

function resolveCourseType(course: SanityCourse): "flagship" | "mini" {
  // Once courseType is set in Sanity, use it; otherwise show as flagship
  return course.courseType ?? "flagship";
}

function FlagshipCard({
  course,
  index,
}: {
  course: SanityCourse;
  index: number;
}) {
  const lessonCount = courseLessonCount(course);
  const isAvailable = course.status === "available";
  const code = String(index + 1).padStart(2, "0");

  const accentColors = [
    "from-blue-600 to-violet-600",
    "from-violet-600 to-purple-600",
    "from-emerald-600 to-teal-600",
    "from-amber-600 to-orange-600",
  ];
  const accent = accentColors[index % accentColors.length];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/40">
      {/* Top gradient bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />

      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: content */}
          <div className="flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span
                className={`bg-gradient-to-r ${accent} inline-block bg-clip-text text-xs font-bold tracking-[0.2em] text-transparent`}
              >
                КУРС {code}
              </span>
              {isAvailable ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Доступний
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                  <Clock className="h-3 w-3" /> Скоро
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-white sm:text-2xl">
              {course.title}
            </h3>
            {course.tagline && (
              <p className="mt-2 text-base text-zinc-400">{course.tagline}</p>
            )}

            {/* Stats row */}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-zinc-600" />
                {course.modules.length} модулів
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-zinc-600" />
                {lessonCount} уроків
              </span>
              {isAvailable && course.priceUSD && (
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  ${course.priceUSD}
                  <span className="text-xs font-normal text-zinc-500">
                    одноразово
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex shrink-0 items-center sm:pt-2">
            {isAvailable ? (
              <Link
                href={`/courses/${course.slug}`}
                className={`group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${accent} px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl`}
              >
                Детальніше
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-500">
                <Lock className="h-3.5 w-3.5" />
                Незабаром
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  course,
  index,
}: {
  course: SanityCourse;
  index: number;
}) {
  const lessonCount = courseLessonCount(course);
  const isAvailable = course.status === "available";

  const iconColors = [
    "text-blue-400",
    "text-violet-400",
    "text-emerald-400",
    "text-amber-400",
    "text-rose-400",
    "text-sky-400",
    "text-teal-400",
    "text-orange-400",
    "text-pink-400",
  ];
  const color = iconColors[index % iconColors.length];

  const cardClass = `group block rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 ${
    isAvailable
      ? "hover:border-zinc-600 hover:bg-zinc-800/70"
      : "cursor-default opacity-60"
  }`;

  const inner = (
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`mb-1.5 text-xs font-bold tracking-widest ${color}`}>
            М{String(index + 1).padStart(2, "0")}
          </p>
          <h4 className="font-semibold text-white leading-snug">{course.title}</h4>
          {course.tagline && (
            <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{course.tagline}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
            <span>{course.modules.length} модулів · {lessonCount} ур.</span>
            {isAvailable && course.priceUSD && (
              <span className="font-semibold text-zinc-400">${course.priceUSD}</span>
            )}
            {!isAvailable && (
              <span className="text-zinc-600">Скоро</span>
            )}
          </div>
        </div>
        <ArrowRight
          className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-700 transition-all ${
            isAvailable ? "group-hover:text-zinc-400 group-hover:translate-x-0.5" : ""
          }`}
        />
      </div>
  );

  if (isAvailable) {
    return (
      <Link href={`/courses/${course.slug}`} className={cardClass}>
        {inner}
      </Link>
    );
  }
  return <div className={cardClass}>{inner}</div>;
}

export default async function CoursesPage() {
  const courses: SanityCourse[] = await getCourses();

  const flagship = courses.filter((c) => resolveCourseType(c) === "flagship");
  const mini = courses.filter((c) => resolveCourseType(c) === "mini");

  const totalLessons = courses.reduce(
    (acc, c) => acc + courseLessonCount(c),
    0
  );
  const availableCount = courses.filter((c) => c.status === "available").length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pb-12 pt-16">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <Star className="h-3 w-3 fill-blue-400" />
              Каталог курсів з QA-тестування
            </span>
          </div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Обери свій шлях у QA
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-zinc-400">
            Кожен курс закриває окремий етап шляху в тестуванні — від нуля до
            автоматизації, від джуна до синьйора.
          </p>

          {/* Stats infographic */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                value: `${courses.length}`,
                label: "курсів у каталозі",
                icon: BookOpen,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                value: `${totalLessons}+`,
                label: "уроків загалом",
                icon: Zap,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
                border: "border-violet-500/20",
              },
              {
                value: "855+",
                label: "студентів",
                icon: Users,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                value: "4.9",
                label: "рейтинг курсів",
                icon: Star,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
            ].map(({ value, label, icon: Icon, color, bg, border }) => (
              <div
                key={label}
                className={`flex flex-col items-center rounded-xl border ${border} ${bg} p-4 text-center`}
              >
                <Icon className={`mb-2 h-5 w-5 ${color}`} />
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="mt-0.5 text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Flagship courses ─────────────────────────────────── */}
        {flagship.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 pb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Флагманські курси
                </h2>
                <p className="text-sm text-zinc-500">
                  Повноцінні програми з нуля до результату
                </p>
              </div>
              <div className="ml-auto rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400">
                {flagship.length} курс{flagship.length > 1 ? "и" : ""}
              </div>
            </div>

            <div className="space-y-4">
              {flagship.map((course, i) => (
                <FlagshipCard key={course.slug} course={course} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Mini courses ─────────────────────────────────────── */}
        {mini.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 pb-16">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Міні-курси</h2>
                <p className="text-sm text-zinc-500">
                  Фокусовані практичні модулі з окремих тем
                </p>
              </div>
              <div className="ml-auto rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-400">
                {mini.length} курсів
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mini.map((course, i) => (
                <MiniCard key={course.slug} course={course} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Fallback: if no split data yet, show all as list */}
        {flagship.length === 0 && mini.length === 0 && (
          <section className="mx-auto max-w-5xl px-4 pb-16">
            <div className="space-y-3">
              {courses.map((course, i) => (
                <FlagshipCard key={course.slug} course={course} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Path CTA ─────────────────────────────────────────── */}
        <section className="border-y border-zinc-800 bg-zinc-900/50 px-4 py-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-500">
              Не знаєш з чого почати?
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Починай з флагманського курсу
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-zinc-400">
              Флагманські курси охоплюють весь шлях від теорії до практики.
              Міні-курси — для тих, хто хоче заглибитись в окрему тему.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {flagship
                .filter((c) => c.status === "available")
                .slice(0, 2)
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-blue-500/50 hover:bg-zinc-700"
                  >
                    {c.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────── */}
        <CourseTestimonials />
      </main>

      <Footer />
    </div>
  );
}
