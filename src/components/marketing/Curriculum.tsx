"use client";

import { useState } from "react";
import { MODULES } from "@/data/curriculum";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, Play, Lock } from "lucide-react";
import { clsx } from "clsx";

export function Curriculum() {
  const [openModule, setOpenModule] = useState<string | null>("m1");

  return (
    <section id="curriculum" className="bg-zinc-900/50 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The Full Curriculum
          </h2>
          <p className="mt-4 text-zinc-400">
            6 modules · 40+ lessons · hands-on projects at every stage
          </p>
        </div>

        <div className="space-y-3">
          {MODULES.map((mod) => (
            <div
              key={mod.id}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() =>
                  setOpenModule(openModule === mod.id ? null : mod.id)
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
                    openModule === mod.id && "rotate-180"
                  )}
                />
              </button>

              {openModule === mod.id && (
                <ul className="border-t border-zinc-800">
                  {mod.lessons.map((lesson, i) => (
                    <li
                      key={lesson.slug}
                      className={clsx(
                        "flex items-center justify-between px-6 py-3.5",
                        i !== mod.lessons.length - 1 &&
                          "border-b border-zinc-800/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {lesson.isFree ? (
                          <Play className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-zinc-600" />
                        )}
                        <span className="text-sm text-zinc-300">
                          {lesson.title}
                        </span>
                        {lesson.isCapstone && (
                          <Badge variant="capstone">Capstone</Badge>
                        )}
                        {lesson.isFree && <Badge variant="free">Free</Badge>}
                      </div>
                      <span className="text-xs text-zinc-600">
                        {lesson.duration}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
