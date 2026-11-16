// Block definitions (layer 2) for the news / magazine and commerce blocks: masthead, lead grid,
// post card, post modules, tabs, ticker, ad slot, column layout, sidebar widgets, product grid and
// review score. Server / admin only — this file imports zod; components never import it.

import * as React from "react";
import { z, f, defineBlock, createRegistry, type AnyBlockDefinition } from "../schema";
import { localizedSchema } from "../schema/fields";
import { sanitizeHref } from "../schema/safety";
import type { BlockComponentProps } from "../types";
import { Container, Section } from "../section";
import { PostCard, type PostCardProps } from "./post-card";
import { FeaturedPosts, PostBlock, PostLayout, type FeaturedPostsLayout, type PostBlockLayout } from "./post-modules";
import { PostTabs } from "./post-tabs";
import { NewsTicker, type NewsTickerItem } from "./news-ticker";
import { AdSlot } from "./ad-slot";
import { NewsColumns, PopularPosts, RecentComments, CategoryCounts, FollowCounts, type FollowAccount } from "./news-widgets";
import { NewsHeader, NewsTopBar, type NewsNavItem, type WeatherData } from "./news-masthead";
import { ProductGrid, productListJsonLd, type ProductGridColumns } from "./product-grid";
import { ReviewScore, reviewJsonLd, type ReviewedItem } from "./review-score";
import type { ProductCardData } from "./product-card";
import { AD_SIZES, newsItemListJsonLd, type NewsPost } from "./shared/news";
import { BRAND_NAMES, type BrandName } from "./shared/brand-icons";

/** Registered components receive validated, localized props; these adapters map them onto the kit components. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<P = any> = BlockComponentProps<P>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asBlock = <P,>(C: React.ComponentType<P>) => C as unknown as React.ComponentType<BlockComponentProps<any>>;
const h = React.createElement;

/** A localized, sanitised href (relative, #, ?, http(s), mailto, tel). */
const href = (label = "Link") =>
  localizedSchema(z.string().min(1).refine((v) => sanitizeHref(v) !== null, { message: "Unsafe or unsupported link (javascript:, data: and unknown schemes are rejected)." })).meta({
    title: label,
    vamos: { field: "text", localized: true, widget: "link", label },
  });

const BRANDS = Object.keys(BRAND_NAMES) as [BrandName, ...BrandName[]];
const AD_SIZE_NAMES = Object.keys(AD_SIZES) as [keyof typeof AD_SIZES, ...(keyof typeof AD_SIZES)[]];
const isoDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2})?)?$/, { message: "Use YYYY-MM-DD or an ISO datetime." });

/** The `NewsPost` contract as JSON (also what a `posts` resolver returns). */
const NewsPostSchema = f.group({
  href: href("Story link"),
  title: f.text({ max: 200, label: "Headline" }),
  excerpt: f.text({ max: 320, multiline: true, label: "Standfirst" }).optional(),
  cover: f.image({ aspect: "3:2", label: "Cover" }).optional(),
  category: f.group({ label: f.text({ max: 40, label: "Section" }), href: href("Section link").optional() }).optional(),
  publishedAt: isoDateTime,
  updatedAt: isoDateTime.optional(),
  author: f.group({ name: f.text({ max: 60, localized: false, label: "Author" }), href: href("Author page").optional() }).optional(),
  commentCount: f.number({ min: 0, int: true, label: "Comments" }).optional(),
  readingMinutes: f.number({ min: 1, max: 120, int: true, label: "Reading time (min)" }).optional(),
  format: f.select(["video", "gallery", "live"], { label: "Format" }).optional(),
  id: z.string().max(80).optional(),
});
const posts = (opts: { min?: number; max?: number } = {}) => f.list(NewsPostSchema, { itemLabel: "title", label: "Stories", ...opts });
/** A data query (`resolvers.posts`) that fills `posts`; manual `posts` are used without a resolver. */
const postsQuery = () => f.query("posts", { into: "posts" }).optional();

/** News blocks have no section chrome of their own: a tight Section + Container, dropped inside `news-columns`. */
function NewsFrame({ id, blockType, theme, anchor, editMode, children }: { id?: string; blockType: string; theme?: Props["theme"]; anchor?: string; editMode?: boolean; children?: React.ReactNode }) {
  return h(Section, { as: "div", theme, anchor, blockId: id, blockType, editMode, "data-news-block": "" } as React.ComponentProps<typeof Section>, h(Container, null, children));
}
// The renderer passes one merged dictionary; each kit component reads its own keys from it.
const common = (p: Props) => ({ locale: p.locale, labels: p.labels as Record<string, string> | undefined, components: p.components });
const level23 = (l: number | undefined): 2 | 3 => (l === 3 ? 3 : 2);
const ld = (list: NewsPost[] | undefined, name?: string) => (list?.length ? newsItemListJsonLd(list, { name }) : null);

