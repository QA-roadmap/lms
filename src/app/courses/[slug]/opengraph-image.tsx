import { ImageResponse } from "next/og";
import { getCourseBySlug } from "@/lib/sanity";
import { OgCard, ogSize, ogContentType, loadOgFont } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  const eyebrow = "Курс QA Roadmap";
  const title = course?.title ?? "QA Roadmap";
  const description = course?.tagline ?? course?.description;

  const font = await loadOgFont(`${eyebrow.toUpperCase()}${title}${description ?? ""}QARoadmap`);

  return new ImageResponse(<OgCard eyebrow={eyebrow} title={title} description={description} />, {
    ...size,
    fonts: font ? [{ name: "Inter", data: font, weight: 700, style: "normal" }] : undefined,
  });
}
