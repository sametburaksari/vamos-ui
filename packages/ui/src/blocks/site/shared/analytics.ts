// Measurement after consent: GA4, Google Ads, Google Tag Manager and the Meta pixel, loaded only
// once the visitor allows them, plus the site events the kit's blocks already mark up
// (`data-track="call"`, "whatsapp", "email", "directions:…", "book", "social:…") and a lead event
// fired by ContactForm after a successful submit. React-free; every DOM access is guarded.
//
// The ids come from the site owner (vamos.site.json → analytics). Nothing here has a default id.

import { CONSENT_EVENT, readConsent, type ConsentRecord } from "./consent";

/** Fired on `window` by ContactForm after a successful submit. `detail.form` is the form's block id. */
export const LEAD_EVENT = "vb:lead";

export interface AnalyticsConfig {
  /** GA4 measurement id, "G-XXXXXXX". */
  ga4?: string;
  /** Google Ads tag id, "AW-123456789". */
  googleAds?: string;
  /** Google Tag Manager container, "GTM-XXXXXXX". Tags inside it follow Consent Mode on their own. */
  gtm?: string;
  /** Meta pixel (dataset) id, digits only. Loads only with marketing consent. */
  metaPixel?: string;
  /**
   * Google Ads conversion targets ("AW-123456789/AbCdEf") per site event. Create one conversion
   * action per event in Google Ads and paste its "send_to" value here.
   */
  conversions?: Partial<Record<SiteEvent, string>>;
  /**
   * `basic` (default, KVKK / GDPR strict): no Google or Meta script before consent.
   * `advanced`: the Google tag loads at once with Consent Mode defaults denied (cookieless pings);
   * Meta still waits for marketing consent.
   */
  mode?: "basic" | "advanced";
  /** ConsentBanner `version`; an older stored answer doesn't count. */
  version?: number;
  /** Sends every event to the console too. */
  debug?: boolean;
}

/** The site events the kit measures. */
export type SiteEvent = "lead" | "call" | "whatsapp" | "email" | "directions" | "book" | "social";

/** GA4 event name and Meta standard event per site event. */
const EVENT_MAP: Record<SiteEvent, { ga4: string; meta?: string }> = {
  lead: { ga4: "generate_lead", meta: "Lead" },
  call: { ga4: "click_call", meta: "Contact" },
  whatsapp: { ga4: "click_whatsapp", meta: "Contact" },
  email: { ga4: "click_email", meta: "Contact" },
  directions: { ga4: "click_directions", meta: "FindLocation" },
  book: { ga4: "click_book", meta: "Schedule" },
  social: { ga4: "click_social" },
};

type Gtag = (...args: unknown[]) => void;
type Fbq = ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
type W = Window & { dataLayer?: unknown[]; gtag?: Gtag; fbq?: Fbq; _fbq?: Fbq };

const ID = {
  ga4: /^G-[A-Z0-9]{4,20}$/,
  googleAds: /^AW-\d{6,15}$/,
  gtm: /^GTM-[A-Z0-9]{4,12}$/,
  metaPixel: /^\d{6,20}$/,
  conversion: /^AW-\d{6,15}\/[\w-]{4,64}$/,
};

/** The config with malformed ids dropped (they would load a broken tag), and the problems found. */
export function checkAnalyticsConfig(config: AnalyticsConfig): { config: AnalyticsConfig; problems: string[] } {
  const problems: string[] = [];
  const clean: AnalyticsConfig = { ...config, conversions: {} };
  for (const key of ["ga4", "googleAds", "gtm", "metaPixel"] as const) {
    const v = config[key]?.trim();
    if (!v) {
      delete clean[key];
      continue;
    }
    if (ID[key].test(v)) clean[key] = v;
    else {
      delete clean[key];
      problems.push(`${key} "${v}" is not a valid id.`);
    }
  }
  for (const [event, target] of Object.entries(config.conversions ?? {})) {
    if (!target) continue;
    if (ID.conversion.test(target.trim())) clean.conversions![event as SiteEvent] = target.trim();
    else problems.push(`conversions.${event} "${target}" should look like AW-123456789/AbCdEf.`);
  }
  return { config: clean, problems };
}

function addScript(src: string, id: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function ensureGtag(w: W): Gtag {
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    // Same shape as Google's snippet (and consentDefaultsScript): gtag pushes `arguments`.
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
  }
  return w.gtag;
}

const configured = new Set<string>();

function loadGoogle(w: W, c: AnalyticsConfig) {
  const gtag = ensureGtag(w);
  const tagIds = [c.ga4, c.googleAds].filter(Boolean) as string[];
  if (tagIds.length && !document.getElementById("vb-gtag")) {
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagIds[0]!)}`, "vb-gtag");
    gtag("js", new Date());
  }
  // Each tag is configured once, when its own consent arrives (Ads may come later than GA4).
  for (const id of tagIds) {
    if (configured.has(id)) continue;
    configured.add(id);
    gtag("config", id);
  }
  if (c.gtm && !document.getElementById("vb-gtm")) {
    w.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
    addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(c.gtm)}`, "vb-gtm");
  }
}