/* ------------------------------------------------------------------ masthead */

const navLink = f.group({ label: f.text({ max: 40, label: "Label" }), href: href() });

const mastheadSchema = z.object({
  brand: f.text({ max: 60, label: "Wordmark" }),
  tagline: f.text({ max: 120, label: "Tagline" }).optional(),
  homeHref: href("Home link").optional(),
  nav: f.list(
    f.group({
      label: f.text({ max: 30, label: "Label" }),
      href: href(),
      sections: f.list(f.group({ id: z.string().min(1).max(40), label: f.text({ max: 40, label: "Label" }), href: href(), posts: posts({ max: 4 }).default([]) }), { max: 8, itemLabel: "label", label: "Mega menu sections" }).optional(),
      children: f.list(navLink, { max: 10, itemLabel: "label", label: "Dropdown" }).optional(),
    }),
    { min: 1, max: 10, itemLabel: "label", label: "Sections" },
  ),
  more: f.list(navLink, { max: 10, itemLabel: "label", label: "More menu" }).optional(),
  search: z.union([z.literal(false), z.object({ action: z.string().min(1), param: z.string().max(20).optional() })]).optional(),
  sticky: f.toggle({ label: "Sticky section bar" }).default(true),
  currentPath: z.string().optional(),
  topBar: z
    .object({
      date: isoDateTime.optional(),
      timeZone: z.string().optional(),
      weather: z.object({ temp: z.number(), place: z.string().min(1).max(40), condition: z.enum(["clear", "partly-cloudy", "cloudy", "rain", "snow", "wind", "fog", "storm"]).optional(), conditionLabel: z.string().max(40).optional() }).optional(),
      links: f.list(navLink, { max: 5, itemLabel: "label", label: "Utility links" }).optional(),
      social: f.list(f.group({ network: f.select(BRANDS), href: href() }), { max: 6, label: "Social" }).optional(),
      auth: z.object({ joinHref: z.string().optional(), signInAction: z.string().optional(), recoverAction: z.string().optional() }).optional(),
    })
    .optional(),
});
type MastheadProps = z.output<typeof mastheadSchema>;

function NewsMastheadBlock(p: Props<MastheadProps>) {
  const c = common(p);
  const nav: NewsNavItem[] = p.nav.map((n) => ({
    label: n.label as string,
    href: n.href as string,
    mega: n.sections?.length ? n.sections.map((s) => ({ id: s.id, label: s.label as string, href: s.href as string, posts: s.posts as NewsPost[] })) : undefined,
    children: n.children?.length ? (n.children as { label: string; href: string }[]) : undefined,
  }));
  const tb = p.topBar;
  return h(
    React.Fragment,
    null,
    tb
      ? h(NewsTopBar, {
          ...c,
          date: tb.date,
          timeZone: tb.timeZone,
          weather: tb.weather as WeatherData | undefined,
          links: tb.links as { label: string; href: string }[] | undefined,
          social: tb.social as { network: BrandName; href: string }[] | undefined,
          auth: tb.auth ? { ...tb.auth, brand: p.brand as string } : false,
        })
      : null,
    h(NewsHeader, {
      ...c,
      brand: p.brand as string,
      tagline: p.tagline as string | undefined,
      homeHref: p.homeHref as string | undefined,
      nav,
      more: p.more as { label: string; href: string }[] | undefined,
      search: p.search,
      sticky: p.sticky,
      currentPath: p.currentPath,
    }),
  );
}

const DEMO_POSTS: z.input<typeof NewsPostSchema>[] = [
  { href: "/city/night-tram", title: "The night tram returns: council votes to run the coast line until 2 a.m.", excerpt: "A twelve-month trial starts in March after three years of campaigning by shift workers.", category: { label: "City", href: "/city" }, publishedAt: "2026-11-15T07:40:00+03:00", author: { name: "Ayla Demirtaş" }, commentCount: 48, readingMinutes: 6, cover: { src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1000, alt: "The city at dusk seen from above" } },
  { href: "/economy/port-cranes", title: "Port orders four electric cranes and a shore-power berth", category: { label: "Economy", href: "/economy" }, publishedAt: "2026-11-15T06:15:00+03:00", author: { name: "Jonas Weber" }, readingMinutes: 5, cover: { src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1067, alt: "A wide avenue between tall buildings" } },
  { href: "/science/seagrass", title: "Seagrass meadows are back in the bay, divers count", category: { label: "Science", href: "/science" }, publishedAt: "2026-11-14T18:20:00+03:00", author: { name: "Ece Kaya" }, format: "gallery", cover: { src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1067, alt: "A river bending through the city at dusk" } },
  { href: "/culture/archive-night", title: "The city archive opens its map room for one night", category: { label: "Culture", href: "/culture" }, publishedAt: "2026-11-14T09:00:00+03:00", author: { name: "Derin Aksoy" }, cover: { src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1067, alt: "A bridge lit at night" } },
];

