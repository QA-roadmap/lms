#!/usr/bin/env node
// Converts content/blog/*.mdx (frontmatter + Markdown) -> Sanity `post` documents
// (Portable Text body) and uploads them via createOrReplace.
//
// Usage:
//   node scripts/migrate-blog-to-sanity.mjs --dry-run   # preview Portable Text, no network
//   node scripts/migrate-blog-to-sanity.mjs             # write to the production dataset

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const BLOG_DIR = path.join(__dirname, "../content/blog");
const SANITY_PROJECT = "vprlxx2h";
const SANITY_DATASET = "production";
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

const DRY_RUN = process.argv.includes("--dry-run");

if (!DRY_RUN && !SANITY_TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env");
  process.exit(1);
}

// ── key generator ────────────────────────────────────────────────────────

let seq = 0;
const k = () => `k${seq++}`;

// ── inline markdown -> Portable Text spans ─────────────────────────────────

function matchDelim(text, i, delim) {
  if (!text.startsWith(delim, i)) return null;
  const end = text.indexOf(delim, i + delim.length);
  if (end === -1) return null;
  const inner = text.slice(i + delim.length, end);
  if (!inner) return null;
  return { inner, end: end + delim.length };
}

// Supports **bold**, *italic*, `code`, and [text](url) (incl. nested marks inside
// link text, e.g. [**bold link**](url)). Underscore emphasis (_x_ / __x__) is
// intentionally NOT treated as markup, since this content uses underscores in
// snake_case identifiers (SQL columns, API params, etc.) far more often than emphasis.
function parseInline(text) {
  const spans = [];
  const markDefs = [];
  let buf = "";
  let i = 0;

  const flush = () => {
    if (buf) spans.push({ _type: "span", _key: k(), text: buf, marks: [] });
    buf = "";
  };

  const addMarked = (inner, mark) => {
    const sub = parseInline(inner);
    markDefs.push(...sub.markDefs);
    for (const s of sub.spans) {
      spans.push({ ...s, marks: [...s.marks, mark] });
    }
  };

  while (i < text.length) {
    const bold = matchDelim(text, i, "**");
    if (bold) {
      flush();
      addMarked(bold.inner, "strong");
      i = bold.end;
      continue;
    }

    const code = matchDelim(text, i, "`");
    if (code) {
      flush();
      spans.push({ _type: "span", _key: k(), text: code.inner, marks: ["code"] });
      i = code.end;
      continue;
    }

    if (text[i] === "*") {
      const em = matchDelim(text, i, "*");
      if (em) {
        flush();
        addMarked(em.inner, "em");
        i = em.end;
        continue;
      }
    }

    if (text[i] === "[") {
      const close = text.indexOf("]", i + 1);
      if (close !== -1 && text[close + 1] === "(") {
        const closeParen = text.indexOf(")", close + 2);
        if (closeParen !== -1) {
          flush();
          const linkText = text.slice(i + 1, close);
          const href = text.slice(close + 2, closeParen);
          const lk = `lnk${k()}`;
          markDefs.push({ _type: "link", _key: lk, href });
          addMarked(linkText, lk);
          i = closeParen + 1;
          continue;
        }
      }
    }

    buf += text[i];
    i++;
  }
  flush();
  return { spans, markDefs };
}

// Strips markdown formatting down to plain text — used for @sanity/table cells,
// which only support plain strings.
function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

// ── block-level markdown -> Portable Text blocks ────────────────────────────

