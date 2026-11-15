/**
 * Where the business is and whom the site serves, and which legal regimes follow from that.
 * The plan, the requirement packs, `site essentials` and `audit` all read the same model, so a
 * German shop gets an Impressum and a Widerrufsbelehrung, a Turkish one KVKK and ETBİS, and a
 * site with no known country the generic English pack. Pure and deterministic.
 */

import type { Answers } from "./questions";

/**
 * Legal regimes the requirement packs know. EU covers the EU/EEA rules (GDPR, ePrivacy, consumer
 * rights); DE, AT and FR add national rules for businesses established there. US is federal
 * (CAN-SPAM, COPPA, ADA), US-CA California (CalOPPA, CCPA/CPRA), US-STATES the other state privacy
 * laws; CA is Canada (PIPEDA, CASL), CA-QC Québec (Law 25).
 */
export const REGIMES = ["TR", "EU", "DE", "AT", "FR", "UK", "US", "US-CA", "US-STATES", "CA", "CA-QC", "BR", "AE", "SA", "AU", "CH"] as const;
export type Regime = (typeof REGIMES)[number];

/** EU member states plus Iceland, Liechtenstein and Norway (EEA). */
export const EEA = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO"] as const;

export interface Jurisdiction {
  /** ISO 3166-1 alpha-2 code of the country the business is established in, or null when unknown. */
  country: string | null;
  /** Where the site's customers are (ISO codes; "EU" for the whole EU/EEA; "US-CA", "CA-QC" for a state / province). */
  markets: string[];
  /** Every regime that applies (from the country and the markets). */
  regimes: Regime[];
  /** Regimes from the country of establishment only (imprint and company-disclosure rules follow the establishment). */
  home: Regime[];
  /** How the country was found. */
  from: "answer" | "domain" | "language" | "default" | "none";
}

/** ccTLD → country. Second-level forms (.com.tr, .co.uk, .com.br, .com.au) are matched by their last label. */
const TLD: Record<string, string> = {
  tr: "TR", de: "DE", at: "AT", ch: "CH", fr: "FR", nl: "NL", be: "BE", lu: "LU", es: "ES", it: "IT", pt: "PT", ie: "IE", pl: "PL", se: "SE", dk: "DK", fi: "FI", no: "NO", is: "IS",
  cz: "CZ", sk: "SK", hu: "HU", ro: "RO", bg: "BG", gr: "GR", hr: "HR", si: "SI", ee: "EE", lv: "LV", lt: "LT", mt: "MT", cy: "CY", li: "LI",
  uk: "GB", us: "US", ca: "CA", br: "BR", ae: "AE", sa: "SA", au: "AU",
};

/** Site language → the country it most likely means (only where one country dominates). */
const LANGUAGE_COUNTRY: Record<string, string> = { tr: "TR", de: "DE", fr: "FR", nl: "NL" };

/** "uk" and "EL" style aliases people type. */
const ALIASES: Record<string, string> = { UK: "GB", EL: "GR" };

const list = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : typeof v === "string" ? v.split(/[\s,;]+/) : []).map((x) => x.trim()).filter(Boolean);

/** Normalises a country / market code ("de", "uk", "us-ca", "EU"); null when it does not look like one. */
export function normalizeCode(raw: string): string | null {
  const v = raw.trim().toUpperCase().replace(/_/g, "-");
  if (v === "EU" || v === "EEA") return "EU";
  if (/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(v)) return `${ALIASES[v.slice(0, 2)] ?? v.slice(0, 2)}${v.slice(2)}`;
  if (/^[A-Z]{2}$/.test(v)) return ALIASES[v] ?? v;
  return null;
}

