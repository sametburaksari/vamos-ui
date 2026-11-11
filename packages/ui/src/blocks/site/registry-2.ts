// Block definitions (layer 2) for the registry-2 site blocks: pricing, comparison, testimonials,
// team, blog list, article, contact form, map & hours, menu, gallery, consent, contact dock,
// footer, 404. Server / admin only — this file imports zod; components never import it.

import { z, f, defineBlock, createRegistry, type AnyBlockDefinition } from "../schema";
import type { BlockComponentProps } from "../types";
import type * as React from "react";
import { PricingTable } from "./pricing-table";
import { ComparisonTable } from "./comparison-table";
import { Testimonials } from "./testimonials";
import { Team } from "./team";
import { BlogList } from "./blog-list";
import { ArticleLayout } from "./article-layout";
import { ContactForm } from "./contact-form";
import { MapHours, localBusinessJsonLd } from "./map-hours";
import { MenuList, menuJsonLd, ALLERGENS } from "./menu-list";
import { GallerySection } from "./gallery-section";
import { ConsentBanner } from "./consent-banner";
import { ContactDock } from "./contact-dock";
import { Footer } from "./footer";
import { NotFound } from "./not-found";
import { REVIEW_SOURCE_NAMES } from "./testimonials";
import type { ContactFieldConfig, SiteFormState } from "./shared/site-form";

/**
 * Registered components receive validated, localized props. The kit components accept richer
 * code-only props (ReactNode text, functions); this adapter keeps the definitions readable.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asBlock = <P,>(C: React.ComponentType<P>) => C as unknown as React.ComponentType<BlockComponentProps<any>>;

const TRY = (amount: string) => ({ amount, currency: "TRY" });
const USD = (amount: string) => ({ amount, currency: "USD" });
const img = (id: string, alt: string, w = 1600, h = 1067) => ({ src: `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`, alt, width: w, height: h });

const header = {
  eyebrow: f.text({ max: 40, label: "Eyebrow" }).optional(),
  title: f.heading({ max: 90, label: "Title" }).optional(),
  lead: f.text({ max: 260, multiline: true, label: "Lead" }).optional(),
};

const ISTANBUL_HOURS = {
  timeZone: "Europe/Istanbul",
  weekly: {
    tue: [{ open: "12:00", close: "23:00" }],
    wed: [{ open: "12:00", close: "23:00" }],
    thu: [{ open: "12:00", close: "23:00" }],
    fri: [{ open: "12:00", close: "01:00" }],
    sat: [{ open: "12:00", close: "01:00" }],
    sun: [{ open: "12:00", close: "22:00" }],
  },
};

/* ------------------------------------------------------------------ pricing */

const PlanSchema = f.group({
  name: f.text({ max: 30 }),
  description: f.text({ max: 120 }).optional(),
  price: z.object({ monthly: f.money().optional(), yearly: f.money().optional(), once: f.money().optional(), from: f.toggle().optional() }).optional(),
  custom: f.text({ max: 30 }).optional(),
  features: f.list(f.group({ text: f.text({ max: 80 }), included: f.toggle().optional(), note: f.text({ max: 60 }).optional() }), { max: 14 }).optional(),
  cta: f.cta().optional(),
  highlight: f.text({ max: 24 }).optional(),
});

