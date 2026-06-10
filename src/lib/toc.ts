import GithubSlugger from "github-slugger";

export type TocEntry = {
  text: string;
  slug: string;
};

/** Extracts H2 headings from raw markdown source.
 *  Slugs are generated with github-slugger — the same algorithm rehype-slug uses,
 *  so TOC anchor hrefs (#slug) always match the rendered heading ids. */
export function extractToc(source: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];

  for (const line of source.split("\n")) {
    const match = line.match(/^## (.+)/);
    if (!match) continue;

    const text = match[1].trim().replace(/\*\*/g, "");
    entries.push({ text, slug: slugger.slug(text) });
  }

  return entries;
}