export const newsMastheadBlock = defineBlock({
  type: "news-masthead",
  version: 1,
  title: "News masthead",
  description: "Top bar (date, weather, sign in, social), wordmark and a sticky section bar with mega menus.",
  category: "site",
  region: "header",
  icon: "newspaper",
  keywords: ["masthead", "news header", "mega menu", "section bar", "gazete"],
  supports: { spacing: false, anchor: false },
  schema: mastheadSchema,
  preview: {
    props: {
      brand: "The Harbour Ledger",
      tagline: "Independent news from the coast since 1987",
      nav: [
        { label: "Home", href: "/" },
        { label: "City", href: "/city", sections: [{ id: "all", label: "All", href: "/city", posts: DEMO_POSTS.slice(0, 4) }] },
        { label: "Economy", href: "/economy" },
        { label: "Science", href: "/science" },
        { label: "Culture", href: "/culture" },
      ],
      more: [{ label: "Puzzles", href: "/puzzles" }, { label: "Archive", href: "/archive" }],
      sticky: true,
      topBar: { date: "2026-11-15", weather: { temp: 14, place: "Harbourside", condition: "partly-cloudy" }, links: [{ label: "Newsletters", href: "/newsletters" }], auth: { joinHref: "/join", signInAction: "/api/sign-in" } },
    },
  },
  component: asBlock(NewsMastheadBlock),
});

/* ------------------------------------------------------------------ featured posts */

const featuredSchema = z.object({
  label: f.text({ max: 60, label: "Region name" }).optional(),
  posts: posts({ max: 16 }).optional(),
  query: postsQuery(),
  slider: f.toggle({ label: "Page through groups of four" }).default(false),
});

export const featuredPostsBlock = defineBlock({
  type: "featured-posts",
  version: 1,
  title: "Lead stories",
  description: "The lead grid under the masthead: one large story and three smaller photo cards.",
  category: "blog",
  icon: "layout-grid",
  keywords: ["lead", "top stories", "hero grid", "manşet"],
  variants: ["mosaic", "quad"],
  defaultVariant: "mosaic",
  schema: featuredSchema,
  preview: { props: { label: "Top stories", posts: DEMO_POSTS, slider: false } },
  jsonLd: (p) => ld(p.posts as NewsPost[] | undefined, p.label as string | undefined),
  component: asBlock((p: Props<z.output<typeof featuredSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "featured-posts", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(FeaturedPosts, { ...common(p), posts: (p.posts ?? []) as NewsPost[], layout: (p.variant ?? "mosaic") as FeaturedPostsLayout, slider: p.slider, label: p.label as string | undefined, headingLevel: level23(p.headingLevel) })),
  ),
});

/* ------------------------------------------------------------------ post card */

const postCardSchema = z.object({
  post: NewsPostSchema,
  size: f.select(["xl", "lg", "md", "sm"], { label: "Size" }).optional(),
  excerpt: f.toggle({ label: "Show the standfirst" }).optional(),
  category: f.toggle({ label: "Show the section badge" }).optional(),
  aspect: f.select(["16:10", "3:2", "4:3", "1:1", "16:9"], { label: "Photo crop" }).optional(),
});

export const postCardBlock = defineBlock({
  type: "post-card",
  version: 1,
  title: "Post card",
  description: "One story as a photo card, a stacked card, a thumbnail row or a text link.",
  category: "blog",
  icon: "square-pen",
  keywords: ["story", "article card", "haber kartı"],
  variants: ["overlay", "stack", "row", "list", "text"],
  defaultVariant: "stack",
  schema: postCardSchema,
  preview: { props: { post: DEMO_POSTS[0]!, size: "lg", excerpt: true } },
  component: asBlock((p: Props<z.output<typeof postCardSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "post-card", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(PostCard, { ...common(p), post: p.post as NewsPost, variant: p.variant as PostCardProps["variant"], size: p.size, excerpt: p.excerpt, category: p.category, aspect: p.aspect, headingLevel: level23(p.headingLevel) })),
  ),
});

/* ------------------------------------------------------------------ post module */

const LAYOUTS = ["lead-list", "lead-grid", "big-2", "featured-list", "trio", "list", "grid"] as const;

const postBlockSchema = z.object({
  title: f.heading({ max: 60, label: "Section title" }).optional(),
  href: href("View all link").optional(),
  posts: posts({ max: 24 }).optional(),
  query: postsQuery(),
  columns: f.select(["2", "3"], { label: "Columns (grid)" }).optional(),
  excerpts: f.toggle({ label: "Show standfirsts" }).optional(),
  pagination: z.object({ page: z.number().int().min(1), total: z.number().int().min(1), hrefTemplate: z.string().optional() }).optional(),
  headingSize: f.select(["lg", "sm"], { label: "Heading style" }).optional(),
});

