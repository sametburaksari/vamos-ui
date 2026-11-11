// Block definitions (layer 2) for registry-1 site blocks: announcement, navbar, hero, features,
// logo-strip, stats, page-intro, rich-text, media-text, cta, faq, steps. Server/admin only — this
// file imports zod; component files never import it.

import type * as React from "react";
import { z } from "zod";
import { f, localizedSchema } from "../schema/fields";
import { defineBlock, type AnyBlockDefinition } from "../schema/define-block";
import { sanitizeHref } from "../schema/safety";
import { richFromText } from "../schema/rich-doc";
import type { LintIssueInput } from "../schema/lint-types";
import { AnnouncementBar } from "./announcement-bar";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { FeatureGrid } from "./feature-grid";
import { LogoStrip } from "./logo-strip";
import { StatsBand } from "./stats-band";
import { PageIntro, breadcrumbJsonLd } from "./page-intro";
import { RichTextSection } from "./rich-text-section";
import { MediaText } from "./media-text";
import { Cta } from "./cta";
import { Faq, faqJsonLd } from "./faq";
import { Steps } from "./process";

// Components take richer plain props (ReactNode, unions) than the JSON schema; the schema shape
// is a subset of each component's props, checked by registry-1.test.tsx through the renderer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asBlock = (c: React.ComponentType<any>) => c as React.ComponentType<any>;

/** A localized, sanitised href (relative, #, ?, http(s), mailto, tel, sms). */
const href = (label = "Link") =>
  localizedSchema(
    z
      .string()
      .min(1)
      .refine((h) => sanitizeHref(h) !== null, { message: "Unsafe or unsupported link (javascript:, data: and unknown schemes are rejected)." }),
  ).meta({
    title: label,
    vamos: { field: "text", localized: true, widget: "link", label },
  });

const metaList = (max: number, opts: { variants?: readonly string[] } = {}) =>
  f.list(f.group({ label: f.text({ max: 24, label: "Label" }), value: f.text({ max: 80, label: "Value" }) }), { max, itemLabel: "label", label: "Facts", ...opts });

const header = {
  eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
  title: f.heading({ max: 90, label: "Title" }).optional(),
  lead: f.text({ max: 240, multiline: true, label: "Lead" }).optional(),
};

const RICH_BODY = { nodes: ["paragraph", "heading", "list", "blockquote", "hr"] as const, marks: ["bold", "italic", "link"] as const };

