"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { CheckCircle, Circle, Lock, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import type { SanityModule } from "@/types/sanity";

type Props = {
  courseSlug: string;
  courseTitle: string;
  modules: SanityModule[];
  completedSlugs: string[];
  hasAccess: boolean;
};

export function Sidebar({ courseSlug, courseTitle, modules, completedSlugs, hasAccess }: Props) {
  const pathname = usePathname();
  const [openModule, setOpenModule] = useState<string | null>(
    modules[0]?._id ?? null
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Відкрити зміст курсу"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="truncate text-sm font-semibold text-white">{courseTitle}</span>
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 -translate-x-full flex-col border-r border-zinc-800 bg-zinc-900 transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-full lg:translate-x-0",
          mobileOpen && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="min-w-0">
            <Link href={`/academy/${courseSlug}`} className="block truncate text-sm font-semibold text-white">
              {courseTitle}
            </Link>
            <Link
              href="/academy"
              className="mt-1 block text-xs text-zinc-500 hover:text-zinc-300"
            >
              ← Усі курси
            </Link>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Закрити зміст курсу"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {modules.map((mod) => (
            <div key={mod._id}>
              <button
                onClick={() =>
                  setOpenModule(openModule === mod._id ? null : mod._id)
                }
                className="flex w-full items-center justify-between px-5 py-2.5 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest text-blue-500">
                    {mod.code}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">
                    {mod.title}
                  </span>
                </span>
                <ChevronDown
                  className={clsx(
                    "h-3.5 w-3.5 text-zinc-600 transition-transform",
                    openModule === mod._id && "rotate-180"
                  )}
                />
              </button>

              {openModule === mod._id && (
                <ul className="pb-2">
                  {(mod.lessons ?? []).map((lesson) => {
                    const isCompleted = completedSlugs.includes(lesson.slug);
                    const isActive = pathname.includes(lesson.slug);
                    const isLocked = !lesson.isFree && !hasAccess;

                    return (
                      <li key={lesson.slug}>
                        {isLocked ? (
                          <span className="flex items-center gap-3 px-5 py-2 text-xs text-zinc-600">
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                            {lesson.title}
                          </span>
                        ) : (
                          <Link
                            href={`/academy/${courseSlug}/${mod._id}/${lesson.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                              "flex items-center gap-3 px-5 py-2 text-xs transition-colors",
                              isActive
                                ? "bg-blue-600/10 text-blue-400"
                                : "text-zinc-400 hover:text-zinc-100"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                            )}
                            {lesson.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