export const postBlockBlock = defineBlock({
  type: "post-block",
  version: 1,
  title: "Post module",
  description: "A titled section of stories: a lead with a list, trios, grids or a paged archive list.",
  category: "blog",
  icon: "rows-3",
  keywords: ["category module", "section front", "latest", "archive", "kategori"],
  variants: LAYOUTS,
  defaultVariant: "lead-list",
  schema: postBlockSchema,
  preview: { props: { title: "City", href: "/city", posts: DEMO_POSTS } },
  jsonLd: (p) => ld(p.posts as NewsPost[] | undefined, typeof p.title === "string" ? p.title : undefined),
  component: asBlock((p: Props<z.output<typeof postBlockSchema>>) =>
    h(
      NewsFrame,
      { id: p.id, blockType: "post-block", theme: p.theme, anchor: p.anchor, editMode: p.editMode },
      h(PostBlock, {
        ...common(p),
        id: p.id,
        title: p.title as string | undefined,
        href: p.href as string | undefined,
        layout: (p.variant ?? "lead-list") as PostBlockLayout,
        posts: (p.posts ?? []) as NewsPost[],
        columns: p.columns === "3" ? 3 : p.columns === "2" ? 2 : undefined,
        excerpts: p.excerpts,
        pagination: p.pagination,
        headingSize: p.headingSize,
        headingLevel: level23(p.headingLevel),
      }),
    ),
  ),
});

/* ------------------------------------------------------------------ post tabs */

const postTabsSchema = z.object({
  title: f.heading({ max: 60, label: "Title" }),
  layout: f.select(LAYOUTS, { label: "Layout of each tab" }).default("trio"),
  tabs: f.list(f.group({ id: z.string().regex(/^[a-z0-9-]+$/).max(40), label: f.text({ max: 30, label: "Label" }), posts: posts({ max: 12 }).default([]) }), { min: 1, max: 10, itemLabel: "label", label: "Tabs" }),
  defaultTab: z.string().optional(),
});

export const postTabsBlock = defineBlock({
  type: "post-tabs",
  version: 1,
  title: "Post tabs",
  description: "One module with a tab per section (\"All\", \"Science\", \"Culture\"); extra tabs fold into a More menu.",
  category: "blog",
  icon: "folder-kanban",
  keywords: ["tabs", "don't miss", "sections", "sekmeler"],
  schema: postTabsSchema,
  preview: {
    props: {
      title: "Don’t miss",
      layout: "trio",
      tabs: [
        { id: "all", label: "All", posts: DEMO_POSTS.slice(0, 3) },
        { id: "science", label: "Science", posts: DEMO_POSTS.slice(2, 3) },
      ],
    },
  },
  component: asBlock((p: Props<z.output<typeof postTabsSchema>>) => {
    const c = common(p);
    return h(
      NewsFrame,
      { id: p.id, blockType: "post-tabs", theme: p.theme, anchor: p.anchor, editMode: p.editMode },
      h(PostTabs, {
        locale: c.locale,
        labels: c.labels,
        id: p.id,
        title: p.title as string,
        headingLevel: level23(p.headingLevel),
        defaultTab: p.defaultTab,
        tabs: p.tabs.map((t) => ({ id: t.id, label: t.label as string, content: h(PostLayout, { layout: p.layout, posts: t.posts as NewsPost[], common: c, level: level23(p.headingLevel) === 3 ? 4 : 3 }) })),
      }),
    );
  }),
});

/* ------------------------------------------------------------------ ticker */

const tickerSchema = z.object({
  label: f.text({ max: 24, label: "Tag" }).optional(),
  items: f.list(f.group({ title: f.text({ max: 160, label: "Headline" }), href: href(), category: f.text({ max: 24, label: "Section" }).optional(), breaking: f.toggle({ label: "Breaking" }).optional() }), { min: 1, max: 12, itemLabel: "title", label: "Headlines" }),
  interval: f.number({ min: 2000, max: 20000, int: true, label: "Milliseconds per headline" }).optional(),
  autoplay: f.toggle({ label: "Advance on its own" }).optional(),
  tone: f.select(["accent", "ink", "danger"], { label: "Tag tone" }).optional(),
});

