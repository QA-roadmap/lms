import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/sanity";
import { OgCard, ogSize, ogContentType, loadOgFont } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const eyebrow = post?.category ?? "QA Journal";
  const title = post?.title ?? "QA Roadmap";
  const description = post?.excerpt;

  const font = await loadOgFont(`${eyebrow.toUpperCase()}${title}${description ?? ""}qaroadmap.dev`);

  return new ImageResponse(<OgCard eyebrow={eyebrow} title={title} description={description} />, {
    ...size,
    fonts: font ? [{ name: "Inter", data: font, weight: 700, style: "normal" }] : undefined,
  });
}
