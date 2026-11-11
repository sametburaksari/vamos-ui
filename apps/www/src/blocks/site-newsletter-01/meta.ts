import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Newsletter / writer website",
  description: "A writer’s newsletter “The Slow Desk”: newspaper nameplate, subscribe form (cadence, typo hint, double opt-in state) beside a postmarked latest letter, recent letters with a topic index, about, reader replies and FAQ; a searchable archive (full text, EN + TR, topic and year, highlighted matches) and one issue with a drop cap and pull quote. EN / TR.",
  category: "Website pages",
  order: 62,
  tags: ["site"],
  files: [
    "site-newsletter-01/page.tsx",
    "site-newsletter-01/components/newsletter-site.tsx",
    "site-newsletter-01/components/desk-provider.tsx",
    "site-newsletter-01/components/subscribe-form.tsx",
    "site-newsletter-01/components/archive-search.tsx",
    "site-newsletter-01/components/home-parts.tsx",
    "site-newsletter-01/components/issue-page.tsx",
    "site-newsletter-01/components/content.ts",
  ],
};

export default meta;