/** The country a host name points to by its ccTLD (ornek.de → DE, shop.co.uk → GB), or null for .com etc. */
export function countryFromHost(host: string | null | undefined): string | null {
  const h = (host ?? "").toLowerCase().replace(/^https?:\/\//, "").replace(/[/:].*$/, "").replace(/\.$/, "");
  const last = h.split(".").pop() ?? "";
  return h.includes(".") ? (TLD[last] ?? null) : null;
}

/** The country a BCP 47 locale names ("de-AT" → AT, "pt-BR" → BR, "de" → DE by language), or null. */
export function countryFromLocale(locale: string | null | undefined): string | null {
  const [lang = "", region = ""] = (locale ?? "").trim().split(/[-_]/);
  if (/^[A-Za-z]{2}$/.test(region)) return normalizeCode(region);
  return LANGUAGE_COUNTRY[lang.toLowerCase()] ?? null;
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

/** The business's country from the answers: the answer, else the domain's ccTLD, else the site language. */
export function countryFromAnswers(a: Answers): { country: string | null; from: Jurisdiction["from"] } {
  const asked = normalizeCode(one(a.country));
  if (asked && asked !== "EU" && !asked.includes("-")) return { country: asked, from: "answer" };
  const domain = one(a.domain) === "yes" ? one(a.domain_name) : "";
  const byHost = countryFromHost(domain) ?? countryFromHost(one(a.existing_site));
  if (byHost) return { country: byHost, from: "domain" };
  const langs = list(a.languages).map((l) => l.toLowerCase());
  // Turkish first: the process has always treated a Turkish-language site as a business in Türkiye.
  if (langs.includes("tr")) return { country: "TR", from: "language" };
  for (const l of langs) if (LANGUAGE_COUNTRY[l]) return { country: LANGUAGE_COUNTRY[l]!, from: "language" };
  // No language answered at all: the process starts in Turkish (as it always did).
  if (a.languages === undefined) return { country: "TR", from: "default" };
  return { country: null, from: "none" };
}

/** Regimes for a country (home) and for markets the site targets. */
export function regimesFor(country: string | null, markets: string[]): { regimes: Regime[]; home: Regime[] } {
  const regimes = new Set<Regime>();
  const home = new Set<Regime>();
  const add = (code: string, isHome: boolean) => {
    const put = (r: Regime) => {
      regimes.add(r);
      if (isHome) home.add(r);
    };
    const [base, sub] = code.split("-") as [string, string | undefined];
    if (code === "EU" || (EEA as readonly string[]).includes(base)) put("EU");
    // National imprint / consumer rules follow the establishment (country-of-origin principle).
    if (isHome && (base === "DE" || base === "AT" || base === "FR")) put(base);
    if (base === "TR") put("TR");
    if (base === "GB") put("UK");
    if (base === "US") {
      put("US");
      if (!sub || sub === "CA") put("US-CA");
      if (!sub || sub !== "CA") put("US-STATES");
    }
    if (base === "CA") {
      put("CA");
      if (!sub || sub === "QC") put("CA-QC");
    }
    if (base === "BR" || base === "AE" || base === "SA" || base === "AU" || base === "CH") put(base);
  };
  if (country) add(country, true);
  for (const m of markets) add(m, false);
  const order = (s: Set<Regime>) => REGIMES.filter((r) => s.has(r));
  return { regimes: order(regimes), home: order(home) };
}

/** The jurisdiction a project's answers describe (old answer files without `country` included). */
export function jurisdictionFromAnswers(a: Answers): Jurisdiction {
  const { country, from } = countryFromAnswers(a);
  const asked = list(a.markets).map(normalizeCode).filter((x): x is string => !!x);
  const markets = [...new Set(asked.length ? asked : country ? [country] : [])];
  return { country, markets, from, ...regimesFor(country, markets) };
}

/** A jurisdiction from a country code alone (vamos.site.json, `--country`). */
export function jurisdictionOf(country: string | null, markets: string[] = []): Jurisdiction {
  const c = country ? normalizeCode(country) : null;
  const code = c && c !== "EU" ? c.slice(0, 2) : null;
  const m = markets.map(normalizeCode).filter((x): x is string => !!x);
  return { country: code, markets: m.length ? m : code ? [code] : [], from: code ? "answer" : "none", ...regimesFor(code, m.length ? m : code ? [code] : []) };
}

/** The country of a site from vamos.site.json-like data: address.country, else the locale's region, else the url's ccTLD. */
export function countryOfSite(site: { address?: { country?: string }; locale?: string; url?: string } | null | undefined, extra: { lang?: string | null; host?: string | null } = {}): string | null {
  const c = site?.address?.country?.trim();
  const code = c ? normalizeCode(c) : null;
  if (code && code !== "EU") return code.slice(0, 2);
  return countryFromHost(site?.url) ?? countryFromHost(extra.host) ?? countryFromLocale(site?.locale) ?? countryFromLocale(extra.lang) ?? null;
}

export const hasRegime = (j: Pick<Jurisdiction, "regimes"> | null | undefined, ...r: Regime[]) => !!j && r.some((x) => j.regimes.includes(x));
export const isHome = (j: Pick<Jurisdiction, "home"> | null | undefined, ...r: Regime[]) => !!j && r.some((x) => j.home.includes(x));
