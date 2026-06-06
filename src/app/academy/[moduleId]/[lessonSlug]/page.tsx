import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { getLessonBySlug, MODULES } from "@/data/curriculum";
import { Sidebar } from "@/components/academy/Sidebar";
import { MarkCompleteButton } from "@/components/academy/MarkCompleteButton";
import { Lock } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ moduleId: string; lessonSlug: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { lessonSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const found = getLessonBySlug(lessonSlug);
  if (!found) notFound();

  const { module: mod, lesson } = found;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { progress: true },
  });

  const hasAccess =
    user?.lifetimeAccess || user?.subscriptionStatus === "active";
  const isLocked = !lesson.isFree && !hasAccess;
  const completedSlugs = user?.progress.map((p: { lessonSlug: string }) => p.lessonSlug) ?? [];
  const isCompleted = completedSlugs.includes(lesson.slug);

  const currentIdx = mod.lessons.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = mod.lessons[currentIdx + 1] ?? null;
  const prevLesson = mod.lessons[currentIdx - 1] ?? null;

  return (
    <div className="flex h-screen bg-zinc-950">
      <Sidebar completedSlugs={completedSlugs} hasAccess={hasAccess} />

      <main className="flex flex-1 flex-col overflow-y-auto">
        {isLocked ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
              <Lock className="h-7 w-7 text-zinc-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Premium Lesson
              </h2>
              <p className="mt-2 text-zinc-400">
                Get access to unlock all {40}+ lessons
              </p>
            </div>
            <Link
              href="/#pricing"
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Unlock All Lessons
            </Link>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl px-8 py-10">
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <span>{mod.code}</span>
              <span>·</span>
              <span>{lesson.duration}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>

            {/* Video placeholder */}
            <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              {lesson.videoUrl ? (
                <iframe
                  src={lesson.videoUrl}
                  className="h-full w-full"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-zinc-600">Video coming soon</p>
                </div>
              )}
            </div>

            {/* Mark complete */}
            <div className="mt-6 flex items-center justify-between">
              <MarkCompleteButton
                lessonSlug={lesson.slug}
                userId={session.user.id}
                isCompleted={isCompleted}
              />

              <div className="flex gap-3">
                {prevLesson && !prevLesson.isFree && !hasAccess ? null : prevLesson ? (
                  <Link
                    href={`/academy/${mod.id}/${prevLesson.slug}`}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    ← Previous
                  </Link>
                ) : null}
                {nextLesson && !nextLesson.isFree && !hasAccess ? null : nextLesson ? (
                  <Link
                    href={`/academy/${mod.id}/${nextLesson.slug}`}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                  >
                    Next →
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Content */}
            {lesson.content && (
              <div className="prose prose-invert mt-10 max-w-none">
                <p>{lesson.content}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export async function generateStaticParams() {
  return MODULES.flatMap((mod) =>
    mod.lessons.map((lesson) => ({
      moduleId: mod.id,
      lessonSlug: lesson.slug,
    }))
  );
}