export const pricingBlock = defineBlock({
  type: "pricing",
  version: 1,
  title: "Pricing table",
  description: "Plans with monthly/yearly prices, inclusions and a tax note.",
  category: "conversion",
  icon: "receipt",
  keywords: ["plans", "packages", "prices", "fiyat"],
  variants: ["columns", "rows", "single"],
  defaultVariant: "columns",
  schema: z.object({
    ...header,
    billing: f.select(["monthly", "yearly", "both", "once"]).default("monthly"),
    defaultPeriod: f.select(["monthly", "yearly"]).optional(),
    yearlySaving: f.text({ max: 24 }).optional(),
    plans: f.list(PlanSchema, { min: 1, max: 4, itemLabel: "Plan {n}" }),
    taxNote: f.text({ max: 60, help: "Required: say whether prices include tax." }),
    footnote: f.rich({ nodes: ["paragraph"], marks: ["bold", "italic", "link"] }).optional(),
  }),
  preview: {
    props: {
      eyebrow: "Pricing",
      title: "One site, three *speeds*",
      billing: "both",
      yearlySaving: "2 months free",
      taxNote: "Prices exclude 20% VAT",
      plans: [
        { name: "Starter", description: "A one-page site with booking and maps.", price: { monthly: USD("49"), yearly: USD("490") }, features: [{ text: "1 page, 2 languages" }, { text: "Booking form" }, { text: "Blog", included: false }], cta: { link: { href: "/signup?plan=starter", label: "Start Starter" }, style: "secondary" } },
        { name: "Studio", description: "Up to 20 pages, blog and menu.", price: { monthly: USD("129"), yearly: USD("1290") }, highlight: "Most chosen", features: [{ text: "20 pages, 4 languages" }, { text: "Blog and menu" }, { text: "Priority support" }], cta: { link: { href: "/signup?plan=studio", label: "Start Studio" }, style: "primary" } },
        { name: "Group", description: "Several branches under one brand.", custom: "Get a quote", features: [{ text: "Unlimited branches" }, { text: "Dedicated designer" }], cta: { link: { href: "/contact", label: "Talk to us" }, style: "secondary" } },
      ],
    },
  },
  jsonLd: (p) => ({
    "@type": "OfferCatalog",
    name: p.title?.replace(/\*/g, ""),
    itemListElement: p.plans.flatMap((plan) =>
      (["monthly", "yearly", "once"] as const)
        .filter((k) => plan.price?.[k])
        .map((k) => ({
          "@type": "Offer",
          name: plan.name,
          price: plan.price![k]!.amount,
          priceCurrency: plan.price![k]!.currency,
          priceSpecification: k === "once" ? undefined : { "@type": "UnitPriceSpecification", price: plan.price![k]!.amount, priceCurrency: plan.price![k]!.currency, billingDuration: k === "monthly" ? "P1M" : "P1Y" },
        })),
    ),
  }),
  lint: (p) => (p.plans.filter((x) => x.cta?.style === "primary").length > 1 ? [{ code: "multiple-primary-cta", message: "More than one plan has a primary button; only the highlighted plan keeps it.", path: "props.plans" }] : []),
  component: asBlock(PricingTable),
});

/* ------------------------------------------------------------------ comparison */

export const comparisonBlock = defineBlock({
  type: "comparison",
  version: 1,
  title: "Comparison table",
  category: "conversion",
  icon: "table-2",
  keywords: ["compare", "versus", "features"],
  variants: ["table", "versus"],
  defaultVariant: "table",
  schema: z.object({
    ...header,
    columns: f.list(f.group({ name: f.text({ max: 30 }), note: f.text({ max: 40 }).optional(), cta: f.cta().optional(), highlight: f.toggle().optional() }), { min: 2, max: 5 }),
    groups: f.list(
      f.group({
        title: f.text({ max: 40 }).optional(),
        rows: f.list(f.group({ feature: f.text({ max: 80 }), hint: f.text({ max: 120 }).optional(), values: z.array(z.union([z.boolean(), z.string().max(30), z.null()])) }), { min: 1 }),
      }),
      { min: 1 },
    ),
    caption: f.text({ max: 120 }).optional(),
  }),
  preview: {
    props: {
      title: "What each plan *includes*",
      columns: [{ name: "Starter", note: "$49 / mo" }, { name: "Studio", note: "$129 / mo", highlight: true }, { name: "Group", note: "Quote" }],
      groups: [
        { title: "Publishing", rows: [{ feature: "Pages", values: ["5", "20", "Unlimited"] }, { feature: "Languages", hint: "Each page can have its own translation.", values: ["2", "4", "Unlimited"] }, { feature: "Blog", values: [false, true, true] }] },
        { title: "Support", rows: [{ feature: "Email support", values: [true, true, true] }, { feature: "Dedicated designer", values: [false, false, true] }] },
      ],
    },
  },
  component: asBlock(ComparisonTable),
});

/* ------------------------------------------------------------------ testimonials */

const SOURCES = ["google", "yandex", "tripadvisor", "trustpilot", "direct"] as const;

