/**
 * The vamos.site.json contract: one source of business information for a website (name, contact,
 * address, opening hours, legal identifiers, analytics ids, AI settings). `vamos-ui site
 * essentials` builds robots.txt, llms.txt, JSON-LD and the legal page values from it.
 * Pure: no Node built-ins. Nothing here has a default value that belongs to a real business.
 */

export const SITE_FILE = "vamos.site.json";
export const SITE_SCHEMA = "https://ui.vamos.ist/r/site-schema.json";

/** Crawlers that collect content for AI models or AI answers. robots.ts blocks these when AI crawlers are not allowed. */
export const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "Amazonbot",
] as const;

export interface SiteService {
  name: string;
  description?: string;
  /** Page for the service, e.g. "/services/facial" or a full URL. */
  url?: string;
}

export interface SiteFaq {
  question: string;
  answer: string;
}

export interface SiteInfo {
  $schema?: string;
  /** Business name as customers know it. */
  name: string;
  /** Registered legal name (unvan). */
  legalName?: string;
  /** One or two sentences: what the business offers and where. */
  description?: string;
  /** Live origin, e.g. https://www.example.com.tr. */
  url: string;
  /** Main language-region, e.g. "tr-TR". */
  locale?: string;
  /** Every language the site is published in. */
  locales?: string[];
  /** schema.org type, e.g. LocalBusiness, Store, ProfessionalService, Restaurant, DaySpa. */
  type?: string;
  contact?: { phone?: string; whatsapp?: string; email?: string };
  address?: { street?: string; district?: string; city?: string; postalCode?: string; country?: string };
  geo?: { latitude?: number; longitude?: number };
  /** schema.org openingHours text, e.g. ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"]. */
  openingHours?: string[];
  /** Profile URLs (Instagram, Facebook, LinkedIn, Google Business Profile …), used as sameAs. */
  social?: string[];
  legal?: {
    taxOffice?: string;
    taxNumber?: string;
    mersis?: string;
    tradeRegistry?: string;
    kep?: string;
    etbis?: string;
    /** Data controller (veri sorumlusu) when it differs from the legal name. */
    dataController?: string;
    privacyEmail?: string;
  };
  /** Measurement ids only; nothing is set unless you set it. */
  analytics?: { ga4?: string; gtm?: string; googleAds?: string };
  ai?: {
    /** Serve /llms.txt. Default true. */
    llmsTxt?: boolean;
    /** true: every crawler incl. AI bots; false: block the known AI bots; list: allow only those AI bots. Default true. */
    allowAiCrawlers?: boolean | string[];
    services?: SiteService[];
    faq?: SiteFaq[];
  };
}

const str = (description: string, extra: Record<string, unknown> = {}) => ({ type: "string", description, ...extra });