export const newsTickerBlock = defineBlock({
  type: "news-ticker",
  version: 1,
  title: "News ticker",
  description: "Trending or breaking headlines: one at a time with controls, or a pausable crawl.",
  category: "blog",
  icon: "radio",
  keywords: ["breaking", "trending", "headlines", "son dakika"],
  variants: ["rotate", "marquee"],
  defaultVariant: "rotate",
  supports: { spacing: false },
  schema: tickerSchema,
  preview: { props: { label: "Trending now", items: DEMO_POSTS.map((d) => ({ title: d.title, href: d.href, category: d.category?.label })) } },
  component: asBlock((p: Props<z.output<typeof tickerSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "news-ticker", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(NewsTicker, { ...common(p), items: p.items as NewsTickerItem[], label: p.label as string | undefined, mode: p.variant === "marquee" ? "marquee" : "rotate", interval: p.interval, autoplay: p.autoplay, tone: p.tone })),
  ),
});

/* ------------------------------------------------------------------ ad slot */

const adSchema = z.object({
  size: f.select(AD_SIZE_NAMES, { label: "Size" }).default("leaderboard"),
  mobileSize: f.select(AD_SIZE_NAMES, { label: "Size on phones" }).optional(),
  slotId: z.string().regex(/^[A-Za-z][\w-]*$/).max(60).optional(),
  consent: f.select(["marketing", "analytics", "functional", "none"], { label: "Consent needed", help: "\"none\" for house ads that track nothing." }).default("marketing"),
  houseAd: z.object({ href: href("Ad link"), image: f.image({ label: "Banner" }) }).optional(),
  label: f.text({ max: 30, label: "Label" }).optional(),
  center: f.toggle({ label: "Centre in the column" }).default(true),
});

export const adSlotBlock = defineBlock({
  type: "ad-slot",
  version: 1,
  title: "Ad slot",
  description: "A labelled, size-reserved ad box (IAB sizes) that renders only after consent. House ads need no ad server.",
  category: "embed",
  icon: "rectangle-horizontal",
  keywords: ["advertisement", "banner", "leaderboard", "sponsor", "reklam"],
  supports: { spacing: false },
  schema: adSchema,
  preview: { props: { size: "leaderboard", mobileSize: "mobile-banner", consent: "marketing" } },
  lint: (p) => (p.consent === "none" && !p.houseAd ? [{ code: "ad-without-consent", message: "Ads from an ad server set cookies: keep a consent category unless this is a house ad.", path: "props.consent", severity: "warning" }] : []),
  component: asBlock((p: Props<z.output<typeof adSchema>>) => {
    const house = p.houseAd;
    const child = house
      ? h("a", { href: sanitizeHref(house.href as string) ?? undefined, className: "block size-full" }, h("img", { src: house.image.src, alt: (house.image.alt as string | undefined) ?? "", width: house.image.width, height: house.image.height, loading: "lazy", className: "size-full object-cover" }))
      : undefined;
    return h(
      NewsFrame,
      { id: p.id, blockType: "ad-slot", theme: p.theme, anchor: p.anchor, editMode: p.editMode },
      h(AdSlot, { locale: p.locale, labels: p.labels as Record<string, string> | undefined, size: p.size, mobileSize: p.mobileSize, slotId: p.slotId, consent: p.consent === "none" ? false : p.consent, label: p.label as string | undefined, center: p.center }, child),
    );
  }),
});

/* ------------------------------------------------------------------ columns */

const columnsSchema = z.object({
  asideLabel: f.text({ max: 60, label: "Sidebar name" }).optional(),
  asideStart: f.toggle({ label: "Sidebar on the start side" }).optional(),
});

export const newsColumnsBlock = defineBlock({
  type: "news-columns",
  version: 1,
  title: "News columns",
  description: "Main column of modules with a sidebar; the sidebar's tail sticks under the header.",
  category: "layout",
  icon: "panel-right",
  keywords: ["sidebar", "two columns", "layout"],
  schema: columnsSchema,
  slots: {
    main: { label: "Main column", min: 1 },
    aside: { label: "Sidebar" },
    asideSticky: { label: "Sticky sidebar tail", max: 3 },
  },
  preview: { props: { asideLabel: "More from the Ledger" } },
  component: asBlock((p: Props<z.output<typeof columnsSchema>>) =>
    h(
      Section,
      { as: "div", theme: p.theme, anchor: p.anchor, blockId: p.id, blockType: "news-columns", editMode: p.editMode, "data-news-block": "" } as React.ComponentProps<typeof Section>,
      h(Container, null, h(NewsColumns, { aside: p.slots?.aside, asideSticky: p.slots?.asideSticky, asideLabel: p.asideLabel as string | undefined, asideStart: p.asideStart, children: p.slots?.main })),
    ),
  ),
});

/* ------------------------------------------------------------------ sidebar widgets */

const widgetBase = { title: f.text({ max: 40, label: "Title" }), href: href("View all link").optional() };

const popularSchema = z.object({ ...widgetBase, posts: posts({ max: 10 }).optional(), query: postsQuery(), limit: f.number({ min: 1, max: 10, int: true, label: "Items" }).optional() });