export const testimonialsBlock = defineBlock({
  type: "testimonials",
  version: 1,
  title: "Testimonials",
  category: "proof",
  icon: "quote",
  keywords: ["reviews", "quotes", "references", "yorumlar"],
  variants: ["feature", "wall", "carousel", "reviews"],
  defaultVariant: "feature",
  schema: z.object({
    ...header,
    items: f.list(
      f.group({
        quote: f.text({ max: 420, multiline: true }),
        author: f.text({ max: 60, localized: false }),
        role: f.text({ max: 60 }).optional(),
        company: f.text({ max: 60, localized: false }).optional(),
        avatar: f.image({ aspect: "1:1" }).optional(),
        logo: f.image().optional(),
        rating: f.number({ min: 1, max: 5 }).optional(),
        source: f.select(SOURCES).optional(),
        date: f.date().optional(),
        link: f.link().optional(),
      }),
      { min: 1, max: 24 },
    ),
    summary: z.object({ rating: f.number({ min: 1, max: 5 }), count: f.number({ min: 0, int: true }), source: f.select(SOURCES), link: f.link().optional() }).optional(),
  }),
  preview: {
    props: {
      items: [{ quote: "They rebuilt our booking flow in three weeks. Table requests through the site doubled before the summer season even started.", author: "Deniz Arslan", role: "Owner", company: "Meyhane Rasimpaşa" }],
    },
  },
  jsonLd: (p) =>
    p.summary && p.summary.source !== "direct"
      ? { "@type": "AggregateRating", ratingValue: p.summary.rating, reviewCount: p.summary.count, bestRating: 5, author: REVIEW_SOURCE_NAMES[p.summary.source] }
      : null,
  lint: (p) => p.items.flatMap((it, i) => (it.rating !== undefined && !it.source ? [{ code: "rating-without-source", message: "Star ratings render only with a named source (D6-8).", path: `props.items.${i}.rating` }] : [])),
  component: asBlock(Testimonials),
});

/* ------------------------------------------------------------------ team */

export const teamBlock = defineBlock({
  type: "team",
  version: 1,
  title: "Team",
  category: "content",
  icon: "users",
  keywords: ["people", "staff", "doctors", "ekip"],
  variants: ["portrait", "list", "feature"],
  defaultVariant: "portrait",
  schema: z.object({
    ...header,
    members: f.list(
      f.group({
        name: f.text({ max: 60, localized: false }),
        title: f.text({ max: 20 }).optional(),
        role: f.text({ max: 60 }),
        specialty: f.text({ max: 80 }).optional(),
        photo: f.image({ aspect: "4:5" }).optional(),
        bio: f.text({ max: 600, multiline: true }).optional(),
        links: f.social({ max: 3 }).optional(),
      }),
      { min: 1, max: 24 },
    ),
  }),
  preview: {
    props: {
      title: "Hands you can *trust*",
      members: [
        { name: "Elif Aydın", role: "Lead therapist", specialty: "Deep tissue · Sports massage" },
        { name: "Mert Kaya", role: "Hammam master", specialty: "Traditional kese and foam" },
        { name: "Selin Öztürk", role: "Skin specialist", specialty: "Facials · Microneedling" },
      ],
    },
  },
  component: asBlock(Team),
});

/* ------------------------------------------------------------------ blog list */

export const blogListBlock = defineBlock({
  type: "blog-list",
  version: 1,
  title: "Blog list",
  category: "blog",
  icon: "newspaper",
  keywords: ["posts", "articles", "news", "blog"],
  variants: ["editorial", "list", "grid", "compact"],
  defaultVariant: "editorial",
  schema: z.object({
    ...header,
    allLink: f.link().optional(),
    query: f.query("posts", { into: "posts" }).default({ kind: "latest", limit: 6 }),
    showCovers: f.toggle().default(true),
  }),
  preview: { props: { title: "From the *journal*", query: { kind: "latest", limit: 4 }, showCovers: true } },
  component: asBlock(BlogList),
});

/* ------------------------------------------------------------------ article */

