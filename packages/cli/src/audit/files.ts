/** robots.txt and sitemap.xml parsing. Pure. */

export interface RobotsGroup {
  agents: string[];
  rules: { allow: boolean; path: string }[];
}

export interface Robots {
  groups: RobotsGroup[];
  sitemaps: string[];
}

export function parseRobots(text: string): Robots {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!m) continue;
    const key = m[1]!.toLowerCase();
    const value = m[2]!.trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (key === "sitemap") {
      if (value) sitemaps.push(value);
    } else if ((key === "allow" || key === "disallow") && current) {
      // "Disallow:" with no path allows everything.
      if (value || key === "allow") current.rules.push({ allow: key === "allow", path: value });
    }
  }
  return { groups, sitemaps };
}

/** The group that applies to a crawler token (most specific match, else "*"); null when none. */
export function groupFor(robots: Robots, agent: string): RobotsGroup | null {
  const token = agent.toLowerCase();
  const specific = robots.groups.filter((g) => g.agents.some((a) => a !== "*" && token.startsWith(a)));
  if (specific.length) return { agents: specific.flatMap((g) => g.agents), rules: specific.flatMap((g) => g.rules) };
  const star = robots.groups.filter((g) => g.agents.includes("*"));
  return star.length ? { agents: ["*"], rules: star.flatMap((g) => g.rules) } : null;
}

function patternMatch(pattern: string, path: string): number {
  if (!pattern) return -1;
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const re = new RegExp("^" + body.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + (anchored ? "$" : ""));
  return re.test(path) ? body.length : -1;
}

/** Google's rules: longest matching path wins, Allow wins a tie. */
export function isAllowed(robots: Robots | null, agent: string, pathAndQuery: string): boolean {
  if (!robots) return true;
  const group = groupFor(robots, agent);
  if (!group) return true;
  let best = -1;
  let allowed = true;
  for (const r of group.rules) {
    const len = patternMatch(r.path, pathAndQuery);
    if (len > best || (len === best && len >= 0 && r.allow)) {
      best = len;
      allowed = r.allow;
    }
  }
  return allowed;
}

/** AI crawlers worth knowing about, with what they do. */
export const AI_CRAWLERS: readonly { agent: string; owner: string }[] = [
  { agent: "GPTBot", owner: "OpenAI (training)" },
  { agent: "OAI-SearchBot", owner: "OpenAI (ChatGPT search)" },
  { agent: "ChatGPT-User", owner: "OpenAI (user-requested visits)" },
  { agent: "ClaudeBot", owner: "Anthropic (training)" },
  { agent: "Claude-SearchBot", owner: "Anthropic (search)" },
  { agent: "Claude-User", owner: "Anthropic (user-requested visits)" },
  { agent: "PerplexityBot", owner: "Perplexity (search)" },
  { agent: "Google-Extended", owner: "Google (Gemini training)" },
  { agent: "Applebot-Extended", owner: "Apple (AI training)" },
  { agent: "CCBot", owner: "Common Crawl" },
  { agent: "Bytespider", owner: "ByteDance" },
  { agent: "meta-externalagent", owner: "Meta (AI)" },
];

export type CrawlerAccess = "allowed" | "blocked" | "partial";

export function aiCrawlerPolicy(robots: Robots | null): { agent: string; owner: string; access: CrawlerAccess }[] {
  return AI_CRAWLERS.map(({ agent, owner }) => {
    if (!robots) return { agent, owner, access: "allowed" as const };
    const group = groupFor(robots, agent);
    const root = isAllowed(robots, agent, "/");
    // Disallows in the shared "*" group (e.g. /admin) are not a policy about this crawler.
    const anyDisallow = !!group && !group.agents.includes("*") && group.rules.some((r) => !r.allow && r.path);
    return { agent, owner, access: !root ? "blocked" : anyDisallow ? "partial" : "allowed" };
  });
}

export interface SitemapInfo {
  valid: boolean;
  kind: "urlset" | "sitemapindex" | null;
  urls: string[];
  error?: string;
}

export function parseSitemap(xml: string): SitemapInfo {
  const body = xml.replace(/^﻿/, "").trim();
  const kind = /<(?:[\w-]+:)?sitemapindex[\s>]/i.test(body) ? "sitemapindex" : /<(?:[\w-]+:)?urlset[\s>]/i.test(body) ? "urlset" : null;
  if (!kind) return { valid: false, kind: null, urls: [], error: body.startsWith("<!") || /<html[\s>]/i.test(body) ? "it is an HTML page, not XML" : "no <urlset> or <sitemapindex> root element" };
  if (!new RegExp(`</(?:[\\w-]+:)?${kind}\\s*>`, "i").test(body)) return { valid: false, kind, urls: [], error: `the closing </${kind}> tag is missing` };
  const urls = [...body.matchAll(/<(?:[\w-]+:)?loc>\s*(?:<!\[CDATA\[)?([^<\]]+?)(?:\]\]>)?\s*<\/(?:[\w-]+:)?loc>/gi)].map((m) => m[1]!.trim().replace(/&amp;/g, "&"));
  const opens = (body.match(/<(?:[\w-]+:)?(?:url|sitemap)>/gi) ?? []).length;
  const closes = (body.match(/<\/(?:[\w-]+:)?(?:url|sitemap)>/gi) ?? []).length;
  if (opens !== closes) return { valid: false, kind, urls, error: `${opens} <url> entries but ${closes} closing tags` };
  return { valid: true, kind, urls };
}