// Unsplash photos used by the examples (real venues, no stock "laptop smile").
const IMG = {
  dining: { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=2000&q=70&auto=format&fit=crop", width: 2000, height: 1333 },
  table: { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=2000&q=70&auto=format&fit=crop", width: 2000, height: 1333 },
  spa: { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=70&auto=format&fit=crop", width: 1400, height: 1750 },
  spaStones: { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1067 },
  office: { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=2400&q=70&auto=format&fit=crop", width: 2400, height: 1600 },
  team: { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=70&auto=format&fit=crop", width: 1600, height: 1067 },
  dashboard: { src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2400&q=70&auto=format&fit=crop", width: 2400, height: 1600 },
};
const book = { link: { href: "/reservations", label: "Book a table" }, style: "primary" as const };

/* ---------------------------------------------------------------- Announcement */

const announcementSchema = z.object({
  text: f.text({ max: 120, label: "Text" }),
  link: f.link({ label: "Link" }).optional(),
  tone: f.select(["neutral", "accent", "warning"], { label: "Tone" }).optional(),
  dismissible: f.toggle({ label: "Can be dismissed" }).optional(),
  label: f.text({ max: 16, label: "Label", variants: ["centered"] }).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  until: z.iso.datetime({ offset: true }).optional(),
});

export const announcementBlock = defineBlock({
  type: "announcement",
  version: 1,
  title: "Announcement bar",
  description: "One-line, time-boxed notice above the navbar.",
  category: "site",
  region: "header",
  icon: "megaphone",
  keywords: ["banner", "notice", "top bar", "holiday"],
  variants: ["inline", "centered"],
  defaultVariant: "inline",
  variantMeta: {
    inline: { label: "Inline", description: "36px strip, text at the start, underlined link with an arrow right after it, dismiss at the end." },
    centered: { label: "Centred", description: "Same strip, a mono “Notice” label before the centred text and link." },
  },
  supports: { theme: false, spacing: false },
  schema: announcementSchema,
  preview: { props: { text: "Closed 1–3 April for Eid — open again Thursday from noon.", link: { href: "/hours", label: "Holiday hours" }, tone: "neutral" } },
  examples: (variant): z.input<typeof announcementSchema> =>
    variant === "centered"
      ? { text: "v2.4 is out: shared inboxes and WhatsApp templates.", link: { href: "/changelog/2-4", label: "What’s new" }, tone: "accent", dismissible: true, label: "Release" }
      : { text: "Closed 1–3 April for Eid — open again Thursday from noon.", link: { href: "/hours", label: "Holiday hours" }, tone: "neutral" },
  component: asBlock(AnnouncementBar),
});

/* ---------------------------------------------------------------- Navbar */

const navLink = { label: f.text({ max: 40, label: "Label" }), href: href(), description: f.text({ max: 80, label: "Description" }).optional() };

const navbarSchema = z.object({
  logo: f.image({ label: "Logo" }).optional(),
  logoDark: f.image({ label: "Logo on dark" }).optional(),
  wordmark: f.text({ max: 30, label: "Wordmark" }).optional(),
  homeHref: href("Home link").optional(),
  items: f.list(f.group({ ...navLink, children: f.list(f.group(navLink), { max: 8, itemLabel: "label", label: "Submenu" }).optional() }), { max: 7, itemLabel: "label", label: "Links" }),
  actions: f.list(f.cta(), { max: 2, label: "Actions" }).optional(),
  phone: f.phone({ label: "Phone" }).optional(),
  locales: f.list(f.group({ code: f.text({ max: 8, localized: false, label: "Code" }), href: href() }), { max: 6, label: "Languages" }).optional(),
  sticky: f.toggle({ label: "Sticky" }).optional(),
  overlay: f.toggle({ label: "Transparent over the hero" }).optional(),
  panelMeta: metaList(3).optional(),
});

export const navbarBlock = defineBlock({
  type: "navbar",
  version: 1,
  title: "Navbar",
  description: "Site top navigation: links, phone, language switch and one call to action.",
  category: "site",
  region: "header",
  icon: "panel-top",
  keywords: ["menu", "header", "navigation"],
  variants: ["bar", "split", "minimal", "rail"],
  defaultVariant: "bar",
  variantMeta: {
    bar: { label: "Bar", description: "Logo at the start, small links beside it, a mono phone number and one CTA at the end; hairline below." },
    split: { label: "Split", description: "Logo dead centre, links split to both sides, the CTA as a text link at the far end (restaurant, spa)." },
    minimal: { label: "Minimal", description: "Wordmark + “Menu” + CTA; a full-screen menu with display-size serif links and address/hours at the bottom." },
    rail: { label: "Rail", description: "Links in one framed pill in the middle (glassy in glass mode), “Sign in” ghost + “Try free” primary at the end (SaaS)." },
  },
  supports: { spacing: false },
  schema: navbarSchema,
  preview: {
    props: {
      wordmark: "Kıyı",
      items: [
        { label: "Menu", href: "/menu" },
        { label: "Private dining", href: "/private-dining" },
        { label: "Wine", href: "/wine" },
        { label: "Visit", href: "/visit" },
      ],
      phone: "+902160000000",
      actions: [book],
      sticky: true,
    },
  },
  examples: (variant): z.input<typeof navbarSchema> => {
    if (variant === "rail")
      return {
        wordmark: "Ledgerly",
        items: [
          { label: "Product", href: "/product" },
          { label: "Pricing", href: "/pricing" },
          { label: "Customers", href: "/customers" },
          { label: "Changelog", href: "/changelog" },
        ],
        actions: [
          { link: { href: "/login", label: "Sign in" }, style: "secondary" },
          { link: { href: "/signup", label: "Try free" }, style: "primary" },
        ],
        sticky: true,
      };
    if (variant === "split")
      return {
        wordmark: "Hamam Moda",
        items: [
          { label: "Treatments", href: "/treatments" },
          { label: "Rituals", href: "/rituals" },
          { label: "Gift cards", href: "/gift-cards" },
          { label: "Visit", href: "/visit" },
        ],
        actions: [{ link: { href: "/book", label: "Book a treatment" }, style: "link" }],
      };
    if (variant === "minimal")
      return {
        wordmark: "Studio Arda",
        items: [
          { label: "Work", href: "/work" },
          { label: "Services", href: "/services" },
          { label: "About", href: "/about" },
          { label: "Journal", href: "/journal" },
          { label: "Contact", href: "/contact" },
        ],
        actions: [{ link: { href: "/contact", label: "Start a project" }, style: "primary" }],
        panelMeta: [
          { label: "Studio", value: "Rıhtım Caddesi 14, Cevizli, Istanbul" },
          { label: "Hours", value: "Mon–Fri, 9:30–18:30" },
        ],
      };
    return {
      wordmark: "Kıyı",
      items: [
        { label: "Menu", href: "/menu" },
        { label: "Private dining", href: "/private-dining" },
        { label: "Wine", href: "/wine" },
        { label: "Visit", href: "/visit" },
      ],
      phone: "+902160000000",
      actions: [book],
      sticky: true,
    };
  },
  component: asBlock(Navbar),
});

/* ---------------------------------------------------------------- Hero */

const heroSchema = z.object({
  eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
  title: f.heading({ max: 90, label: "Title" }),
  lead: f.text({ max: 240, multiline: true, label: "Lead" }).optional(),
  actions: f.list(f.cta(), { max: 2, label: "Actions" }).optional(),
  media: f.image({ label: "Image", variants: ["editorial", "split-media", "full-bleed"] }).optional(),
  video: z
    .object({ src: z.string().regex(/^(https:\/\/|\/)[^\s]+\.mp4(\?[^\s]*)?$/i, { message: "Use an MP4 URL." }) })
    .meta({ title: "Background video", vamos: { field: "group", label: "Background video", variants: ["full-bleed"] } })
    .optional(),
  caption: f.text({ max: 80, label: "Photo caption", variants: ["split-media"] }).optional(),
  meta: metaList(4, { variants: ["editorial", "split-media", "product"] }).optional(),
  screenshot: f.image({ label: "Screenshot", variants: ["product"] }).optional(),
  release: f
    .group({ label: f.text({ max: 60, label: "Label" }), href: href(), tag: f.text({ max: 12, localized: false, label: "Tag" }).optional() }, { label: "Release chip", variants: ["product"] })
    .optional(),
  services: f.list(f.group({ label: f.text({ max: 40, label: "Label" }), href: href() }), { max: 8, itemLabel: "label", label: "Services", variants: ["statement"] }).optional(),
  aside: f
    .group({ title: f.text({ max: 40, label: "Title" }), body: f.text({ max: 120, label: "Text" }).optional(), cta: f.cta().optional() }, { label: "Corner card", variants: ["full-bleed"] })
    .optional(),
  height: f.select(["auto", "screen"], { label: "Height", variants: ["full-bleed"] }).optional(),
});

export const heroBlock = defineBlock({
  type: "hero",
  version: 1,
  title: "Hero",
  description: "The first screen and the page h1, in five characters.",
  category: "intro",
  icon: "panel-top",
  keywords: ["header", "intro", "banner", "above the fold"],
  variants: ["editorial", "split-media", "full-bleed", "product", "statement"],
  defaultVariant: "editorial",
  variantMeta: {
    editorial: {
      label: "Editorial",
      description: "Huge start-aligned serif title with one italic word, a narrow lead and a text-link CTA, mono facts at the end, a 21:9 photo strip bleeding edge to edge.",
    },
    "split-media": { label: "Split media", description: "Asymmetric 7/5: text and two buttons on the start side, a 4:5 portrait bleeding off the end edge with a mono caption in its corner." },
    "full-bleed": { label: "Full bleed", description: "Full-screen photo or muted video under a bottom-up scrim; title bottom-start, a small hours + booking card bottom-end. Always dark." },
    product: { label: "Product", description: "Release chip, title, lead, “Try free / Watch demo”; a real screenshot without device frame, cropped by the section’s bottom edge." },
    statement: { label: "Statement", description: "No image: one centred sentence at display-2xl, services underneath as slash-separated links." },
  },
  supports: { pageTitle: true },
  schema: heroSchema,
  preview: {
    variant: "editorial",
    props: {
      eyebrow: "Studio Arda · Maltepe, Istanbul",
      title: "Websites for places people *actually* visit.",
      lead: "We design and run sites for restaurants, clinics and hotels on the Asian side — menus your staff can edit and booking that lands on WhatsApp.",
      actions: [{ link: { href: "/work", label: "See the work" }, style: "link" }],
      meta: [
        { label: "Founded", value: "2014" },
        { label: "Sites live", value: "126" },
      ],
      media: { ...IMG.office, alt: "The studio’s long table by the window, late afternoon", focal: { x: 0.5, y: 0.6 } },
    },
  },
  examples: (variant): z.input<typeof heroSchema> => {
    switch (variant) {
      case "split-media":
        return {
          eyebrow: "Day spa · Moda",
          title: "Two hours, *nowhere* to be.",
          lead: "A marble hammam, a quiet pool and therapists who have been with us for a decade. Open daily from 10 am; last treatment at 8.",
          actions: [
            { link: { href: "/book", label: "Book a treatment" }, style: "primary" },
            { link: { href: "/treatments", label: "Treatments & prices" }, style: "secondary" },
          ],
          media: { ...IMG.spa, alt: "A therapist preparing warm stones beside a massage table", focal: { x: 0.5, y: 0.4 } },
          caption: "Treatment room 3, 2nd floor",
        };
      case "full-bleed":
        return {
          eyebrow: "Meyhane · Cevizli",
          title: "Dinner, *slowly*.",
          lead: "Twenty-two cold meze and fish from the morning boats.",
          media: { ...IMG.dining, alt: "The dining room at dusk, candles on oak tables" },
          aside: { title: "Open today", body: "18:00 – 00:30 · kitchen until 23:00", cta: book },
          height: "auto",
        };
      case "product":
        return {
          release: { tag: "v2.4", label: "November — shared inboxes", href: "/changelog/2-4" },
          title: "Every booking request in *one* inbox.",
          lead: "WhatsApp, Instagram and your website form, answered by the whole front desk. Set up in an afternoon.",
          actions: [
            { link: { href: "/signup", label: "Try free for 14 days" }, style: "primary" },
            { link: { href: "/demo", label: "Watch a 3-min demo" }, style: "secondary" },
          ],
          screenshot: { ...IMG.dashboard, alt: "The inbox: conversations on the left, a booking thread open on the right" },
        };
      case "statement":
        return {
          title: "We build sites that *open* the door, not just the browser tab.",
          services: [
            { label: "Restaurant sites", href: "/services/restaurants" },
            { label: "Clinic & spa sites", href: "/services/clinics" },
            { label: "Ad management", href: "/services/ads" },
            { label: "Local SEO", href: "/services/local-seo" },
          ],
        };
      default:
        return {
          eyebrow: "Studio Arda · Maltepe, Istanbul",
          title: "Websites for places people *actually* visit.",
          lead: "We design and run sites for restaurants, clinics and hotels on the Asian side — menus your staff can edit and booking that lands on WhatsApp.",
          actions: [{ link: { href: "/work", label: "See the work" }, style: "link" }],
          meta: [
            { label: "Founded", value: "2014" },
            { label: "Sites live", value: "126" },
          ],
          media: { ...IMG.office, alt: "The studio’s long table by the window, late afternoon", focal: { x: 0.5, y: 0.6 } },
        };
    }
  },
  lint: (props, node) => {
    const v = node.variant ?? "editorial";
    const out: LintIssueInput[] = [];
    if ((v === "split-media" || v === "full-bleed") && !props.media) out.push({ code: "hero-missing-media", severity: "warning", message: `The ${v} hero needs a photo.`, path: "props.media" });
    if (v === "product" && !props.screenshot) out.push({ code: "hero-missing-media", severity: "warning", message: "The product hero needs a real screenshot.", path: "props.screenshot" });
    if (v === "full-bleed" && props.video && !props.media)
      out.push({ code: "hero-missing-poster", severity: "error", message: "A background video needs a poster image (media).", path: "props.media" });
    return out;
  },
  component: asBlock(Hero),
});

/* ---------------------------------------------------------------- Feature grid */

export const featuresBlock = defineBlock({
  type: "features",
  version: 1,
  title: "Feature grid",
  description: "Services, treatments or product modules — without the card wall.",
  category: "content",
  icon: "layout-grid",
  keywords: ["services", "features", "benefits", "modules"],
  variants: ["list", "grid", "tabs", "sticky-media"],
  defaultVariant: "list",
  variantMeta: {
    list: { label: "List", description: "Two columns of rows; a hairline on top of each, a mono 01 at the start, title and description. No cards, no icons." },
    grid: { label: "Grid", description: "3–4 columns; each item a 1px top rule and 16px of space above the title, an optional small icon before it." },
    tabs: { label: "Tabs", description: "Feature titles stacked on the start side (active one marked by a vertical accent rule), its large image on the end side." },
    "sticky-media": { label: "Sticky media", description: "A sticky image on the start side swaps as the long list on the end side scrolls (CSS view timelines)." },
  },
  schema: z.object({
    ...header,
    items: f.list(
      f.group({
        title: f.text({ max: 60, label: "Title" }),
        text: f.text({ max: 220, multiline: true, label: "Text" }).optional(),
        icon: f.icon({ label: "Icon", variants: ["grid"] }).optional(),
        media: f.image({ label: "Image", variants: ["grid", "tabs", "sticky-media"] }).optional(),
        link: f.group({ href: href(), label: f.text({ max: 40, label: "Label" }).optional() }, { label: "Link" }).optional(),
      }),
      { min: 2, max: 12, itemLabel: "title", label: "Items" },
    ),
    numbered: f.toggle({ label: "Numbered" }).optional(),
    columns: z
      .union([z.literal(2), z.literal(3), z.literal(4)])
      .meta({ title: "Columns", vamos: { field: "select", label: "Columns", variants: ["grid"] } })
      .optional(),
  }),
  preview: {
    props: {
      eyebrow: "Services",
      title: "What we *build*",
      lead: "Four things, done properly. Everything else we hand to people who do it better.",
      items: [
        { title: "Restaurant & venue sites", text: "Menus your floor staff edit from a phone, allergens that stay in sync, booking that lands in WhatsApp." },
        { title: "Clinic & spa sites", text: "Treatment pages that rank for the district, prices with tax notes, and appointment requests without a call centre." },
        { title: "Ad management", text: "Google and Meta campaigns measured against real bookings, not clicks. Monthly report in plain language." },
        { title: "Local SEO", text: "Business Profile upkeep, review replies and a weekly grid of where you rank across the neighbourhood." },
      ],
    },
  },
  component: asBlock(FeatureGrid),
});

/* ---------------------------------------------------------------- Logo strip */

export const logoStripBlock = defineBlock({
  type: "logo-strip",
  version: 1,
  title: "Logo strip",
  description: "“Brands we work with” proof.",
  category: "proof",
  icon: "award",
  keywords: ["clients", "logos", "customers", "trusted by"],
  variants: ["row", "marquee", "grid"],
  defaultVariant: "row",
  variantMeta: {
    row: { label: "Row", description: "A small caption at the start, logos on one line at an equal optical height (28px), greyscale." },
    marquee: { label: "Marquee", description: "A full-width endless band with faded edges; pauses on hover and focus; static under reduced motion." },
    grid: { label: "Grid", description: "4–6 columns separated by 1px gridlines like a table, logos centred in cells." },
  },
  schema: z.object({
    caption: f.text({ max: 80, label: "Caption" }).optional(),
    logos: f.list(
      f.group({
        name: f.text({ max: 40, localized: false, label: "Brand" }),
        image: f.image({ label: "Logo" }),
        imageDark: f.image({ label: "Logo on dark" }).optional(),
        link: f.group({ href: href(), newTab: f.toggle().optional() }).optional(),
      }),
      { min: 4, max: 24, itemLabel: "name", label: "Logos" },
    ),
    monochrome: f.toggle({ label: "Monochrome" }).optional(),
    columns: z
      .union([z.literal(4), z.literal(5), z.literal(6)])
      .meta({ title: "Columns", vamos: { field: "select", label: "Columns", variants: ["grid"] } })
      .optional(),
    speed: f.number({ min: 15, max: 120, label: "Seconds per loop", variants: ["marquee"] }).optional(),
  }),
  preview: {
    props: {
      caption: "Running the sites of 120+ businesses since 2014",
      logos: ["Kıyı", "Hamam Moda", "Ledgerly", "Defne Clinic"].map((name) => ({
        name,
        image: { src: `https://ui.vamos.ist/logos/${name.toLowerCase().replace(/[^a-z]+/g, "-")}.svg`, width: 160, height: 40, alt: name },
      })),
    },
  },
  lint: (props, node) =>
    node.variant === "marquee" && props.logos.length < 6
      ? [{ code: "marquee-too-few", severity: "info", message: "A marquee with fewer than 6 logos repeats visibly — use the row variant.", path: "props.logos" }]
      : [],
  component: asBlock(LogoStrip),
});

/* ---------------------------------------------------------------- Stats band */

export const statsBlock = defineBlock({
  type: "stats",
  version: 1,
  title: "Stats band",
  description: "Concrete, sourced numbers.",
  category: "proof",
  icon: "chart-bar",
  keywords: ["numbers", "figures", "metrics", "results"],
  variants: ["inline", "with-text", "ledger"],
  defaultVariant: "inline",
  variantMeta: {
    inline: { label: "Inline", description: "3–4 figures on one line between vertical rules; the figure at display-l, unit as a small superscript, label below." },
    "with-text": { label: "With text", description: "A paragraph on the start side, a 2×2 grid of figures on the end side." },
    ledger: { label: "Ledger", description: "Each figure a row — label, dotted leader, figure — like an annual report, with a mono source line." },
  },
  schema: z.object({
    ...header,
    body: f.rich({ nodes: ["paragraph", "list"], marks: ["bold", "italic", "link"], label: "Text", variants: ["with-text"] }).optional(),
    items: f.list(
      f.group({
        value: z.union([z.number(), z.string().max(12)]).meta({ title: "Figure", vamos: { field: "text", label: "Figure" } }),
        unit: f.text({ max: 8, localized: false, label: "Unit" }).optional(),
        unitLabel: f.text({ max: 24, label: "Unit (spoken)" }).optional(),
        label: f.text({ max: 60, label: "Label" }),
        source: f.text({ max: 80, label: "Source" }).optional(),
      }),
      { min: 2, max: 5, itemLabel: "label", label: "Figures" },
    ),
  }),
  preview: {
    props: {
      items: [
        { value: 4.8, label: "Google rating", source: "1,240 reviews · Google Business Profile, Nov 2026" },
        { value: 340, label: "Sites launched in 12 years", source: "Studio records, 2014–2026" },
        { value: 38, unit: "%", label: "Of bookings now arrive on WhatsApp", source: "Client median, Q3 2026" },
        { value: "11 min", label: "Median first reply to a booking request", source: "Inbox data, Oct 2026" },
      ],
    },
  },
  lint: (props) =>
    props.items.flatMap((it, i): LintIssueInput[] => {
      const out: LintIssueInput[] = [];
      if (!it.source)
        out.push({ code: "stat-missing-source", severity: "warning", message: "Add a source to this figure (D6-8): unsourced numbers read as marketing.", path: `props.items.${i}.source` });
      if (typeof it.value === "number" && it.value >= 100 && it.value % 100 === 0 && it.unit === "+")
        out.push({ code: "stat-round-number", severity: "info", message: "Round “500+” figures look invented — use the exact count.", path: `props.items.${i}.value` });
      return out;
    }),
  component: asBlock(StatsBand),
});

/* ---------------------------------------------------------------- Page intro */

export const pageIntroBlock = defineBlock({
  type: "page-intro",
  version: 1,
  title: "Page intro",
  description: "The h1 and breadcrumb of an inner page.",
  category: "intro",
  icon: "heading",
  keywords: ["page header", "title", "breadcrumb"],
  variants: ["simple", "with-media", "ruled"],
  defaultVariant: "simple",
  variantMeta: {
    simple: { label: "Simple", description: "A small breadcrumb, the title at display-l, the lead beside it on wide containers." },
    "with-media": { label: "With media", description: "Title + lead, then a 21:9 image bleeding past the container." },
    ruled: { label: "Ruled", description: "Title at the start, 2–3 facts behind a vertical rule at the end, a full-width hairline below." },
  },
  supports: { pageTitle: true },
  schema: z.object({
    breadcrumb: f.list(f.group({ label: f.text({ max: 40, label: "Label" }), href: href().optional() }), { max: 6, itemLabel: "label", label: "Breadcrumb" }).optional(),
    eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
    title: f.heading({ max: 70, label: "Title" }),
    lead: f.text({ max: 200, multiline: true, label: "Lead" }).optional(),
    media: f.image({ aspect: "21:9", label: "Image", variants: ["with-media"] }).optional(),
    meta: metaList(3, { variants: ["ruled"] }).optional(),
  }),
  preview: {
    props: {
      breadcrumb: [{ label: "Home", href: "/" }, { label: "Treatments" }],
      title: "Treatments, *by the hour*",
      lead: "Every treatment starts with twenty minutes in the hammam. Prices include VAT and a pot of linden tea afterwards.",
    },
  },
  jsonLd: (props) => (props.breadcrumb?.length ? breadcrumbJsonLd(props.breadcrumb.map((c) => ({ label: c.label, href: c.href }))) : null),
  component: asBlock(PageIntro),
});

/* ---------------------------------------------------------------- Rich text */

export const richTextBlock = defineBlock({
  type: "rich-text",
  version: 1,
  title: "Rich text section",
  description: "Long text: about, privacy notice, service description.",
  category: "text",
  icon: "file-text",
  keywords: ["text", "article", "legal", "privacy", "about"],
  variants: ["column", "aside-heading", "two-column"],
  defaultVariant: "column",
  variantMeta: {
    column: { label: "Column", description: "A 42rem column on grid columns 2–9 (not centred); optional drop cap in editorial." },
    "aside-heading": { label: "Aside heading", description: "A sticky title on the start side (4 cols), the text on the end side (7 cols) — good for legal texts." },
    "two-column": { label: "Two columns", description: "Newspaper columns on wide containers only." },
  },
  schema: z.object({
    eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
    title: f.heading({ max: 90, label: "Title" }).optional(),
    body: f.rich({ ...RICH_BODY, label: "Text" }),
    dropCap: f.toggle({ label: "Drop cap", variants: ["column"] }).optional(),
    note: f.text({ max: 80, label: "Note", variants: ["aside-heading"] }).optional(),
    size: f.select(["sm", "md", "lg"], { label: "Text size" }).optional(),
  }),
  preview: {
    props: {
      title: "How we *started*",
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ text: "Kıyı opened in 2011 as a six-table meyhane next to the Cevizli fish market. The menu was whatever the boats brought in, written on a slate by the door." }],
          },
          {
            type: "paragraph",
            content: [
              { text: "Fifteen years later the slate is still there. So is " },
              { text: "Hüseyin Usta", marks: [{ type: "bold" }] },
              { text: ", who has cleaned every sea bass we’ve served." },
            ],
          },
        ],
      },
    },
  },
  component: asBlock(RichTextSection),
});

/* ---------------------------------------------------------------- Media + text */

export const mediaTextBlock = defineBlock({
  type: "media-text",
  version: 1,
  title: "Media + text",
  description: "An image or video beside text — the most used body section.",
  category: "content",
  icon: "image",
  keywords: ["image and text", "split", "about", "video"],
  variants: ["side", "overlap", "bleed"],
  defaultVariant: "side",
  variantMeta: {
    side: { label: "Side by side", description: "5/7 or 7/5; the text top-aligned with the image, not vertically centred." },
    overlap: { label: "Overlap", description: "The image takes 8 columns; a surface panel with the text overlaps its bottom corner by 2." },
    bleed: { label: "Bleed", description: "The image runs to the section edge, the text stays inside the container." },
  },
  schema: z.object({
    eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
    title: f.heading({ max: 90, label: "Title" }),
    body: f.rich({ nodes: ["paragraph", "list"], marks: ["bold", "italic", "link"], label: "Text" }).optional(),
    bullets: f.list(f.text({ max: 90 }), { max: 6, label: "Points" }).optional(),
    cta: f.cta({ label: "Action" }).optional(),
    media: f.image({ label: "Image" }),
    video: f
      .group(
        {
          provider: f.select(["youtube", "vimeo", "mp4"], { label: "Provider" }),
          url: z.url().meta({ title: "URL", vamos: { field: "text", label: "URL", widget: "url" } }),
          title: f.text({ max: 80, label: "Video title" }).optional(),
        },
        { label: "Video" },
      )
      .optional(),
    mediaSide: f.select(["start", "end"], { label: "Image side" }).optional(),
    aspect: f.select(["4:5", "3:2", "1:1"], { label: "Image ratio" }).optional(),
  }),
  preview: {
    props: {
      eyebrow: "The kitchen",
      title: "Fish from the *morning* boats",
      body: richFromText("Hüseyin Usta is at the Cevizli market at six. What he buys decides the menu — there is no printed fish list, only the slate by the door."),
      bullets: ["Sea bass, bonito and red mullet in season", "Meze made the same morning", "Raki list of forty, by the glass"],
      cta: { link: { href: "/menu", label: "Tonight’s menu" }, style: "link" },
      media: { ...IMG.table, alt: "Plates of meze on a white tablecloth" },
    },
  },
  component: asBlock(MediaText),
});

/* ---------------------------------------------------------------- CTA */

const ctaSchema = z.object({
  eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
  title: f.heading({ max: 80, label: "Title" }),
  lead: f.text({ max: 200, multiline: true, label: "Lead" }).optional(),
  actions: f.list(f.cta(), { max: 2, label: "Actions" }).optional(),
  media: f.image({ label: "Image", variants: ["split"] }).optional(),
  contact: f
    .group(
      { phone: f.phone().optional(), whatsapp: f.phone({ label: "WhatsApp" }).optional(), whatsappText: f.text({ max: 200, label: "WhatsApp message" }).optional() },
      { label: "Contact line", variants: ["band", "split", "minimal"] },
    )
    .optional(),
  newsletter: f
    .group(
      {
        action: z
          .string()
          .min(1)
          .refine((h) => sanitizeHref(h) !== null)
          .meta({ title: "Form action URL", vamos: { field: "text", label: "Form action URL", widget: "url" } })
          .optional(),
        placeholder: f.text({ max: 60 }).optional(),
        buttonLabel: f.text({ max: 30 }).optional(),
        consent: f.rich({ nodes: ["paragraph"], marks: ["bold", "italic", "link"], label: "Consent text" }).optional(),
      },
      { label: "Newsletter", variants: ["newsletter"] },
    )
    .optional(),
  booking: f
    .group(
      {
        provider: f.select(["whatsapp", "url", "phone", "embed"], { label: "Provider" }),
        whatsapp: f.phone({ label: "WhatsApp" }).optional(),
        phone: f.phone().optional(),
        url: z
          .url()
          .meta({ title: "Booking URL", vamos: { field: "text", label: "Booking URL", widget: "url" } })
          .optional(),
        fields: f.list(f.select(["date", "time", "guests", "service"]), { max: 4, label: "Fields" }).optional(),
        services: f.list(f.text({ max: 40, localized: false }), { max: 12, label: "Services" }).optional(),
        times: f.list(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), { max: 48, label: "Times" }).optional(),
        maxGuests: f.number({ min: 1, max: 40, int: true, label: "Largest party" }).optional(),
        closedDays: f.list(f.select(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]), { max: 7, label: "Closed on" }).optional(),
        timeZone: z.string().optional(),
        messageTemplate: f.text({ max: 200, label: "Message template" }).optional(),
        preview: f.image({ label: "Calendar preview" }).optional(),
      },
      { label: "Booking", variants: ["booking"] },
    )
    .optional(),
  fineprint: f.text({ max: 160, label: "Small print" }).optional(),
});