function isFenceStart(line) {
  return /^```/.test(line.trim());
}
function isHr(line) {
  return /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim());
}
function headingMatch(line) {
  return line.trim().match(/^(#{1,6})\s+(.*)$/);
}
function isBlockquote(line) {
  return /^>\s?/.test(line.trim());
}
function bulletMatch(line) {
  return line.match(/^\s{0,3}[-*+]\s+(.*)$/);
}
function numberMatch(line) {
  return line.match(/^\s{0,3}\d+\.\s+(.*)$/);
}
function isTableRow(line) {
  return /^\s*\|/.test(line);
}
function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line.trim());
}
function isSpecialLine(line, lines, i) {
  return (
    headingMatch(line) ||
    isFenceStart(line) ||
    isHr(line) ||
    isBlockquote(line) ||
    bulletMatch(line) ||
    numberMatch(line) ||
    (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
  );
}

function makeBlock(style, text) {
  const { spans, markDefs } = parseInline(text.trim());
  if (!spans.length) return null;
  return { _type: "block", _key: k(), style, children: spans, markDefs };
}

function makeListItem(text, listItem) {
  const b = makeBlock("normal", text);
  if (!b) return null;
  b.listItem = listItem;
  b.level = 1;
  return b;
}

function splitTableRow(line) {
  let cells = line.trim();
  if (cells.startsWith("|")) cells = cells.slice(1);
  if (cells.endsWith("|")) cells = cells.slice(0, -1);
  return cells.split("|").map((c) => stripMarkdown(c.trim()));
}

function convertMarkdown(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    // fenced code block
    if (isFenceStart(line)) {
      const lang = trimmed.slice(3).trim() || "text";
      const code = [];
      i++;
      while (i < lines.length && !isFenceStart(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ _type: "code", _key: k(), language: lang, code: code.join("\n") });
      continue;
    }

    // horizontal rule
    if (isHr(line)) {
      i++;
      continue;
    }

    // heading
    const h = headingMatch(line);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/\s+#+\s*$/, "");
      i++;
      // The very first heading is the post title (duplicated from frontmatter) — skip it.
      // Any later H1 is a real section heading, mapped down to h2 (the largest body style).
      if (level === 1 && blocks.length === 0) continue;
      const style = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
      const b = makeBlock(style, text);
      if (b) blocks.push(b);
      continue;
    }

    // blockquote
    if (isBlockquote(line)) {
      const quote = [];
      while (i < lines.length && isBlockquote(lines[i])) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const b = makeBlock("blockquote", quote.join(" "));
      if (b) blocks.push(b);
      continue;
    }

    // GFM table
    if (isTableRow(line) && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitTableRow(line);
      i += 2; // header + separator
      const rows = [{ _type: "tableRow", _key: k(), cells: header }];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push({ _type: "tableRow", _key: k(), cells: splitTableRow(lines[i]) });
        i++;
      }
      blocks.push({ _type: "table", _key: k(), rows });
      continue;
    }

    // bullet list
    const bullet = bulletMatch(line);
    if (bullet) {
      while (i < lines.length) {
        const m = bulletMatch(lines[i]);
        if (!m) break;
        let text = m[1];
        i++;
        while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i], lines, i)) {
          text += " " + lines[i].trim();
          i++;
        }
        const b = makeListItem(text, "bullet");
        if (b) blocks.push(b);
      }
      continue;
    }

    // numbered list
    const numbered = numberMatch(line);
    if (numbered) {
      while (i < lines.length) {
        const m = numberMatch(lines[i]);
        if (!m) break;
        let text = m[1];
        i++;
        while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i], lines, i)) {
          text += " " + lines[i].trim();
          i++;
        }
        const b = makeListItem(text, "number");
        if (b) blocks.push(b);
      }
      continue;
    }

    // paragraph
    {
      const para = [line.trim()];
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !isSpecialLine(lines[i], lines, i)) {
        para.push(lines[i].trim());
        i++;
      }
      const b = makeBlock("normal", para.join(" "));
      if (b) blocks.push(b);
    }
  }

  return blocks;
}

// ── load + convert all posts ─────────────────────────────────────────────

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

const posts = files.map((file) => {
  const slug = file.replace(/\.mdx$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  const { data, content } = matter(raw);

  const publishedAt = (data.date instanceof Date ? data.date : new Date(data.date)).toISOString();
  const body = convertMarkdown(content);

  return {
    _id: `post-${slug}`,
    _type: "post",
    title: data.title,
    slug: { _type: "slug", current: slug },
    excerpt: data.description ?? "",
    category: data.category ?? "",
    tags: data.tags ?? [],
    publishedAt,
    body,
  };
});

// ── dry run: print a summary + first post's full body for inspection ────────

if (DRY_RUN) {
  for (const post of posts) {
    const tableCount = post.body.filter((b) => b._type === "table").length;
    const codeCount = post.body.filter((b) => b._type === "code").length;
    console.log(
      `${post.slug.current.padEnd(38)} blocks=${String(post.body.length).padEnd(4)} tables=${tableCount} code=${codeCount} publishedAt=${post.publishedAt}`
    );
  }

  const sample = process.argv[process.argv.length - 1];
  const target = posts.find((p) => p.slug.current === sample) ?? posts[0];
  console.log(`\n--- Full Portable Text body for "${target.slug.current}" ---`);
  console.log(JSON.stringify(target, null, 2));
  process.exit(0);
}

// ── upload ────────────────────────────────────────────────────────────────

const mutations = posts.map((doc) => ({ createOrReplace: doc }));
const body = JSON.stringify({ mutations });

const options = {
  hostname: `${SANITY_PROJECT}.api.sanity.io`,
  path: `/v1/data/mutate/${SANITY_DATASET}`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SANITY_TOKEN}`,
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (c) => (data += c));
  res.on("end", () => {
    if (res.statusCode === 200) {
      console.log(`Successfully uploaded ${posts.length} posts to Sanity:`);
      for (const post of posts) console.log(`  - ${post.slug.current} (${post._id})`);
    } else {
      console.error(`Sanity API error (${res.statusCode}):`, data);
      process.exit(1);
    }
  });
});
req.on("error", (e) => console.error("Request error:", e));
req.write(body);
req.end();
