import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getModules } from "@/lib/sanity";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Lock, Play } from "lucide-react";

export default async function AcademyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user, modules] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { progress: true },
    }),
    getModules(),
  ]);

  const hasAccess =
    user?.lifetimeAccess || user?.subscriptionStatus === "active";
  const completedSlugs = user?.progress.map((p: { lessonSlug: string }) => p.lessonSlug) ?? [];
  const totalLessons = modules.reduce((acc: number, m: { lessons: unknown[] }) => acc + (m.lessons?.length ?? 0), 0);
  const completedCount = completedSlugs.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">
            Вітаємо, {session.user.name?.split(" ")[0]}
          </h1>
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
              href="/#pricing"
              className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Отримати доступ
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {modules.map((mod: { _id: string; code: string; title: string; lessons: { slug: string; isFree: boolean; title: string; duration?: string }[] }) => {
            const modCompleted = (mod.lessons ?? []).filter((l) =>
              completedSlugs.includes(l.slug)
            ).length;

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
                    {modCompleted}/{(mod.lessons ?? []).length}
                  </span>
                </div>

                <ul className="space-y-1">
                  {(mod.lessons ?? []).map((lesson) => {
                    const isCompleted = completedSlugs.includes(lesson.slug);
                    const isLocked = !lesson.isFree && !hasAccess;

                    return (
                      <li key={lesson.slug}>
                        {isLocked ? (
                          <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600">
                            <Lock className="h-4 w-4 shrink-0" />
                            {lesson.title}
                          </span>
                        ) : (
                          <Link
                            href={`/academy/${mod._id}/${lesson.slug}`}
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
