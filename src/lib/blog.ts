export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type PortableTextBlock = { _type?: string; children?: { text?: string }[] };

const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(body: unknown[] = []): string {
  const wordCount = (body as PortableTextBlock[])
    .filter((b) => b._type === "block" && Array.isArray(b.children))
    .flatMap((b) => b.children!.map((c) => c.text ?? ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}
