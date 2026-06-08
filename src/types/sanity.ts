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

export type SanityCourse = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  status: SanityCourseStatus;
  priceUSD?: number;
  order?: number;
  modules: SanityModule[];
};