function loadMeta(w: W, pixel: string) {
  if (w.fbq) return;
  // Meta's loader, without the inline <script>: a queue until fbevents.js arrives.
  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) (fbq.callMethod as (...a: unknown[]) => void)(...args);
    else fbq.queue!.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  w.fbq = fbq;
  if (!w._fbq) w._fbq = fbq;
  addScript("https://connect.facebook.net/en_US/fbevents.js", "vb-fbq");
  fbq("init", pixel);
  fbq("track", "PageView");
}

let active: { config: AnalyticsConfig; record: ConsentRecord | null } | null = null;

/**
 * Sends one site event to every tool the visitor allowed: GA4 (`generate_lead`, `click_call`…),
 * the Google Ads conversion configured for it, and the Meta standard event (Lead, Contact…).
 * Without consent it only pushes to `dataLayer` (GTM and Consent Mode decide). Safe to call anywhere.
 */
export function trackEvent(event: SiteEvent, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const w = window as W;
  const map = EVENT_MAP[event];
  const c = active?.config ?? {};
  const consent = active?.record ?? readConsent(c.version);
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  if (c.debug) console.info("[vamos-ui analytics]", event, clean);
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event: `vb_${event}`, ...clean });
  // Only to tags that were configured, i.e. whose consent was given (or advanced mode).
  if (w.gtag) {
    if (c.ga4 && configured.has(c.ga4)) w.gtag("event", map.ga4, { ...clean, send_to: c.ga4 });
    const target = c.conversions?.[event];
    if (target && c.googleAds && configured.has(c.googleAds)) w.gtag("event", "conversion", { send_to: target });
  }
  if (w.fbq && map.meta && consent?.c.marketing === 1) w.fbq("track", map.meta, event === "lead" ? clean : undefined);
}

/** `data-track` value → site event + detail ("directions:google" → directions, google). */
export function parseTrack(value: string | null | undefined): { event: SiteEvent; detail?: string } | null {
  if (!value) return null;
  const [head, ...rest] = value.split(":");
  const detail = rest.join(":") || undefined;
  if (head === "call" || head === "phone" || head === "tel") return { event: "call", detail };
  if (head === "whatsapp") return { event: "whatsapp", detail };
  if (head === "email" || head === "mail") return { event: "email", detail };
  if (head === "directions" || head === "map") return { event: "directions", detail };
  if (head === "book" || head === "booking") return { event: "book", detail };
  if (head === "social") return { event: "social", detail };
  return null;
}

/** Fallback for links without `data-track`: tel:, mailto: and WhatsApp links. */
function eventFromHref(href: string): SiteEvent | null {
  if (href.startsWith("tel:")) return "call";
  if (href.startsWith("mailto:")) return "email";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|(www\.)?whatsapp\.com)\//i.test(href)) return "whatsapp";
  return null;
}

/**
 * Starts measurement: loads each tool when its consent category is granted (analytics → GA4,
 * GTM; marketing → Google Ads, Meta; `advanced` mode loads the Google tag at once), and turns
 * clicks on `data-track` elements, tel:/mailto:/WhatsApp links and ContactForm leads into events.
 * Returns a cleanup. Call once per page (the `Analytics` component does).
 */
export function startAnalytics(input: AnalyticsConfig): () => void {
  if (typeof window === "undefined") return () => {};
  const { config, problems } = checkAnalyticsConfig(input);
  if (problems.length) console.warn(`[vamos-ui analytics] ${problems.join(" ")}`);
  const w = window as W;
  active = { config, record: readConsent(config.version) };

  const apply = (record: ConsentRecord | null) => {
    active = { config, record };
    const analytics = record?.c.analytics === 1;
    const marketing = record?.c.marketing === 1;
    const google = config.mode === "advanced" || (config.ga4 && analytics) || (config.googleAds && marketing) || (config.gtm && (analytics || marketing));
    if (google) loadGoogle(w, { ...config, ga4: config.mode === "advanced" || analytics ? config.ga4 : undefined, googleAds: config.mode === "advanced" || marketing ? config.googleAds : undefined, gtm: config.mode === "advanced" || analytics || marketing ? config.gtm : undefined });
    if (config.metaPixel && marketing) loadMeta(w, config.metaPixel);
  };
  apply(active.record);

  const onConsentChange = (e: Event) => {
    const record = (e as CustomEvent<ConsentRecord>).detail ?? readConsent(config.version);
    apply(config.version !== undefined && record && record.v < config.version ? null : record);
  };
  const onClick = (e: MouseEvent) => {
    const target = e.target instanceof Element ? e.target : null;
    const el = target?.closest<HTMLElement>("[data-track], a[href]");
    if (!el) return;
    const tracked = parseTrack(el.getAttribute("data-track"));
    const href = el.getAttribute("href") ?? "";
    const event = tracked?.event ?? eventFromHref(href);
    if (!event) return;
    trackEvent(event, { detail: tracked?.detail, link_url: href.startsWith("tel:") || href.startsWith("mailto:") ? undefined : href || undefined, page_path: location.pathname });
  };
  const onLead = (e: Event) => {
    const detail = (e as CustomEvent<{ form?: string }>).detail ?? {};
    trackEvent("lead", { form_id: detail.form, page_path: location.pathname });
  };

  window.addEventListener(CONSENT_EVENT, onConsentChange);
  document.addEventListener("click", onClick, { capture: true });
  window.addEventListener(LEAD_EVENT, onLead);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onConsentChange);
    document.removeEventListener("click", onClick, { capture: true });
    window.removeEventListener(LEAD_EVENT, onLead);
    active = null;
  };
}
