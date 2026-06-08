import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveCourseSlugs } from "@/lib/access";
import { getCourseBySlug } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Lock, Play } from "lucide-react";

type Props = {
  params: Promise<{ courseSlug: string }>;
};

export default async function CourseDashboardPage({ params }: Props) {
  const { courseSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [course, activeCourseSlugs, progress] = await Promise.all([
    getCourseBySlug(courseSlug),
    getActiveCourseSlugs(session.user.id),
    db.userProgress.findMany({
      where: { userId: session.user.id, courseSlug },
      select: { lessonSlug: true },
    }),
  ]);

  if (!course) notFound();

  const hasAccess = activeCourseSlugs.has(course.slug);
  const completedSlugs = progress.map((p) => p.lessonSlug);
  const totalLessons = courseLessonCount(course);
  const completedCount = course.modules
    .flatMap((m) => m.lessons)
    .filter((l) => completedSlugs.includes(l.slug)).length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/academy"
          className="text-sm text-zinc-500 hover:text-white transition-colors"
        >
          ← Усі курси
        </Link>

        <div className="mt-6 mb-10">
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <p className="mt-1 text-zinc-500">
            {completedCount} з {totalLessons} уроків завершено
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {!hasAccess && (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4">
            <p className="text-sm text-amber-300">
              Доступні лише безкоштовні уроки. Відкрий всі {totalLessons} уроків.
            </p>
            <Link
              href={`/courses/${course.slug}#pricing`}
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Отримати доступ
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {course.modules.map((mod) => {
            const modCompleted = mod.lessons.filter((l) => completedSlugs.includes(l.slug)).length;

            return (
              <div
                key={mod._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold tracking-widest text-blue-500">
                      {mod.code}
                    </span>
                    <h2 className="font-semibold text-white">{mod.title}</h2>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {modCompleted}/{mod.lessons.length}
                  </span>
                </div>

                <ul className="space-y-1">
                  {mod.lessons.map((lesson) => {
                    const isCompleted = completedSlugs.includes(lesson.slug);
                    const isLocked = !lesson.isFree && !hasAccess;

                    return (
                      <li key={lesson._id}>
                        {isLocked ? (
                          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600">
                            <Lock className="h-4 w-4 shrink-0" />
                            {lesson.title}
                          </span>
                        ) : (
                          <Link
                            href={`/academy/${course.slug}/${mod._id}/${lesson.slug}`}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                            ) : (
                              <Play className="h-4 w-4 shrink-0 text-zinc-600" />
                            )}
                            {lesson.title}
                            <span className="ml-auto text-xs text-zinc-600">
                              {lesson.duration}
                            </span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
