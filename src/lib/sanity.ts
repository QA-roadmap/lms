import { createClient } from "next-sanity";
import type { SanityCourse, SanityLesson, SanityModule } from "@/types/sanity";

export const sanityClient = createClient({
  projectId: "vprlxx2h",
  dataset: "production",
  apiVersion: "2021-06-07",
  useCdn: true,
});

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

export async function getModules(): Promise<SanityModule[]> {
  return sanityClient.fetch(
    `*[_type == "module"] | order(order asc) ${MODULE_PROJECTION}`
  );
}

export async function getLesson(slug: string): Promise<SanityLesson | null> {
  return sanityClient.fetch(
    `*[_type == "lesson" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      duration,
      isFree,
      isCapstone,
      videoUrl,
      content,
      order
    }`,
    { slug }
  );
}
