"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULES } from "@/data/curriculum";
import { clsx } from "clsx";
import { CheckCircle, Circle, Lock, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  completedSlugs: string[];
  hasAccess: boolean;
};

export function Sidebar({ completedSlugs, hasAccess }: Props) {
  const pathname = usePathname();
  const [openModule, setOpenModule] = useState<string | null>(
    MODULES[0]?.id ?? null
  );

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <Link href="/" className="text-sm font-bold text-white">
          AI<span className="text-blue-500">Expert</span>
        </Link>
        <Link
          href="/academy"
          className="mt-1 block text-xs text-zinc-500 hover:text-zinc-300"
        >
          ← Dashboard
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {MODULES.map((mod) => (
          <div key={mod.id}>
            <button
              onClick={() =>
                setOpenModule(openModule === mod.id ? null : mod.id)
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
                  openModule === mod.id && "rotate-180"
                )}
              />
            </button>

            {openModule === mod.id && (
              <ul className="pb-2">
                {mod.lessons.map((lesson) => {
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
                          href={`/academy/${mod.id}/${lesson.slug}`}
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
  );
}