export const articleBlock = defineBlock({
  type: "article",
  version: 1,
  title: "Article layout",
  description: "Single-post template: header, cover, TOC, body, share, author.",
  category: "blog",
  icon: "file-text",
  variants: ["classic", "wide-cover", "minimal"],
  defaultVariant: "classic",
  supports: { pageTitle: true, anchor: false },
  schema: z.object({
    post: z.object({
      title: f.heading({ max: 140 }),
      dek: f.text({ max: 280, multiline: true }).optional(),
      body: f.rich(),
      cover: f.image({ aspect: "3:2" }).optional(),
      publishedAt: z.string().min(10),
      updatedAt: z.string().min(10).optional(),
      author: z.object({ name: z.string(), role: f.text().optional(), bio: f.text({ multiline: true }).optional(), avatar: f.image({ aspect: "1:1" }).optional() }).optional(),
      category: f.link().optional(),
      tags: f.list(f.link(), { max: 8 }).optional(),
      breadcrumb: f.list(f.link(), { max: 4 }).optional(),
    }),
    toc: f.toggle().default(true),
    share: z.array(z.enum(["copy", "whatsapp", "x", "linkedin", "email"])).default(["copy", "whatsapp", "linkedin", "email"]),
    url: z.string().optional(),
  }),
  preview: {
    props: {
      post: {
        title: "How we plan a *menu* around the morning boats",
        dek: "Notes from twelve years of buying fish at Kumkapı before sunrise.",
        publishedAt: "2026-10-28",
        body: { type: "doc", content: [{ type: "paragraph", content: [{ text: "We decide the evening’s menu at six in the morning, standing at the market." }] }] },
      },
      toc: true,
      share: ["copy", "whatsapp", "linkedin"],
    },
  },
  jsonLd: (p) => ({
    "@type": "BlogPosting",
    headline: p.post.title.replace(/\*/g, ""),
    description: typeof p.post.dek === "string" ? p.post.dek : undefined,
    datePublished: p.post.publishedAt,
    dateModified: p.post.updatedAt ?? p.post.publishedAt,
    image: p.post.cover?.src,
    author: p.post.author ? { "@type": "Person", name: p.post.author.name } : undefined,
    mainEntityOfPage: p.url,
  }),
  component: asBlock(ArticleLayout),
});

/* ------------------------------------------------------------------ contact form */

const FIELD_NAMES = ["name", "email", "phone", "company", "subject", "budget", "message", "date"] as const;
const ContactFieldSchema = f.group({ name: f.select(FIELD_NAMES), required: f.toggle().optional(), label: f.text({ max: 40 }).optional(), options: f.list(f.text({ max: 40 }), { max: 12 }).optional(), placeholder: f.text({ max: 60 }).optional(), hint: f.text({ max: 120 }).optional() });

export const contactFormBlock = defineBlock({
  type: "contact-form",
  version: 1,
  title: "Contact form",
  category: "form",
  icon: "mail",
  keywords: ["quote", "enquiry", "form", "iletişim"],
  variants: ["split", "stacked", "minimal"],
  defaultVariant: "split",
  schema: z.object({
    ...header,
    fields: f.list(ContactFieldSchema, { min: 2, max: 8 }).default([{ name: "name", required: true }, { name: "email", required: true }, { name: "message", required: true }]),
    submitLabel: f.text({ max: 30 }).optional(),
    successMessage: f.rich({ nodes: ["paragraph"], marks: ["bold", "italic", "link"] }).optional(),
    privacyLink: f.link().optional(),
    privacyCheckbox: f.toggle().default(false),
    marketingConsent: f.toggle().default(false),
    showInfo: f.toggle().default(true),
    info: z.object({ address: f.address().optional(), phone: f.phone().optional(), email: z.email().optional(), hours: f.hours().optional() }).optional(),
  }),
  preview: {
    props: {
      eyebrow: "Contact",
      title: "Tell us about the *project*",
      fields: [{ name: "name", required: true }, { name: "email", required: true }, { name: "budget", options: ["Under $5k", "$5k–15k", "$15k+"] }, { name: "message", required: true }],
      info: { phone: "+902160000000", email: "hello@vamos.ist" },
      privacyCheckbox: true,
      marketingConsent: false,
      showInfo: true,
    },
  },
  component: asBlock(ContactForm),
});

