import { getAllPosts, formatDate } from "@/lib/blog";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import Image from "next/image";
import Link from "next/link";
import { Clock, Tag } from "lucide-react";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-zinc-400">
            Tutorials, deep dives, and practical guides on AI engineering
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-zinc-500">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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
                  {post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

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
      </main>

      <Footer />
    </div>
  );
}
