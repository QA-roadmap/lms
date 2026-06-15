import { ImageResponse } from "next/og";
import { OgCard, ogSize, ogContentType, loadOgFont } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;

const TITLE = "QA Roadmap";
const DESCRIPTION =
  "Курси з тестування ПЗ та автоматизації QA — від основ ручного тестування до Selenium і Playwright";

export default async function Image() {
  const font = await loadOgFont(`qaroadmap.dev${TITLE}${DESCRIPTION}`);

  return new ImageResponse(<OgCard title={TITLE} description={DESCRIPTION} />, {
    ...size,
    fonts: font ? [{ name: "Inter", data: font, weight: 700, style: "normal" }] : undefined,
  });
}