/** zod schema for a contact submission — the server action can `safeParse(Object.fromEntries(formData))`. */
export function contactFormSchema(fields: readonly ContactFieldConfig[], opts: { privacyCheckbox?: boolean } = {}) {
  const shape: Record<string, z.ZodType> = {};
  for (const fld of fields) {
    let s: z.ZodType;
    const max = fld.max ?? (fld.name === "message" ? 2000 : 160);
    if (fld.name === "email") s = z.email().max(max);
    else if (fld.name === "phone") s = z.string().regex(/^\+?[\d\s().-]{7,20}$/);
    else if (fld.options?.length) s = z.enum(fld.options as [string, ...string[]]);
    else s = z.string().trim().max(max);
    shape[fld.name] = fld.required ? (s instanceof z.ZodString ? s.min(1) : s) : s.optional().or(z.literal(""));
  }
  if (opts.privacyCheckbox) shape.privacy = z.literal("on");
  shape.marketing = z.literal("on").optional();
  return z.object(shape);
}
export type { SiteFormState };

/* ------------------------------------------------------------------ map & hours */

export const locationBlock = defineBlock({
  type: "location",
  version: 1,
  title: "Map & opening hours",
  category: "local",
  icon: "map-pin",
  keywords: ["map", "address", "hours", "directions", "branches", "adres"],
  variants: ["map-split", "info", "branches"],
  defaultVariant: "map-split",
  schema: z.object({
    ...header,
    branches: f.list(
      f.group({ name: f.text({ max: 60 }), address: f.address(), phone: f.phone().optional(), email: z.email().optional(), hours: f.hours(), mapImage: f.image({ aspect: "4:3" }).optional(), placeUrl: z.url().optional(), notes: f.text({ max: 140 }).optional() }),
      { min: 1, max: 12 },
    ),
    businessType: f.select(["LocalBusiness", "Restaurant", "DaySpa", "BeautySalon", "MedicalClinic", "ProfessionalService", "EventVenue"]).default("LocalBusiness"),
    mapProvider: f.select(["google", "osm", "none"]).default("google"),
    directions: z.array(z.enum(["google", "apple", "yandex", "waze"])).default(["google", "apple"]),
    showOpenNow: f.toggle().default(true),
    hoursDisplay: f.select(["week", "open-days", "none"]).default("week"),
  }),
  preview: {
    props: {
      title: "Find *us*",
      businessType: "Restaurant",
      branches: [{ name: "Meyhane Rasimpaşa", address: { line: "Rıhtım Caddesi 14", district: "Rasimpaşa", city: "Kadıköy", region: "İstanbul", postalCode: "34716", country: "TR", geo: { lat: 40.9112, lng: 29.1556 } }, phone: "+902160000000", hours: ISTANBUL_HOURS }],
    },
  },
  jsonLd: (p) => localBusinessJsonLd(p),
  component: asBlock(MapHours),
});

/* ------------------------------------------------------------------ menu */

const MenuItemSchema = f.group({
  name: f.text({ max: 60 }),
  description: f.text({ max: 160 }).optional(),
  prices: f.list(f.group({ label: f.text({ max: 20 }).optional(), amount: f.money().optional() }), { min: 1, max: 4 }),
  duration: f.text({ max: 12 }).optional(),
  tags: z.array(z.enum(["vegetarian", "vegan", "gluten-free", "spicy", "new", "chef-pick"])).optional(),
  allergens: z.array(z.enum(ALLERGENS)).optional(),
  image: f.image({ aspect: "1:1" }).optional(),
  unavailable: f.toggle().optional(),
  bookHref: z.string().optional(),
});

