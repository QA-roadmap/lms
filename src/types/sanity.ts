export type SanityLesson = {
  _id: string;
  title: string;
  slug: string;
  duration?: string;
  isFree: boolean;
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
