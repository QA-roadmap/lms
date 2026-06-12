"use client";

import { useState } from "react";
import Link from "next/link";
import { SanityModule } from "@/types/sanity";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, Play, Lock } from "lucide-react";
import { clsx } from "clsx";

export function ModuleAccordion({
  courseSlug,
  modules,
  defaultOpenId = null,
}: {
  courseSlug: string;
  modules: SanityModule[];
  defaultOpenId?: string | null;
}) {
  const [openModule, setOpenModule] = useState<string | null>(defaultOpenId);

  return (
    <div className="space-y-3">
      {modules.map((mod) => (
        <div
          key={mod._id}
          className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
        >
          <button
            className="flex w-full items-center justify-between px-6 py-5 text-left"
            onClick={() =>
              setOpenModule(openModule === mod._id ? null : mod._id)
            }
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold tracking-widest text-blue-500">
                {mod.code}
              </span>
              <div>
                <p className="font-semibold text-white">{mod.title}</p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {mod.description}
                </p>
              </div>
            </div>
            <ChevronDown
              className={clsx(
                "h-4 w-4 shrink-0 text-zinc-500 transition-transform",
                openModule === mod._id && "rotate-180"
              )}
            />
          </button>

          {openModule === mod._id && (
            <ul className="border-t border-zinc-800">
              {mod.lessons.map((lesson, i) => (
                <li
                  key={lesson._id}
                  className={clsx(
                    i !== mod.lessons.length - 1 &&
                      "border-b border-zinc-800/60"
                  )}
                >
                  {lesson.isFree ? (
                    <Link
                      href={`/academy/${courseSlug}/${mod._id}/${lesson.slug}`}
                      className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-zinc-800/60"
                    >
                      <div className="flex items-center gap-3">
                        <Play className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-sm text-zinc-300">
                          {lesson.title}
                        </span>
                        {lesson.isCapstone && (
                          <Badge variant="capstone">Capstone</Badge>
                        )}
                        <Badge variant="free">Free</Badge>
                      </div>
                      <span className="text-xs text-zinc-600">
                        {lesson.duration}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Lock className="h-3.5 w-3.5 text-zinc-600" />
                        <span className="text-sm text-zinc-300">
                          {lesson.title}
                        </span>
                        {lesson.isCapstone && (
                          <Badge variant="capstone">Capstone</Badge>
                        )}
                      </div>
                      <span className="text-xs text-zinc-600">
                        {lesson.duration}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
