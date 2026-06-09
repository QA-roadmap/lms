"use client";

import { useEffect, useRef, useState } from "react";
import type { TocEntry } from "@/lib/toc";

type Props = { entries: TocEntry[] };

export function TableOfContents({ entries }: Props) {
  const [activeSlug, setActiveSlug] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const slugs = entries.map((e) => e.slug);

    observerRef.current = new IntersectionObserver(
      (observations) => {
        // Pick the topmost heading that is intersecting
        const visible = observations
          .filter((o) => o.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveSlug(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    slugs.forEach((slug) => {
      const el = document.getElementById(slug);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="Зміст">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Зміст
      </p>
      <ul className="space-y-1">
        {entries.map((entry) => {
          const isActive = activeSlug === entry.slug;
          return (
            <li key={entry.slug} className={entry.depth === 3 ? "pl-3" : ""}>
              <a
                href={`#${entry.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(entry.slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={[
                  "block py-0.5 text-sm leading-snug transition-colors duration-150",
                  entry.depth === 3 ? "text-xs" : "",
                  isActive
                    ? "font-medium text-blue-400"
                    : "text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {entry.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
