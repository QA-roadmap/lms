export type SanityLesson = {
  _id: string;
  title: string;
  slug: string;
  duration?: string;
  isFree: boolean;
  isCapstone?: boolean;
  videoUrl?: string;
  content?: unknown[];
  order?: number;
};

export type SanityModule = {
  _id: string;
  title: string;
  code: string;
  description?: string;
  order?: number;
  lessons: SanityLesson[];
};

export type SanityCourseStatus = "available" | "coming-soon";

export type SanityCourseType = "flagship" | "mini";

export type SanityCourse = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  status: SanityCourseStatus;
  courseType?: SanityCourseType;
  priceUSD?: number;
  outcomes?: string[];
  order?: number;
  modules: SanityModule[];
};

export type SanityPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: string;
  tags: string[];
  coverImage?: { url: string } | null;
  publishedAt: string;
  body?: unknown[];
};