/** JSON Schema (draft 2020-12) for vamos.site.json, published at SITE_SCHEMA. */
export const SITE_JSON_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: SITE_SCHEMA,
  title: "Vamos UI site",
  description: "Business information for one website: name, contact, address, opening hours, legal identifiers, analytics ids and AI settings. `npx vamos-ui site essentials` builds robots.txt, llms.txt, JSON-LD and the legal page values from it.",
  type: "object",
  required: ["name", "url"],
  additionalProperties: false,
  properties: {
    $schema: { type: "string" },
    name: str("Business name as customers know it."),
    legalName: str("Registered legal name (şirket unvanı)."),
    description: str("One or two sentences: what the business offers and where."),
    url: str("Live origin, e.g. https://www.example.com.tr (no trailing slash)."),
    locale: str('Main language-region, e.g. "tr-TR" or "en-GB".'),
    locales: { type: "array", items: { type: "string" }, description: "Every language the site is published in." },
    type: str("schema.org type for JSON-LD: LocalBusiness, Store, ProfessionalService, Restaurant, DaySpa, MedicalBusiness …"),
    contact: {
      type: "object",
      additionalProperties: false,
      properties: {
        phone: str('Phone in international format, e.g. "+90 216 000 00 00".'),
        whatsapp: str("WhatsApp number in international format (digits)."),
        email: str("Public contact email."),
      },
    },
    address: {
      type: "object",
      additionalProperties: false,
      properties: {
        street: str("Street, building and unit."),
        district: str("District (ilçe) or neighbourhood."),
        city: str("City (il)."),
        postalCode: str("Postal code."),
        country: str('Country code (ISO 3166-1 alpha-2, e.g. "TR") or name.'),
      },
    },
    geo: {
      type: "object",
      additionalProperties: false,
      properties: { latitude: { type: "number", minimum: -90, maximum: 90 }, longitude: { type: "number", minimum: -180, maximum: 180 } },
    },
    openingHours: { type: "array", items: { type: "string" }, description: 'schema.org openingHours text, e.g. ["Mo-Fr 09:00-18:00", "Sa 10:00-14:00"].' },
    social: { type: "array", items: { type: "string" }, description: "Profile URLs (Instagram, Facebook, LinkedIn, Google Business Profile …); JSON-LD sameAs." },
    legal: {
      type: "object",
      additionalProperties: false,
      properties: {
        taxOffice: str("Tax office (vergi dairesi)."),
        taxNumber: str("Tax number (vergi no / VKN)."),
        mersis: str("MERSİS number."),
        tradeRegistry: str("Trade registry number (ticaret sicil no)."),
        kep: str("KEP address."),
        etbis: str("ETBİS registration number or verification link (required for online sales in Turkey)."),
        dataController: str("Data controller (veri sorumlusu) when it differs from the legal name."),
        privacyEmail: str("Email for privacy / KVKK requests."),
      },
    },
    analytics: {
      type: "object",
      additionalProperties: false,
      description: "Measurement ids only. Leave empty until the business gives you its own.",
      properties: {
        ga4: str('Google Analytics 4 measurement id, e.g. "G-XXXXXXX".', { pattern: "^(G-[A-Z0-9]+)?$" }),
        gtm: str('Google Tag Manager container id, e.g. "GTM-XXXXXX".', { pattern: "^(GTM-[A-Z0-9]+)?$" }),
        googleAds: str('Google Ads tag id, e.g. "AW-123456789".', { pattern: "^(AW-[0-9]+)?$" }),
      },
    },
    ai: {
      type: "object",
      additionalProperties: false,
      properties: {
        llmsTxt: { type: "boolean", default: true, description: "Serve /llms.txt (llmstxt.org) built from this file." },
        allowAiCrawlers: {
          default: true,
          description: "true: every crawler including AI bots; false: robots.txt blocks the known AI bots (GPTBot, ClaudeBot, PerplexityBot, Google-Extended …); a list: allow only those AI bots.",
          oneOf: [{ type: "boolean" }, { type: "array", items: { type: "string" } }],
        },
        services: {
          type: "array",
          description: "What the business offers; listed in llms.txt and JSON-LD.",
          items: {
            type: "object",
            required: ["name"],
            additionalProperties: false,
            properties: { name: { type: "string" }, description: { type: "string" }, url: { type: "string" } },
          },
        },
        faq: {
          type: "array",
          description: "Questions customers ask; emitted as FAQPage JSON-LD and listed in llms.txt.",
          items: {
            type: "object",
            required: ["question", "answer"],
            additionalProperties: false,
            properties: { question: { type: "string" }, answer: { type: "string" } },
          },
        },
      },
    },
  },
} as const;

/** An empty vamos.site.json. Every business value is blank until the user fills it in. */
export function siteTemplate(init: { name?: string; url?: string; locale?: string } = {}): SiteInfo {
  return {
    $schema: SITE_SCHEMA,
    name: init.name ?? "",
    legalName: "",
    description: "",
    url: (init.url ?? "").replace(/\/+$/, ""),
    locale: init.locale ?? "",
    locales: init.locale ? [init.locale] : [],
    type: "LocalBusiness",
    contact: { phone: "", whatsapp: "", email: "" },
    address: { street: "", district: "", city: "", postalCode: "", country: "" },
    openingHours: [],
    social: [],
    legal: { taxOffice: "", taxNumber: "", mersis: "", tradeRegistry: "", kep: "", etbis: "", dataController: "", privacyEmail: "" },
    analytics: { ga4: "", gtm: "", googleAds: "" },
    ai: { llmsTxt: true, allowAiCrawlers: true, services: [], faq: [] },
  };
}

/** Parses vamos.site.json; `error` is set when it is not a JSON object. */
export function parseSiteJson(text: string): { site: SiteInfo | null; error?: string } {
  try {
    const raw = JSON.parse(text) as unknown;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { site: null, error: "vamos.site.json must be a JSON object." };
    return { site: raw as SiteInfo };
  } catch (e) {
    return { site: null, error: `vamos.site.json is not valid JSON: ${(e as Error).message}` };
  }
}

const filled = (v: unknown) => typeof v === "string" && v.trim() !== "" && !/^\[.*\]$/.test(v.trim());

/** Required fields that are still empty (dotted paths). `ecommerce` adds the Turkish online-sales identifiers. */
export function missingSiteFields(site: SiteInfo, opts: { ecommerce?: boolean } = {}): string[] {
  const missing: string[] = [];
  if (!filled(site.name)) missing.push("name");
  if (!filled(site.url)) missing.push("url");
  if (!filled(site.contact?.phone) && !filled(site.contact?.email)) missing.push("contact.phone or contact.email");
  if (!filled(site.address?.city)) missing.push("address.city");
  if (opts.ecommerce) {
    if (!filled(site.legal?.mersis)) missing.push("legal.mersis");
    if (!filled(site.legal?.etbis)) missing.push("legal.etbis");
  }
  return missing;
}
