import type { MetadataRoute } from "next";
import { IS_INDEXING_ALLOWED, SITE_URL } from "@/lib/seo";

// /robots.txt
//
// When ALLOW_INDEXING isn't exactly "true" (previews, staging, local dev),
// everything is blocked. When it is "true", only pages that should never be
// indexed are blocked: the quote cart, its review step, and the filtered or
// sorted catalog URLs that duplicate /catalog and /catalog/<category>.
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXING_ALLOWED) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/quote",
          "/quote/review",
          "/api/",
          "/*?q=",
          "/*?sort=",
          "/*?category=",
          "/*?page=",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
