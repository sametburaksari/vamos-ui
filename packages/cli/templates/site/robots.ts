// Written by `vamos-ui site essentials`. robots.txt; AI crawlers follow ai.allowAiCrawlers in vamos.site.json. Edit freely; it is never overwritten.
import type { MetadataRoute } from "next";
import { SITE_URL, site } from "./site";

/** Crawlers that collect content for AI models and AI answers. */
const AI_BOTS: string[] = __AI_BOTS__;

export default function robots(): MetadataRoute.Robots {
  // true: every crawler, AI bots included. false: block the AI bots. A list: allow only those AI bots.
  const allow = site.ai?.allowAiCrawlers ?? true;
  const blocked = allow === true ? [] : allow === false ? AI_BOTS : AI_BOTS.filter((bot) => !allow.includes(bot));
  const rules: { userAgent: string | string[]; allow?: string; disallow?: string }[] = [{ userAgent: "*", allow: "/" }];
  if (blocked.length) rules.push({ userAgent: blocked, disallow: "/" });
  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