export const menuBlock = defineBlock({
  type: "menu",
  version: 1,
  title: "Menu / price list",
  category: "local",
  icon: "utensils",
  keywords: ["menu", "price list", "services", "QR menu", "fiyat listesi"],
  variants: ["classic", "photo", "service-list"],
  defaultVariant: "classic",
  schema: z.object({
    ...header,
    categories: f.list(f.group({ title: f.text({ max: 40 }), note: f.text({ max: 120 }).optional(), items: f.list(MenuItemSchema) }), { min: 1 }),
    priceNote: f.text({ max: 140, help: "Required: VAT / service charge." }),
    showNav: f.toggle().optional(),
    bookHref: z.string().optional(),
  }),
  preview: {
    props: {
      title: "Tonight’s *meze*",
      priceNote: "Prices include VAT. Service is not added to the bill.",
      categories: [
        { title: "Cold meze", items: [{ name: "Haydari", description: "Strained yoghurt, dill, roasted garlic.", prices: [{ amount: TRY("180") }], tags: ["vegetarian"] }, { name: "Lakerda", description: "Cured bonito, red onion, olive oil.", prices: [{ amount: TRY("420") }], tags: ["chef-pick"], allergens: ["fish"] }] },
      ],
    },
  },
  jsonLd: (p) => menuJsonLd(p),
  component: asBlock(MenuList),
});

/* ------------------------------------------------------------------ gallery */

export const galleryBlock = defineBlock({
  type: "gallery",
  version: 1,
  title: "Gallery section",
  category: "media",
  icon: "images",
  keywords: ["photos", "images", "portfolio", "galeri"],
  variants: ["mosaic", "filmstrip", "grid", "split-caption"],
  defaultVariant: "mosaic",
  schema: z.object({
    ...header,
    images: f.list(f.group({ image: f.image(), caption: f.text({ max: 160 }).optional(), span: f.select(["1", "wide", "tall", "big"]).optional() }), { min: 3, max: 40 }),
    lightbox: f.toggle().default(true),
    aspect: f.select(["mixed", "3:2", "1:1", "4:5"]).default("3:2"),
  }),
  preview: {
    props: {
      title: "The *room*",
      lightbox: true,
      aspect: "3:2",
      images: [
        { image: img("photo-1517248135467-4c7edcad34c4", "The dining room at dusk"), span: "big" },
        { image: img("photo-1414235077428-338989a2e8c0", "A table set for two by the window") },
        { image: img("photo-1559339352-11d035aa65de", "Meze plates on a marble counter") },
      ],
    },
  },
  component: asBlock(GallerySection),
});

/* ------------------------------------------------------------------ consent */

export const consentBlock = defineBlock({
  type: "consent",
  version: 1,
  title: "Cookie / consent banner",
  description: "GDPR / KVKK cookie consent with Google Consent Mode v2.",
  category: "site",
  region: "overlay",
  icon: "cookie",
  keywords: ["cookies", "gdpr", "kvkk", "privacy", "çerez"],
  variants: ["bar", "box"],
  defaultVariant: "bar",
  supports: { anchor: false, spacing: false },
  schema: z.object({
    text: f.rich({ nodes: ["paragraph"], marks: ["link", "bold"] }).optional(),
    policyLink: f.link().optional(),
    categories: z.array(z.enum(["necessary", "functional", "analytics", "marketing"])).default(["necessary", "functional", "analytics", "marketing"]),
    version: f.number({ min: 1, int: true, help: "Bump when the text changes — visitors are asked again." }).default(1),
    position: f.select(["bottom", "bottom-start"]).optional(),
    regionMode: f.select(["opt-in", "notice"]).default("opt-in"),
  }),
  preview: { props: { policyLink: { href: "/cookies", label: "Cookie policy" }, version: 1 } },
  component: asBlock(ConsentBanner),
});

/* ------------------------------------------------------------------ contact dock */

export const contactDockBlock = defineBlock({
  type: "contact-dock",
  version: 1,
  title: "Contact dock (WhatsApp · call)",
  category: "conversion",
  region: "overlay",
  icon: "message-circle",
  keywords: ["whatsapp", "call", "floating button", "mobile bar"],
  variants: ["fab", "bar", "both"],
  defaultVariant: "both",
  supports: { anchor: false, theme: false, spacing: false },
  schema: z.object({
    provider: f.select(["whatsapp", "telegram", "messenger"]).default("whatsapp"),
    whatsapp: f.phone().optional(),
    telegram: z.string().max(40).optional(),
    messenger: z.string().max(60).optional(),
    message: f.text({ max: 200 }).optional(),
    label: f.text({ max: 24 }).optional(),
    phone: f.phone().optional(),
    directionsHref: z.string().optional(),
    bookingHref: z.string().optional(),
    email: z.email().optional(),
    actions: z.array(z.enum(["call", "whatsapp", "directions", "booking", "email"])).max(4).optional(),
    position: f.select(["end", "start"]).default("end"),
    hours: f.hours().optional(),
    offHours: f.select(["show", "label", "hide"]).default("show"),
  }),
  preview: { props: { whatsapp: "+902160000000", phone: "+902160000000", message: "Hi, I’d like to book a table.", directionsHref: "https://maps.app.goo.gl/meyhane" } },
  component: asBlock(ContactDock),
});

