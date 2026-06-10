"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { clsx } from "clsx";
import { formatDate, type PostMeta } from "@/lib/blog-meta";

const ALL = "Усі";

const CATEGORY_ORDER = [
  "AI & Automation",
  "Інструменти",
  "Методологія",
  "Кар'єра",
  "Основи",
];

export function BlogPostsGrid({
  posts,
  initialCategory,
}: {
  posts: PostMeta[];
  initialCategory?: string;
}) {
  const categories = useMemo(() => {
    const present = new Set(posts.map((p) => p.category));
    const known = CATEGORY_ORDER.filter((c) => present.has(c));
    const rest = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return [ALL, ...known, ...rest];
  }, [posts]);

  const [active, setActive] = useState(() =>
    initialCategory && categories.includes(initialCategory) ? initialCategory : ALL
  );

  const filtered = active === ALL ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((category) => {
          const count =
            category === ALL
              ? posts.length
              : posts.filter((p) => p.category === category).length;
          const isActive = active === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={clsx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              {category}{" "}
              <span className={isActive ? "text-blue-400/60" : "text-zinc-600"}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
            >
              {post.coverImage && (
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                    {post.category}
                  </span>
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-base font-semibold leading-snug text-white group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>

                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="mt-4 flex items-center gap-3 text-xs text-zinc-600">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
