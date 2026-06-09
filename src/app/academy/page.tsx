import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveCourseSlugs } from "@/lib/access";
import { getCourses } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export default async function AcademyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [courses, activeCourseSlugs, progress] = await Promise.all([
    getCourses(),
    getActiveCourseSlugs(session.user.id),
    db.userProgress.findMany({
      where: { userId: session.user.id },
      select: { courseSlug: true, lessonSlug: true },
    }),
  ]);

  const purchasedCourses = courses.filter((c) => activeCourseSlugs.has(c.slug));

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Вітаємо, {session.user.name?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-zinc-500">Твої курси</p>
          </div>
          <Link
            href="/courses"
            className="shrink-0 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            Переглянути каталог
          </Link>
        </div>

        {purchasedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800">
              <BookOpen className="h-6 w-6 text-zinc-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Ще немає придбаних курсів</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Обери курс у каталозі та отримай довічний доступ
            </p>
            <Link
              href="/courses"
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Переглянути курси
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchasedCourses.map((course) => {
              const completedSlugs = progress
                .filter((p) => p.courseSlug === course.slug)
                .map((p) => p.lessonSlug);
              const totalLessons = courseLessonCount(course);
              const completedCount = course.modules
                .flatMap((m) => m.lessons)
                .filter((l) => completedSlugs.includes(l.slug)).length;
              const progressPct =
                totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

              return (
                <Link
                  key={course._id}
                  href={`/academy/${course.slug}`}
                  className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{course.title}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {completedCount} з {totalLessons} уроків завершено
                      </p>
                      <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-blue-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