export const ctaBlock = defineBlock({
  type: "cta",
  version: 1,
  title: "CTA",
  description: "End-of-page call to action, newsletter signup or booking bar.",
  category: "conversion",
  icon: "send",
  keywords: ["call to action", "contact", "newsletter", "booking", "reservation"],
  variants: ["band", "split", "minimal", "newsletter", "booking"],
  defaultVariant: "band",
  variantMeta: {
    band: { label: "Band", description: "A full-width accent band; a big title at the start, actions at the end on the bottom edge, a mono phone + WhatsApp line beneath." },
    split: { label: "Split", description: "Title + action on the start side, a cropped venue or team photo on the end side." },
    minimal: { label: "Minimal", description: "No background change; a very large centred title and one huge underlined text link. No buttons." },
    newsletter: { label: "Newsletter", description: "Title + short text at the start, email field and button side by side at the end, consent text underneath." },
    booking: { label: "Booking bar", description: "A thin bar — date · time · guests or service — separated by hairlines, ending with “Ask for availability”; 2×2 on mobile." },
  },
  schema: ctaSchema,
  preview: {
    props: {
      title: "Book the *long table*",
      lead: "Up to fourteen guests, a set menu of nine plates and the wine pairing Ece picks on the day.",
      actions: [book, { link: { href: "/private-dining", label: "Private dining" }, style: "secondary" }],
      contact: { phone: "+902160000000", whatsapp: "+905321234567" },
    },
  },
  examples: (variant): z.input<typeof ctaSchema> => {
    switch (variant) {
      case "minimal":
        return { title: "Have a place people should *find*?", actions: [{ link: { href: "/contact", label: "Let’s talk about your project" }, style: "link" }] };
      case "newsletter":
        return {
          title: "The Thursday wine list, by email",
          lead: "Four bottles we opened this week and what to eat with them. One email, Thursdays at noon.",
          newsletter: { action: "/api/newsletter", consent: richFromText("We only send the list. Unsubscribe from any email in one click.") },
        };
      case "booking":
        return { title: "Reserve a table", booking: { provider: "whatsapp", whatsapp: "+905321234567", fields: ["date", "time", "guests"], closedDays: ["mon"], timeZone: "Europe/Istanbul" } };
      case "split":
        return {
          title: "Bring your *team* for lunch",
          lead: "Weekday set lunch for groups of six to twenty, in and out in fifty minutes.",
          actions: [{ link: { href: "/groups", label: "Plan a group lunch" }, style: "primary" }],
          media: { ...IMG.table, alt: "A long table set for lunch" },
        };
      default:
        return {
          title: "Book the *long table*",
          lead: "Up to fourteen guests, a set menu of nine plates and the wine pairing Ece picks on the day.",
          actions: [book, { link: { href: "/private-dining", label: "Private dining" }, style: "secondary" }],
          contact: { phone: "+902160000000", whatsapp: "+905321234567" },
        };
    }
  },
  component: asBlock(Cta),
});

