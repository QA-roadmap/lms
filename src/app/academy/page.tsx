import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveCourseSlugs } from "@/lib/access";
import { getCourses } from "@/lib/sanity";
import { courseLessonCount } from "@/lib/courses";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import type { SanityCourse } from "@/types/sanity";

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

function findNextLesson(course: SanityCourse, completedSlugs: string[]) {
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => !completedSlugs.includes(l.slug));
    if (lesson) return { moduleId: mod._id, slug: lesson.slug, title: lesson.title };
  }
  return null;
}

export default async function AcademyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [courses, activeCourseSlugs, progress] = await Promise.all([
    getCourses(),
    getActiveCourseSlugs(session.user.id),
    db.userProgress.findMany({
      where: { userId: session.user.id },
      select: { courseSlug: true, lessonSlug: true, completedAt: true },
    }),
  ]);

  const purchasedCourses = courses.filter((c) => activeCourseSlugs.has(c.slug));

  const courseProgress = purchasedCourses.map((course) => {
    const courseCompletions = progress.filter((p) => p.courseSlug === course.slug);
    const completedSlugs = courseCompletions.map((p) => p.lessonSlug);
    const totalLessons = courseLessonCount(course);
    const completedCount = course.modules
      .flatMap((m) => m.lessons)
      .filter((l) => completedSlugs.includes(l.slug)).length;
    const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const nextLesson = findNextLesson(course, completedSlugs);
    const lastCompletedAt = courseCompletions.reduce<Date | null>(
      (latest, p) => (!latest || p.completedAt > latest ? p.completedAt : latest),
      null
    );

    return { course, totalLessons, completedCount, progressPct, nextLesson, lastCompletedAt };
  });

  const continueCourse = courseProgress
    .filter((cp) => cp.nextLesson)
    .sort((a, b) => (b.lastCompletedAt?.getTime() ?? 0) - (a.lastCompletedAt?.getTime() ?? 0))[0];
  const nextLesson = continueCourse?.nextLesson;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar host varies by OAuth provider, not in next/image remotePatterns
              <img
                src={session.user.image}
                alt=""
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-zinc-800"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                {getInitials(session.user.name, session.user.email)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                Вітаємо, {session.user.name?.split(" ")[0]}
              </h1>
              <p className="mt-1 text-zinc-500">Твої курси</p>
            </div>
          </div>
          <Link
            href="/courses"
            className="shrink-0 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            Переглянути каталог
          </Link>
        </div>

        {continueCourse && nextLesson && (
          <Link
            href={`/academy/${continueCourse.course.slug}/${nextLesson.moduleId}/${nextLesson.slug}`}
            className="group mb-8 flex items-center justify-between gap-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-5 transition-colors hover:bg-blue-500/15"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Play className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-400">
                  Продовжити навчання
                </p>
                <p className="mt-0.5 truncate font-semibold text-white">
                  {continueCourse.course.title} · {nextLesson.title}
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-blue-400 transition-transform group-hover:translate-x-1" />
          </Link>
        )}

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
            {courseProgress.map(({ course, completedCount, totalLessons, progressPct }) => {
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
