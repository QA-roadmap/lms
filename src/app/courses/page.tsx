import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Badge } from "@/components/ui/Badge";
import { getCourses } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";
import type { SanityCourse } from "@/types/sanity";
import { ArrowRight, Clock } from "lucide-react";

export default async function CoursesPage() {
  const courses: SanityCourse[] = await getCourses();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Обери свій шлях у QA
          </h1>
          <p className="mt-4 text-zinc-400">
            Кожен курс закриває окремий етап шляху в тестуванні — обери той,
            що відповідає твоєму рівню та цілям.
          </p>
        </div>

        <div className="space-y-3">
          {courses.map((course, i) => {
            const lessonCount = courseLessonCount(course);
            const isAvailable = course.status === "available";
            const code = `C${i + 1}`;

            const Card = (
              <div className="flex items-center justify-between gap-6 px-6 py-6">
                <div className="flex items-start gap-4">
                  <span className="pt-0.5 text-xs font-bold tracking-widest text-blue-500">
                    {code}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="font-semibold text-white">{course.title}</p>
                      {isAvailable ? (
                        <Badge variant="free">Доступний</Badge>
                      ) : (
                        <Badge variant="default">Скоро</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{course.tagline}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-zinc-600">
                      <span>
                        {course.modules.length} модулів · {lessonCount} уроків
                      </span>
                      {isAvailable && course.priceUSD && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ${course.priceUSD} одноразово
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-blue-400" />
              </div>
            );

            return (
              <div
                key={course.slug}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                <Link
                  href={`/courses/${course.slug}`}
                  className={`group block transition-colors hover:bg-zinc-800/50 ${
                    isAvailable ? "" : "opacity-60"
                  }`}
                >
                  {Card}
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
