import { getPost, getAllPosts, formatDate } from "@/lib/blog";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx";
import { auth } from "@/auth";
import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Lock } from "lucide-react";
import type { Metadata } from "next";
import { SITE_NAME, articleSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const images = post.coverImage ? [post.coverImage] : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      siteName: SITE_NAME,
      locale: "uk_UA",
      publishedTime: post.date,
      tags: post.tags,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(images && { images }),
    },
  };
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const session = await auth();
  const hasAccess = !!session?.user;

  return (
    <div className="min-h-screen bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              title: post.title,
              description: post.excerpt,
              slug: post.slug,
              date: post.date,
              image: post.coverImage,
            })
          ),
        }}
      />

      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/blog"
          className="mb-8 flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад до QA Journal
        </Link>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href={`/blog?category=${encodeURIComponent(post.category)}`}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            {post.category}
          </Link>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 text-lg text-zinc-400">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500">
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readingTime}
          </span>
        </div>

        {post.coverImage && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <div className="relative">
          <div
            className={clsx(
              "article-body mt-10",
              !hasAccess && "article-fade max-h-[520px] overflow-hidden"
            )}
          >
            <MDXRemote source={post.content} options={mdxOptions} />
          </div>

          {!hasAccess && (
            <div className="relative z-10 -mt-24 mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl shadow-black/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Lock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Продовжити читання
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Увійдіть, щоб відкрити статтю повністю — безкоштовно і без реклами
                </p>
              </div>
              <GoogleSignInButton redirectTo={`/blog/${slug}`} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