/* ---------------------------------------------------------------- FAQ */

export const faqBlock = defineBlock({
  type: "faq",
  version: 1,
  title: "FAQ",
  description: "Questions and answers; zero-JS accordion; FAQPage JSON-LD.",
  category: "content",
  icon: "help-circle",
  keywords: ["questions", "faq", "accordion", "help"],
  variants: ["split", "stacked", "columns"],
  defaultVariant: "split",
  variantMeta: {
    split: { label: "Split", description: "A sticky title and a “Can’t find your question?” link on the start side, the accordion on the end side; a thin + turns into −." },
    stacked: { label: "Stacked", description: "Title above, the accordion full width at a 42rem measure." },
    columns: { label: "Columns", description: "No accordion — every question and answer open in two columns (short answers, maximally indexable)." },
  },
  schema: z.object({
    ...header,
    items: f.list(f.group({ q: f.text({ max: 140, label: "Question" }), a: f.rich({ nodes: ["paragraph", "list"], marks: ["bold", "italic", "link"], label: "Answer" }) }), {
      min: 1,
      max: 30,
      itemLabel: "q",
      label: "Questions",
    }),
    exclusive: f.toggle({ label: "One open at a time" }).optional(),
    openFirst: f.toggle({ label: "Open the first" }).optional(),
    contact: f.cta({ label: "Contact link" }).optional(),
  }),
  preview: {
    props: {
      title: "Before you *book*",
      items: [
        { q: "Is there parking?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Yes — the Piazza garage, level −2. Show your receipt for three hours free." }] }] } },
        { q: "Can I cancel a booking?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Free until 24 hours before. After that we keep the ₺500 deposit per person." }] }] } },
        { q: "Do you cater for allergies?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Tell us when you book. Every dish on the menu lists its 14 allergens." }] }] } },
      ],
      contact: { link: { href: "https://wa.me/905321234567", label: "Message us on WhatsApp", newTab: true }, style: "link" },
    },
  },
  jsonLd: (props) => faqJsonLd(props.items.map((it) => ({ q: it.q, a: it.a }))),
  component: asBlock(Faq),
});

