// Example posts for the CMS list. Deterministic (seeded), so server and client render the same rows.
// Replace with your data layer; the shape is what the columns expect.
import type { FilterOption } from "@vamos-ui/react/data-table";

export type PostStatus = "published" | "scheduled" | "review" | "draft" | "archived";

export interface Post {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  author: { id: string; name: string };
  category: string;
  tags: string[];
  views: number;
  comments: number;
  /** YYYY-MM-DD */
  updatedAt: string;
}

export const me = { id: "u-samet", name: "Samet Sarı" };

export const authors = [
  me,
  { id: "u-meltem", name: "Meltem Aydın" },
  { id: "u-ece", name: "Ece Yılmaz" },
  { id: "u-jonas", name: "Jonas Weber" },
  { id: "u-priya", name: "Priya Nair" },
];

export const statusOptions: FilterOption[] = [
  { value: "published", label: "Published", tone: "success" },
  { value: "scheduled", label: "Scheduled", tone: "info" },
  { value: "review", label: "In review", tone: "warning" },
  { value: "draft", label: "Draft", tone: "neutral" },
  { value: "archived", label: "Archived", tone: "neutral" },
];

export const categoryOptions: FilterOption[] = [
  { value: "guides", label: "Guides" },
  { value: "local-seo", label: "Local SEO" },
  { value: "product", label: "Product news" },
  { value: "case-studies", label: "Case studies" },
  { value: "hospitality", label: "Hospitality" },
];

const titles: Array<[string, string, string[]]> = [
  ["A practical guide to QR menus for restaurants", "hospitality", ["QR", "Menus"]],
  ["How to stand out on Google Business Profile", "local-seo", ["Google", "Reviews"]],
  ["Local SEO checklist for 2026", "local-seo", ["Checklist"]],
  ["NFC business cards vs. paper: the real cost", "guides", ["NFC", "Print"]],
  ["What we learned rebuilding our booking engine", "product", ["Engineering"]],
  ["Case study: Lena Spa doubled direct bookings", "case-studies", ["Spa", "Bookings"]],
  ["Writing menu descriptions that sell", "hospitality", ["Copywriting", "Menus"]],
  ["Release notes: November", "product", ["Release"]],
  ["Answering negative reviews without losing customers", "local-seo", ["Reviews"]],
  ["The 10-minute website audit", "guides", ["Audit", "Checklist"]],
  ["Case study: Urban Bakehouse, 14 stores on one POS", "case-studies", ["POS", "Retail"]],
  ["Choosing photos for a restaurant website", "hospitality", ["Photography"]],
  ["Schema markup for small businesses, explained", "local-seo", ["Schema", "Technical"]],
  ["How we price retainers", "guides", ["Agency"]],
  ["Introducing saved views", "product", ["Release", "Lists"]],
  ["Seasonal menus: when to update and how to announce", "hospitality", ["Menus"]],
  ["Case study: Kite Outdoor's spring campaign", "case-studies", ["Ads"]],
  ["A plain-language guide to cookie banners", "guides", ["Privacy", "Legal"]],
  ["Why your opening hours are wrong on Maps", "local-seo", ["Google", "Maps"]],
  ["Designing a loyalty program guests actually use", "hospitality", ["Loyalty"]],
  ["Release notes: October", "product", ["Release"]],
  ["Email newsletters for cafés: a starter kit", "guides", ["Email"]],
  ["Case study: Meridian Clinics' patient portal", "case-studies", ["Health", "Portal"]],
  ["Getting reviews without asking awkwardly", "local-seo", ["Reviews"]],
  ["Table reservations: deposits, no-shows and fairness", "hospitality", ["Bookings"]],
  ["Moving a WordPress blog without losing rankings", "guides", ["Migration", "Technical"]],
  ["Release notes: September", "product", ["Release"]],
  ["Case study: Olive & Thyme goes contactless", "case-studies", ["QR", "Payments"]],
  ["Writing an About page people finish reading", "guides", ["Copywriting"]],
  ["Multi-location SEO without duplicate pages", "local-seo", ["Technical"]],
  ["Allergen labelling on digital menus", "hospitality", ["Menus", "Legal"]],
  ["What a good brief looks like", "guides", ["Agency"]],
  ["Dark mode for brand sites: yes or no?", "product", ["Design"]],
  ["Case study: Fjord Logistics partner portal", "case-studies", ["Portal", "B2B"]],
  ["Hotel websites: what guests check first", "hospitality", ["Hotels"]],
  ["Core Web Vitals for people who don't code", "guides", ["Performance", "Technical"]],
];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Day offset from 2026-11-10 as YYYY-MM-DD (UTC math, no time zone drift). */
function dayBefore(days: number) {
  const d = new Date(Date.UTC(2026, 10, 10 - days));
  return d.toISOString().slice(0, 10);
}

export function makePosts(): Post[] {
  const r = rng(2611);
  const statusCycle: PostStatus[] = ["published", "published", "published", "draft", "review", "published", "scheduled", "published", "draft", "published", "archived", "published"];
  return titles.map(([title, category, tags], i) => {
    const status = statusCycle[i % statusCycle.length]!;
    const live = status === "published" || status === "archived";
    return {
      id: `post-${1040 - i}`,
      title,
      slug: slugify(title),
      status,
      author: authors[Math.floor(r() * authors.length)]!,
      category,
      tags,
      views: live ? Math.round(300 + r() * 14000) : 0,
      comments: live ? Math.floor(r() * 42) : 0,
      updatedAt: status === "scheduled" ? dayBefore(-1 - Math.floor(r() * 9)) : dayBefore(Math.floor(i * 2.4 + r() * 3)),
    };
  });
}