export const popularPostsBlock = defineBlock({
  type: "popular-posts",
  version: 1,
  title: "Most read",
  description: "Sidebar list of the most read stories: big rank numbers or thumbnail rows.",
  category: "blog",
  icon: "trending-up",
  keywords: ["most read", "popular", "sidebar", "çok okunan"],
  variants: ["numbered", "thumbs"],
  defaultVariant: "numbered",
  schema: popularSchema,
  preview: { props: { title: "Most read", posts: DEMO_POSTS } },
  component: asBlock((p: Props<z.output<typeof popularSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "popular-posts", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(PopularPosts, { ...common(p), id: p.id, title: p.title as string, href: p.href as string | undefined, posts: (p.posts ?? []) as NewsPost[], variant: p.variant === "thumbs" ? "thumbs" : "numbered", limit: p.limit, headingLevel: level23(p.headingLevel) })),
  ),
});

const commentsSchema = z.object({
  ...widgetBase,
  comments: f.list(f.group({ author: f.text({ max: 60, localized: false, label: "Author" }), postTitle: f.text({ max: 200, label: "Story" }), postHref: href("Story link"), href: href("Comment link").optional(), excerpt: f.text({ max: 200, label: "Quote" }).optional(), at: isoDateTime.optional() }), { min: 1, max: 10, itemLabel: "author", label: "Comments" }),
});

export const recentCommentsBlock = defineBlock({
  type: "recent-comments",
  version: 1,
  title: "Recent comments",
  description: "Sidebar list of the latest reader comments with the story each one is on.",
  category: "blog",
  icon: "message-square",
  keywords: ["comments", "readers", "sidebar", "yorumlar"],
  schema: commentsSchema,
  preview: { props: { title: "Recent comments", comments: [{ author: "Leyla K.", postTitle: DEMO_POSTS[0]!.title, postHref: DEMO_POSTS[0]!.href, href: "/city/night-tram#comment-3", excerpt: "Finally. The last bus at midnight never worked for the hospital shifts." }] } },
  component: asBlock((p: Props<z.output<typeof commentsSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "recent-comments", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(RecentComments, { ...common(p), id: p.id, title: p.title as string, href: p.href as string | undefined, comments: p.comments as never, headingLevel: level23(p.headingLevel) })),
  ),
});

const categoriesSchema = z.object({
  ...widgetBase,
  categories: f.list(f.group({ label: f.text({ max: 40, label: "Section" }), href: href(), count: f.number({ min: 0, int: true, label: "Stories" }) }), { min: 1, max: 20, itemLabel: "label", label: "Sections" }),
});

export const categoryCountsBlock = defineBlock({
  type: "category-counts",
  version: 1,
  title: "Sections with counts",
  description: "Sidebar list of sections with the number of stories in each.",
  category: "blog",
  icon: "list",
  keywords: ["categories", "sections", "archive", "sidebar", "kategoriler"],
  schema: categoriesSchema,
  preview: { props: { title: "Sections", categories: [{ label: "City", href: "/city", count: 412 }, { label: "Economy", href: "/economy", count: 268 }, { label: "Science", href: "/science", count: 131 }] } },
  component: asBlock((p: Props<z.output<typeof categoriesSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "category-counts", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(CategoryCounts, { ...common(p), id: p.id, title: p.title as string, href: p.href as string | undefined, categories: p.categories as never, headingLevel: level23(p.headingLevel) })),
  ),
});

const followSchema = z.object({
  title: f.text({ max: 40, label: "Title" }).optional(),
  accounts: f.list(f.group({ network: f.select(BRANDS, { label: "Network" }), href: href("Profile"), count: f.number({ min: 0, int: true, label: "Followers" }), unit: f.text({ max: 20, label: "Unit" }).optional(), action: f.text({ max: 20, label: "Button text" }).optional() }), { min: 1, max: 8, itemLabel: "network", label: "Accounts" }),
});

export const followCountsBlock = defineBlock({
  type: "follow-counts",
  version: 1,
  title: "Follow counts",
  description: "Sidebar tiles for the publication's social accounts with follower counts.",
  category: "blog",
  icon: "users",
  keywords: ["social", "followers", "sidebar", "takip"],
  schema: followSchema,
  preview: { props: { accounts: [{ network: "x", href: "https://x.com/example", count: 48200 }, { network: "instagram", href: "https://instagram.com/example", count: 31900 }, { network: "youtube", href: "https://youtube.com/@example", count: 12400, unit: "Subscribers" }] } },
  component: asBlock((p: Props<z.output<typeof followSchema>>) =>
    h(NewsFrame, { id: p.id, blockType: "follow-counts", theme: p.theme, anchor: p.anchor, editMode: p.editMode }, h(FollowCounts, { ...common(p), id: p.id, title: p.title as string | undefined, accounts: p.accounts as FollowAccount[], headingLevel: level23(p.headingLevel) })),
  ),
});