/* ---------------------------------------------------------------- Steps */

export const stepsBlock = defineBlock({
  type: "steps",
  version: 1,
  title: "Process / steps",
  description: "How we work, a first visit, setup steps — an ordered list.",
  category: "content",
  icon: "list-ordered",
  keywords: ["process", "how it works", "timeline", "steps"],
  variants: ["vertical", "horizontal", "split"],
  defaultVariant: "vertical",
  variantMeta: {
    vertical: { label: "Vertical", description: "A thin rule along the start edge with mono numbers on it; a duration tag per step." },
    horizontal: { label: "Horizontal", description: "A timeline on wide containers — numbers above the line, text below; vertical on narrow ones." },
    split: { label: "Split", description: "A sticky title on the start side (4 cols), big display-size numbers with hairline-separated steps on the end side." },
  },
  schema: z.object({
    ...header,
    steps: f.list(
      f.group({
        title: f.text({ max: 60, label: "Title" }),
        text: f.text({ max: 240, multiline: true, label: "Text" }).optional(),
        duration: f.text({ max: 20, label: "Duration" }).optional(),
        media: f.image({ label: "Image" }).optional(),
      }),
      { min: 2, max: 8, itemLabel: "title", label: "Steps" },
    ),
    actions: f.list(f.cta(), { max: 2, label: "Actions" }).optional(),
  }),
  preview: {
    props: {
      eyebrow: "How we work",
      title: "Six weeks from *brief* to launch",
      steps: [
        { title: "Discovery", text: "Two hours at your place, not ours. We watch how bookings arrive today and who answers them.", duration: "Week 1" },
        { title: "Design", text: "Real copy and your own photos from day one. One direction, refined — never three to pick from.", duration: "Weeks 2–3" },
        { title: "Build & content", text: "Your staff learn to edit the menu while we build. Old URLs are redirected one by one.", duration: "Weeks 4–5" },
        { title: "Launch & first month", text: "We watch Search Console and booking volume daily for thirty days and fix what we find.", duration: "Week 6 →" },
      ],
    },
  },
  component: asBlock(Steps),
});

/** Every registry-1 definition, in inserter order. */
export const siteBlocks1: readonly AnyBlockDefinition[] = [
  announcementBlock,
  navbarBlock,
  heroBlock,
  pageIntroBlock,
  featuresBlock,
  mediaTextBlock,
  richTextBlock,
  statsBlock,
  logoStripBlock,
  stepsBlock,
  faqBlock,
  ctaBlock,
];
