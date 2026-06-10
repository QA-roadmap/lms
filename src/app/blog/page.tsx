import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { BlogPostsGrid } from "@/components/blog/BlogPostsGrid";

export const metadata: Metadata = {
  title: "QA Journal — статті та гайди для QA-інженерів",
  description:
    "Статті, гайди та практичні поради для QA-інженерів — від основ тестування до AI-інструментів.",
  alternates: { canonical: "/blog" },
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const posts = getAllPosts();
  const { category } = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            QA Journal
          </h1>
          <p className="mt-3 text-zinc-400">
            Статті, гайди та практичні поради для QA-інженерів — від основ тестування
            до AI-інструментів
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-zinc-500">No posts yet. Check back soon.</p>
        ) : (
          <BlogPostsGrid posts={posts} initialCategory={category} />
        )}
      </main>

      <Footer />
    </div>
  );
}
