import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveCourseSlugs } from "@/lib/access";
import { getCourses } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">
            Вітаємо, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-zinc-500">Обери курс, щоб продовжити навчання</p>
        </div>

        <div className="space-y-3">
          {courses.map((course) => {
            const hasAccess = activeCourseSlugs.has(course.slug);
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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{course.title}</p>
                      {!hasAccess && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          <Lock className="h-2.5 w-2.5" />
                          Платний
                        </span>
                      )}
                    </div>
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
      </div>
    </div>
  );
}
