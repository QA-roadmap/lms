import type { SanityCourse } from "@/types/sanity";

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://qaroadmap.dev";

export const SITE_NAME = "QA Roadmap";

export type FAQItem = { q: string; a: string };

/** Builds a schema.org FAQPage JSON-LD object from a list of Q&A pairs. */
export function faqSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

/** Builds a schema.org Course (+ Offer) JSON-LD object for a course detail page. */
export function courseSchema(course: SanityCourse) {
  const url = `${SITE_URL}/courses/${course.slug}`;
  const description = course.tagline ?? course.description;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description,
    url,
    image: `${url}/opengraph-image`,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    ...(typeof course.priceUSD === "number" && {
      offers: {
        "@type": "Offer",
        price: course.priceUSD,
        priceCurrency: "USD",
        availability:
          course.status === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
        url,
      },
    }),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
    },
  };
}

/** Builds a schema.org Article JSON-LD object for a blog post. */
export function articleSchema({
  title,
  description,
  slug,
  date,
  image,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
  image?: string;
}) {
  const url = `${SITE_URL}/blog/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: image ?? `${url}/opengraph-image`,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}