/* ------------------------------------------------------------------ product grid */

const ProductSchema = f.group({
  id: z.string().max(80).optional(),
  title: f.text({ max: 120, label: "Name" }),
  href: href("Product link"),
  vendor: f.text({ max: 60, label: "Brand / maker" }).optional(),
  image: f.image({ aspect: "4:5", label: "Photo" }).optional(),
  hoverImage: f.image({ aspect: "4:5", label: "Second photo" }).optional(),
  price: f.money({ label: "Price" }).optional(),
  compareAt: f.money({ label: "Regular price" }).optional(),
  priceRange: z.object({ min: f.money(), max: f.money() }).optional(),
  isNew: f.toggle({ label: "New" }).optional(),
  soldOut: f.toggle({ label: "Sold out" }).optional(),
  badge: f.text({ max: 20, label: "Badge" }).optional(),
  rating: z.object({ value: z.number().min(0).max(5), count: z.number().int().min(0).optional() }).optional(),
  swatches: f.list(f.group({ name: f.text({ max: 30, label: "Option" }), color: z.string().max(80), image: f.image().optional(), soldOut: f.toggle().optional() }), { max: 12, itemLabel: "name", label: "Swatches" }).optional(),
});

const productGridSchema = z.object({
  eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
  title: f.heading({ max: 90, label: "Title" }).optional(),
  lead: f.text({ max: 240, multiline: true, label: "Lead" }).optional(),
  allLink: f.link({ label: "Shop all link" }).optional(),
  columns: f.select(["2", "3", "4", "5"], { label: "Columns" }).default("4"),
  products: f.list(ProductSchema, { max: 48, itemLabel: "title", label: "Products" }).default([]),
  query: f.query("products", { into: "products" }).optional(),
  jsonLd: f.toggle({ label: "ItemList JSON-LD (category pages)" }).default(false),
  siteUrl: z.url().optional(),
});

const USD = (amount: string) => ({ amount, currency: "USD" });
const img = (id: string, alt: string) => ({ src: `https://images.unsplash.com/${id}?w=900&q=70&auto=format&fit=crop`, alt, width: 900, height: 1125 });

export const productGridBlock = defineBlock({
  type: "product-grid",
  version: 1,
  title: "Product grid",
  description: "Responsive grid (or list) of product cards with prices, sale badges, ratings and swatches.",
  category: "conversion",
  icon: "shopping-bag",
  keywords: ["shop", "products", "catalog", "collection", "ürünler"],
  variants: ["grid", "list"],
  defaultVariant: "grid",
  schema: productGridSchema,
  preview: {
    props: {
      eyebrow: "New this week",
      title: "Desk *essentials*",
      allLink: { href: "/shop", label: "Shop all" },
      columns: "3",
      products: [
        { title: "Oak monitor stand", href: "/shop/oak-monitor-stand", vendor: "Northpoint", price: USD("89"), image: img("photo-1497366216548-37526070297c", "A bright open-plan office with desks"), rating: { value: 4.6, count: 128 } },
        { title: "Felt desk mat", href: "/shop/felt-desk-mat", vendor: "Northpoint", price: USD("34"), compareAt: USD("42"), image: img("photo-1551288049-bebda4e38f71", "A laptop on a desk with charts on the screen"), swatches: [{ name: "Graphite", color: "#3a3a3a" }, { name: "Sand", color: "#c9b79c" }] },
        { title: "Cable tray", href: "/shop/cable-tray", vendor: "Northpoint", priceRange: { min: USD("19"), max: USD("29") }, isNew: true, image: img("photo-1522071820081-009f0129c71c", "People working around a large table") },
      ],
    },
  },
  jsonLd: (p) => (p.jsonLd && p.products.length ? productListJsonLd(p.products as ProductCardData[], p.siteUrl) : null),
  // The renderer emits the definition's jsonLd once per page; the component must not repeat it.
  component: asBlock((p: Props<z.output<typeof productGridSchema>>) =>
    h(ProductGrid, {
      id: p.id,
      anchor: p.anchor,
      theme: p.theme,
      editMode: p.editMode,
      locale: p.locale,
      components: p.components,
      labels: p.labels as never,
      headingLevel: p.headingLevel,
      variant: p.variant === "list" ? "list" : "grid",
      columns: Number(p.columns) as ProductGridColumns,
      eyebrow: p.eyebrow as string | undefined,
      title: p.title as string | undefined,
      lead: p.lead as string | undefined,
      allLink: p.allLink as { href: string; label: string } | undefined,
      products: p.products as ProductCardData[],
      jsonLd: false,
    }),
  ),
});

