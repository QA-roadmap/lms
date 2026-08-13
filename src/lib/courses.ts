import type { SanityCourse } from "@/types/sanity";

export function courseLessonCount(course: SanityCourse): number {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

export type CourseDiscount = {
  price: number;
  originalPrice: number;
  discountPct: number;
};

export function getCourseDiscount(course: SanityCourse): CourseDiscount | null {
  if (course.priceUSD === undefined) return null;
  const price = course.priceUSD;
  const originalPrice = course.compareAtPriceUSD ?? Math.ceil((price * 1.52) / 10) * 10;
  const discountPct = Math.round((1 - price / originalPrice) * 100);
  return { price, originalPrice, discountPct };
}
