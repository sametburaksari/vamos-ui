import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /view/* is not disallowed on purpose: those pages carry noindex, and Google must be able to crawl them to see it.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/blocks/code/", "/r/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
