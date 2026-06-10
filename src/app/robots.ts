import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/academy", "/api/", "/sign-in"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