/* ------------------------------------------------------------------ review score */

const reviewSchema = z.object({
  score: f.number({ min: 0, label: "Score" }),
  max: f.number({ min: 1, max: 100, label: "Scale" }).default(10),
  title: f.text({ max: 40, label: "Title" }).optional(),
  scoreLabel: f.text({ max: 30, label: "Score word" }).optional(),
  criteria: f.list(f.group({ label: f.text({ max: 40, label: "Criterion" }), score: f.number({ min: 0, label: "Score" }) }), { max: 8, itemLabel: "label", label: "Criteria" }).optional(),
  pros: f.list(f.text({ max: 120 }), { max: 8, label: "Pros" }).optional(),
  cons: f.list(f.text({ max: 120 }), { max: 8, label: "Cons" }).optional(),
  verdict: f.text({ max: 320, multiline: true, label: "Verdict" }).optional(),
  reviewer: z.object({ name: z.string().min(1).max(60), url: z.url().optional() }).optional(),
  datePublished: f.date({ label: "Published" }).optional(),
  aggregateRating: z.object({ value: z.number().min(0).max(5), count: z.number().int().min(0), best: z.number().optional() }).optional(),
  item: z.object({ name: z.string().min(1).max(120), type: z.enum(["Product", "SoftwareApplication", "Book", "Game", "Movie", "CreativeWork", "Organization", "LocalBusiness"]).optional(), image: z.url().optional(), brand: z.string().max(60).optional(), url: z.url().optional() }).optional(),
});

export const reviewScoreBlock = defineBlock({
  type: "review-score",
  version: 1,
  title: "Review score",
  description: "A review's verdict box: overall score, criteria bars, pros and cons, readers' rating and Review JSON-LD.",
  category: "proof",
  icon: "gauge",
  keywords: ["rating", "verdict", "pros and cons", "puan"],
  variants: ["points", "percent", "stars"],
  defaultVariant: "points",
  schema: reviewSchema,
  preview: {
    props: {
      score: 8.6,
      max: 10,
      scoreLabel: "Excellent",
      criteria: [{ label: "Sound", score: 9.2 }, { label: "Comfort", score: 8 }, { label: "Battery", score: 7.5 }],
      pros: ["Warm, detailed mids", "Folds flat"],
      cons: ["No hard case"],
      verdict: "The pair to beat under $200.",
      reviewer: { name: "Mara Ellison" },
      datePublished: "2026-11-02",
      item: { name: "Arden H2 headphones", brand: "Arden" },
    },
  },
  lint: (p) => (p.score > p.max ? [{ code: "score-above-max", message: "The score is higher than the scale.", path: "props.score" }] : []),
  jsonLd: (p) => (p.item ? reviewJsonLd({ score: Math.min(p.score, p.max), max: p.max, item: p.item as ReviewedItem, reviewer: p.reviewer, datePublished: p.datePublished, aggregateRating: p.aggregateRating, verdict: p.verdict as string | undefined, pros: p.pros as string[] | undefined, cons: p.cons as string[] | undefined }) : null),
  component: asBlock((p: Props<z.output<typeof reviewSchema>>) =>
    h(
      NewsFrame,
      { id: p.id, blockType: "review-score", theme: p.theme, anchor: p.anchor, editMode: p.editMode },
      h(ReviewScore, {
        id: p.id,
        locale: p.locale,
        components: p.components,
        labels: p.labels as never,
        headingLevel: level23(p.headingLevel),
        display: (p.variant ?? "points") as "points" | "percent" | "stars",
        score: p.score,
        max: p.max,
        title: p.title as string | undefined,
        scoreLabel: p.scoreLabel as string | undefined,
        criteria: p.criteria as { label: string; score: number }[] | undefined,
        pros: p.pros as string[] | undefined,
        cons: p.cons as string[] | undefined,
        verdict: p.verdict as string | undefined,
        reviewer: p.reviewer,
        datePublished: p.datePublished,
        aggregateRating: p.aggregateRating,
        item: p.item as ReviewedItem | undefined,
        jsonLd: false,
      }),
    ),
  ),
});

/** Every news / commerce definition, for `createRegistry([...siteBlocks1, ...siteBlocks2, ...newsBlocks])`. */
export const newsBlocks: readonly AnyBlockDefinition[] = [
  newsMastheadBlock,
  featuredPostsBlock,
  postCardBlock,
  postBlockBlock,
  postTabsBlock,
  newsTickerBlock,
  adSlotBlock,
  newsColumnsBlock,
  popularPostsBlock,
  recentCommentsBlock,
  categoryCountsBlock,
  followCountsBlock,
  productGridBlock,
  reviewScoreBlock,
];

/** A registry of just these blocks. */
export const newsRegistry = createRegistry(newsBlocks);
