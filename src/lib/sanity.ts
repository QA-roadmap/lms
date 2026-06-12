import { createClient } from "next-sanity";
import { draftMode } from "next/headers";
import type { SanityCourse, SanityLesson, SanityModule, SanityPost } from "@/types/sanity";

export const sanityClient = createClient({
  projectId: "vprlxx2h",
  dataset: "production",
  apiVersion: "2021-06-07",
  useCdn: true,
});

// Drafts perspective + stega for the Sanity Presentation tool (live preview while editing).
const previewClient = sanityClient.withConfig({
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: "drafts",
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? "http://localhost:3333",
  },
});

async function previewFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const { isEnabled } = await draftMode();
  return (isEnabled ? previewClient : sanityClient).fetch<T>(query, params);
}

const MODULE_PROJECTION = `{
  _id,
  title,
  code,
  description,
  order,
  "lessons": lessons[]-> {
    _id,
    title,
    "slug": slug.current,
    duration,
    isFree,
    isCapstone,
    videoUrl,
    order
  } | order(order asc)
}`;

const COURSE_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  tagline,
  description,
  status,
  courseType,
  priceUSD,
  order,
  "modules": modules[]-> ${MODULE_PROJECTION} | order(order asc)
}`;

export async function getCourses(): Promise<SanityCourse[]> {
  return sanityClient.fetch(
    `*[_type == "course"] | order(order asc) ${COURSE_PROJECTION}`
  );
}

export async function getCourseBySlug(slug: string): Promise<SanityCourse | null> {
  return sanityClient.fetch(
    `*[_type == "course" && slug.current == $slug][0] ${COURSE_PROJECTION}`,
    { slug }
  );
}

// Drafts perspective + stega — use on pages an editor previews live from the Sanity Studio.
export async function getCourseBySlugPreview(slug: string): Promise<SanityCourse | null> {
  return previewFetch(
    `*[_type == "course" && slug.current == $slug][0] ${COURSE_PROJECTION}`,
    { slug }
  );
}

export async function getModules(): Promise<SanityModule[]> {
  return sanityClient.fetch(
    `*[_type == "module"] | order(order asc) ${MODULE_PROJECTION}`
  );
}

const LESSON_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  duration,
  isFree,
  isCapstone,
  videoUrl,
  content[]{
    ...,
    _type == "image" => {
      "asset": asset->
    }
  },
  order
}`;

export async function getLesson(slug: string): Promise<SanityLesson | null> {
  return sanityClient.fetch(
    `*[_type == "lesson" && slug.current == $slug][0] ${LESSON_PROJECTION}`,
    { slug }
  );
}

// Drafts perspective + stega — use on pages an editor previews live from the Sanity Studio.
export async function getLessonPreview(slug: string): Promise<SanityLesson | null> {
  return previewFetch(
    `*[_type == "lesson" && slug.current == $slug][0] ${LESSON_PROJECTION}`,
    { slug }
  );
}

const POST_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  tags,
  "coverImage": coverImage.asset->{ "url": url },
  publishedAt,
  body
}`;

export async function getAllPosts(): Promise<SanityPost[]> {
  return sanityClient.fetch(
    `*[_type == "post"] | order(publishedAt desc) ${POST_PROJECTION}`
  );
}

export async function getPostBySlug(slug: string): Promise<SanityPost | null> {
  return sanityClient.fetch(
    `*[_type == "post" && slug.current == $slug][0] ${POST_PROJECTION}`,
    { slug }
  );
}