/* ------------------------------------------------------------------ footer */

const SiteLinks = f.list(f.link(), { max: 8 });

export const footerBlock = defineBlock({
  type: "footer",
  version: 1,
  title: "Footer",
  category: "site",
  region: "footer",
  icon: "panel-bottom",
  variants: ["columns", "wordmark", "minimal"],
  defaultVariant: "columns",
  schema: z.object({
    brand: z.object({ name: z.string().min(1), logo: f.image().optional(), href: z.string().optional() }),
    about: f.text({ max: 200 }).optional(),
    columns: f.list(f.group({ title: f.text({ max: 30 }), links: SiteLinks }), { max: 4 }).default([]),
    contact: z.object({ address: f.address().optional(), phone: f.phone().optional(), email: z.email().optional() }).optional(),
    social: f.social({ max: 6 }).default([]),
    legalLinks: SiteLinks.default([]),
    company: z.object({ legalName: z.string().min(1), registry: f.list(f.group({ label: f.text({ max: 30 }), value: z.string().max(40) })).optional() }).optional(),
    credit: f.link().optional(),
    cookieSettings: f.toggle().default(true),
  }),
  preview: {
    props: {
      brand: { name: "Meyhane" },
      about: "Meze, fish and raki on the Asian side since 2014.",
      columns: [{ title: "Visit", links: [{ href: "/menu", label: "Menu" }, { href: "/reservations", label: "Reservations" }] }],
      legalLinks: [{ href: "/privacy", label: "Privacy" }],
    },
  },
  jsonLd: (p) => ({ "@type": "Organization", name: p.company?.legalName ?? p.brand.name, telephone: p.contact?.phone, email: p.contact?.email, sameAs: p.social.map((s) => s.href) }),
  lint: (p) => (!p.company ? [{ code: "missing-company-details", severity: "info", message: "Sites that sell online usually must show the legal name and tax / registry numbers in the footer.", path: "props.company" }] : []),
  component: asBlock(Footer),
});

/* ------------------------------------------------------------------ 404 */

export const notFoundBlock = defineBlock({
  type: "not-found",
  version: 1,
  title: "404",
  category: "site",
  icon: "file-question",
  variants: ["plain", "links"],
  defaultVariant: "plain",
  supports: { pageTitle: true },
  schema: z.object({
    kind: f.select(["404", "500", "maintenance"]).default("404"),
    title: f.heading({ max: 80 }).optional(),
    text: f.text({ max: 200 }).optional(),
    links: f.list(f.link(), { max: 6 }).default([]),
    homeHref: z.string().default("/"),
    search: z.object({ action: z.string().min(1), param: z.string().optional() }).optional(),
    phone: f.phone().optional(),
  }),
  preview: { props: { kind: "404", links: [{ href: "/menu", label: "Menu" }, { href: "/reservations", label: "Reservations" }] } },
  component: asBlock(NotFound),
});

/** Every registry-2 definition, for `createRegistry([...siteBlocks1, ...siteBlocks2])`. */
export const siteBlocks2: readonly AnyBlockDefinition[] = [
  pricingBlock,
  comparisonBlock,
  testimonialsBlock,
  teamBlock,
  blogListBlock,
  articleBlock,
  contactFormBlock,
  locationBlock,
  menuBlock,
  galleryBlock,
  consentBlock,
  contactDockBlock,
  footerBlock,
  notFoundBlock,
];

/** A registry of just these blocks. */
export const siteRegistry2 = createRegistry(siteBlocks2);
