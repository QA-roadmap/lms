import type { SanityCourse } from "@/types/sanity";

export function courseLessonCount(course: SanityCourse): number {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}
