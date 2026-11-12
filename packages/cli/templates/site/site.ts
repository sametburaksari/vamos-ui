// Written by `vamos-ui site essentials`. Business information (from vamos.site.json), site origin and routes. Edit freely; it is never overwritten.
import siteJson from "__SITE_JSON__";

/** Shape of vamos.site.json (JSON Schema: https://ui.vamos.ist/r/site-schema.json). */
export interface SiteInfo {
  name: string;
  legalName?: string;
  description?: string;
  url: string;
  locale?: string;
  locales?: string[];
  /** schema.org type, e.g. LocalBusiness, Store, ProfessionalService. */
  type?: string;
  contact?: { phone?: string; whatsapp?: string; email?: string };
  address?: { street?: string; district?: string; city?: string; postalCode?: string; country?: string };
  geo?: { latitude?: number; longitude?: number };
  /** schema.org openingHours text, e.g. "Mo-Fr 09:00-18:00". */
  openingHours?: string[];
  /** Profile URLs (JSON-LD sameAs). */
  social?: string[];
  legal?: {
    taxOffice?: string;
    taxNumber?: string;
    mersis?: string;
    tradeRegistry?: string;
    kep?: string;
    etbis?: string;
    dataController?: string;
    privacyEmail?: string;
  };
  analytics?: { ga4?: string; gtm?: string; googleAds?: string };
  ai?: {
    llmsTxt?: boolean;
    allowAiCrawlers?: boolean | string[];
    services?: { name: string; description?: string; url?: string }[];
    faq?: { question: string; answer: string }[];
  };
}

/** Business information from vamos.site.json: the one source for llms.txt, JSON-LD, robots.txt and the legal pages. */
export const site = siteJson as unknown as SiteInfo;

/** A filled-in value, or undefined for "" and "[fill-in]" placeholders. */
export const filled = (value?: string | null): string | undefined => {
  const v = value?.trim();
  return v && !/^\[.*\]$/.test(v) ? v : undefined;
};

/** The live origin: NEXT_PUBLIC_SITE_URL where the site is hosted, else site.url. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || filled(site.url) || "http://localhost:3000").replace(/\/+$/, "");

/** Every public page. Add a route here when you add a page. */
export const SITE_ROUTES: string[] = __ROUTES__;

/** The legal pages among SITE_ROUTES (listed on their own in llms.txt). */
export const LEGAL_ROUTES: string[] = __LEGAL_ROUTES__;

const address = site.address ?? {};

/** The postal address on one line. */
export const SITE_ADDRESS = [address.street, address.district, [address.postalCode, address.city].map(filled).filter(Boolean).join(" "), address.country]
  .map(filled)
  .filter(Boolean)
  .join(", ");

const country = filled(address.country);

/** Values for the [fill-in] fields of the legal pages (legal-01). Empty fields stay visible as [fill-in]. */
export const LEGAL_VALUES = {
  companyName: filled(site.name),
  legalName: filled(site.legalName) ?? filled(site.legal?.dataController),
  address: filled(SITE_ADDRESS),
  city: filled(address.city),
  // A country code ("TR") reads badly in "the laws of …"; only a written-out name fills it.
  country: country && country.length > 2 ? country : undefined,
  email: filled(site.contact?.email),
  privacyEmail: filled(site.legal?.privacyEmail),
  phone: filled(site.contact?.phone),
  website: filled(site.url)?.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
  mersis: filled(site.legal?.mersis),
  taxOffice: filled(site.legal?.taxOffice),
  taxNumber: filled(site.legal?.taxNumber),
  tradeRegistry: filled(site.legal?.tradeRegistry),
  etbis: filled(site.legal?.etbis),
  kep: filled(site.legal?.kep),
};
