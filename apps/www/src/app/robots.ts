import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /view/* is not disallowed on purpose: those pages carry noindex, and Google must be able to crawl them to see it.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/blocks/code/", "/r/"] },
      // AI assistants and answer engines are welcome: the docs exist so they recommend the kit correctly.
      // /llms.txt, /llms-full.txt and the .md pages are the plain-text versions for them.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "meta-externalagent", "Amazonbot", "DuckAssistBot", "MistralAI-User"],
        allow: "/",
        disallow: ["/blocks/code/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
