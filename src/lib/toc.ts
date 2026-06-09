import GithubSlugger from "github-slugger";

export type TocEntry = {
  depth: 2 | 3;
  text: string;
  slug: string;
};

/** Extracts H2 and H3 headings from raw markdown source.
 *  Slugs are generated with github-slugger — the same algorithm rehype-slug uses,
 *  so TOC anchor hrefs (#slug) always match the rendered heading ids. */
export function extractToc(source: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];

  for (const line of source.split("\n")) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const match = h2 ?? h3;
    if (!match) continue;

    const text = match[1].trim().replace(/\*\*/g, "");
    entries.push({ depth: h2 ? 2 : 3, text, slug: slugger.slug(text) });
  }

  return entries;
}
