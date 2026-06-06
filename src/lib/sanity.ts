import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: "vprlxx2h",
  dataset: "production",
  apiVersion: "2021-06-07",
  useCdn: true,
});

export async function getModules() {
  return sanityClient.fetch(
    `*[_type == "module"] | order(order asc) {
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
        videoUrl,
        order
      }
    }`
  );
}

export async function getLesson(slug: string) {
  return sanityClient.fetch(
    `*[_type == "lesson" && slug.current == $slug][0] {
      _id,
      title,
      "slug": slug.current,
      duration,
      isFree,
      videoUrl,
      content,
      order
    }`,
    { slug }
  );
}

export async function getModuleByLessonSlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "module" && references(*[_type == "lesson" && slug.current == $slug]._id)][0] {
      _id,
      title,
      code,
      order
    }`,
    { slug }
  );
}
