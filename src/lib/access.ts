import { db } from "@/lib/db";

export async function getActiveCourseSlugs(userId: string): Promise<Set<string>> {
  const purchases = await db.purchase.findMany({
    where: { userId, status: "active" },
    select: { courseSlug: true },
  });
  return new Set(purchases.map((p) => p.courseSlug));
}
