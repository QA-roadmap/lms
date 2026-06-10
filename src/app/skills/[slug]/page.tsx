import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { BADGES, getAllSkillSlugs, getSkillCardBySlug, getSkillGuide } from "@/lib/skills";
import { SITE_NAME } from "@/lib/seo";
import { extractToc } from "@/lib/toc";
import { TableOfContents } from "@/components/skills/TableOfContents";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSkillSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getSkillCardBySlug(slug);
  if (!card) return {};
  return {
    title: card.title,
    description: card.description,
    alternates: { canonical: `/skills/${slug}` },
    openGraph: {
      type: "article",
      title: card.title,
      description: card.description,
      url: `/skills/${slug}`,
      siteName: SITE_NAME,
      locale: "uk_UA",
    },
    twitter: {
      card: "summary",
      title: card.title,
      description: card.description,
    },
  };
}

export default async function SkillGuidePage({ params }: Props) {
  const { slug } = await params;
  const card = getSkillCardBySlug(slug);
  const guide = card ? getSkillGuide(slug) : null;
  if (!card || !guide) notFound();

  const badge = BADGES[card.badge];
  const toc = extractToc(guide);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12">
        <Link
          href="/skills"
          className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Усі скіли
        </Link>

        <div className="flex gap-12">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>

            <div className="article-body guide-body mt-8">
              <MDXRemote source={guide} options={mdxOptions} />
            </div>
          </div>

          {/* TOC sidebar */}
          {toc.length > 0 && (
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-8">
                <TableOfContents entries={toc} />
              </div>
            </aside>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
