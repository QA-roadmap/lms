import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "@/lib/mdx";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { BADGES, getAllSkillSlugs, getSkillCardBySlug, getSkillGuide } from "@/lib/skills";

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
  };
}

export default async function SkillGuidePage({ params }: Props) {
  const { slug } = await params;
  const card = getSkillCardBySlug(slug);
  const guide = card ? getSkillGuide(slug) : null;
  if (!card || !guide) notFound();

  const badge = BADGES[card.badge];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/skills"
          className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Усі скіли
        </Link>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>

        <div className="article-body guide-body mt-8">
          <MDXRemote source={guide} options={mdxOptions} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
