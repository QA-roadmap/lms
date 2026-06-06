import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  coverImage?: string;
  readingTime: string;
};

export type Post = PostMeta & {
  content: string;
};

function slugFromFile(filename: string) {
  return filename.replace(/\.mdx?$/, "");
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: slugFromFile(filename),
        title: data.title as string,
        excerpt: data.excerpt as string,
        date: data.date as string,
        tags: (data.tags as string[]) ?? [],
        coverImage: data.coverImage as string | undefined,
        readingTime: readingTime(content).text,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const fallback = path.join(BLOG_DIR, `${slug}.md`);
  const target = fs.existsSync(filePath)
    ? filePath
    : fs.existsSync(fallback)
    ? fallback
    : null;

  if (!target) return null;

  const raw = fs.readFileSync(target, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title as string,
    excerpt: data.excerpt as string,
    date: data.date as string,
    tags: (data.tags as string[]) ?? [],
    coverImage: data.coverImage as string | undefined,
    readingTime: readingTime(content).text,
    content,
  };
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
