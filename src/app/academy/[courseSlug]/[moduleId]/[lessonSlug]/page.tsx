import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getActiveCourseSlugs } from "@/lib/access";
import { getLessonPreview, getCourseBySlugPreview } from "@/lib/sanity";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/academy/Sidebar";
import { MarkCompleteButton } from "@/components/academy/MarkCompleteButton";
import { PortableTextContent } from "@/components/PortableTextContent";
import { Lock } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ courseSlug: string; moduleId: string; lessonSlug: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { courseSlug, moduleId, lessonSlug } = await params;
  const session = await auth();

  const [lesson, course] = await Promise.all([
    getLessonPreview(lessonSlug),
    getCourseBySlugPreview(courseSlug),
  ]);

  if (!lesson || !course) notFound();

  const mod = course.modules.find((m) => m._id === moduleId);
  if (!mod) notFound();

  if (!lesson.isFree && !session?.user?.id) redirect("/sign-in");

  let activeCourseSlugs = new Set<string>();
  let progress: { lessonSlug: string }[] = [];
  if (session?.user?.id) {
    [activeCourseSlugs, progress] = await Promise.all([
      getActiveCourseSlugs(session.user.id),
      db.userProgress.findMany({
        where: { userId: session.user.id, courseSlug },
        select: { lessonSlug: true },
      }),
    ]);
  }

  const hasAccess = activeCourseSlugs.has(course.slug);
  const isLocked = !lesson.isFree && !hasAccess;
  const completedSlugs = progress.map((p) => p.lessonSlug);
  const isCompleted = completedSlugs.includes(lesson.slug);

  const modLessons = mod.lessons;
  const currentIdx = modLessons.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = modLessons[currentIdx + 1] ?? null;
  const prevLesson = modLessons[currentIdx - 1] ?? null;

  return (
    <div className="flex h-screen flex-col bg-zinc-950 lg:flex-row">
      <Sidebar
        courseSlug={course.slug}
        courseTitle={course.title}
        modules={course.modules}
        completedSlugs={completedSlugs}
        hasAccess={hasAccess}
      />

      <main className="flex flex-1 flex-col overflow-y-auto">
        {isLocked ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
              <Lock className="h-7 w-7 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Платний урок</h2>
              <p className="mt-2 text-zinc-400">
                Отримай доступ щоб переглянути всі уроки
              </p>
            </div>
            <Link
              href={`/courses/${course.slug}#pricing`}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Відкрити всі уроки
            </Link>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-4xl">
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <span>{mod.code}</span>
                <span>·</span>
                <span>{lesson.duration}</span>
              </div>
              <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
            </div>

            {lesson.videoUrl ? (
              <>
                <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                  <iframe
                    src={lesson.videoUrl}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
                {lesson.presentationUrl && (
                  <a
                    href={lesson.presentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    📄 Переглянути презентацію
                  </a>
                )}
              </>
            ) : lesson.presentationUrl ? (
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                <iframe src={lesson.presentationUrl} className="h-full w-full" />
              </div>
            ) : null}

            <div className="mx-auto max-w-4xl">
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {session?.user?.id ? (
                  <MarkCompleteButton
                    courseSlug={course.slug}
                    lessonSlug={lesson.slug}
                    userId={session.user.id}
                    isCompleted={isCompleted}
                  />
                ) : (
                  <Link
                    href="/sign-in"
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Увійти, щоб відстежувати прогрес
                  </Link>
                )}

                <div className="flex gap-3">
                  {prevLesson && (
                    <Link
                      href={`/academy/${course.slug}/${moduleId}/${prevLesson.slug}`}
                      className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-center text-sm text-zinc-400 hover:text-white transition-colors sm:flex-none"
                    >
                      ← Попередній
                    </Link>
                  )}
                  {nextLesson && (hasAccess || nextLesson.isFree) && (
                    <Link
                      href={`/academy/${course.slug}/${moduleId}/${nextLesson.slug}`}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-500 transition-colors sm:flex-none"
                    >
                      Наступний →
                    </Link>
                  )}
                </div>
              </div>

              {lesson.content && (
                <div className="mt-10">
                  <PortableTextContent content={lesson.content as import("@portabletext/types").TypedObject[]} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
