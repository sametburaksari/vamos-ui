/**
 * URL helpers of the Site shell: which page and locale a URL (or a link's href) points to,
 * and the href for a page. Pure and server-safe, so server components can build links.
 *
 *   ?page=pricing            → page "pricing" (search routing, the default)
 *   ?page=home#faq           → page "home", then scroll to #faq
 *   #page=pricing            → page "pricing" (hash routing)
 *   ?lang=tr                 → locale "tr", page unchanged
 */

export type SiteRouting = "search" | "hash" | "memory";

export interface SiteLocation {
  page?: string;
  locale?: string;
  /** In-page anchor after the page switch (`faq` for `#faq`). */
  anchor?: string;
}

export interface SiteRouteParams {
  /** Query/hash key for the page. Default `"page"`. */
  pageParam?: string;
  /** Query key for the locale. Default `"lang"`. */
  localeParam?: string;
}

/**
 * The href for an inner page, merged into nothing (relative to the current URL):
 * `sitePageHref("pricing")` → `"?page=pricing"`, `sitePageHref("home", "faq")` → `"?page=home#faq"`.
 */
export function sitePageHref(page: string, anchor?: string, options: SiteRouteParams & { routing?: SiteRouting } = {}): string {
  const key = options.pageParam ?? "page";
  const enc = encodeURIComponent(page);
  if (options.routing === "hash") return `#${key}=${enc}`;
  return `?${key}=${enc}${anchor ? `#${anchor}` : ""}`;
}

/** The href that switches the locale: `siteLocaleHref("tr")` → `"?lang=tr"`. */
export const siteLocaleHref = (locale: string, options: SiteRouteParams = {}) => `?${options.localeParam ?? "lang"}=${encodeURIComponent(locale)}`;

/**
 * Reads a link's href as a site location, or `null` when it is not a shell link (a path, an
 * external URL, a plain `#anchor`). Only relative hrefs that start with `?` or `#<pageParam>=`.
 */
export function parseSiteHref(href: string | null | undefined, options: SiteRouteParams = {}): SiteLocation | null {
  if (!href) return null;
  const pageKey = options.pageParam ?? "page";
  const langKey = options.localeParam ?? "lang";
  if (href.startsWith(`#${pageKey}=`)) {
    const page = decodeURIComponent(href.slice(pageKey.length + 2));
    return page ? { page } : null;
  }
  if (!href.startsWith("?")) return null;
  const hashAt = href.indexOf("#");
  const query = new URLSearchParams(hashAt === -1 ? href.slice(1) : href.slice(1, hashAt));
  const anchor = hashAt === -1 ? undefined : href.slice(hashAt + 1) || undefined;
  const page = query.get(pageKey) ?? undefined;
  const locale = query.get(langKey) ?? undefined;
  if (!page && !locale) return null;
  return { page, locale, anchor };
}

/** Reads the current location (`search` + `hash`) as page and locale. */
export function readSiteLocation(search: string, hash: string, routing: SiteRouting, options: SiteRouteParams = {}): SiteLocation {
  const pageKey = options.pageParam ?? "page";
  const q = new URLSearchParams(search);
  const locale = q.get(options.localeParam ?? "lang") ?? undefined;
  let page: string | undefined;
  if (routing === "hash") {
    const m = new RegExp(`^#${pageKey}=([^&]*)`).exec(hash);
    page = m?.[1] ? decodeURIComponent(m[1]) : undefined;
  } else if (routing === "search") {
    page = q.get(pageKey) ?? undefined;
  }
  return { page, locale };
}

/**
 * The URL after a change: other query params are kept, the default page and locale are left out
 * so the home page stays at a clean URL.
 */
export function writeSiteLocation(
  current: { pathname: string; search: string; hash: string },
  next: { page: string; locale: string; anchor?: string },
  defaults: { page: string; locale: string },
  routing: SiteRouting,
  options: SiteRouteParams = {},
): string {
  const pageKey = options.pageParam ?? "page";
  const langKey = options.localeParam ?? "lang";
  const q = new URLSearchParams(current.search);
  if (next.locale === defaults.locale) q.delete(langKey);
  else q.set(langKey, next.locale);
  let hash = next.anchor ? `#${next.anchor}` : "";
  if (routing === "search") {
    if (next.page === defaults.page) q.delete(pageKey);
    else q.set(pageKey, next.page);
  } else if (routing === "hash") {
    hash = next.page === defaults.page ? "" : `#${pageKey}=${encodeURIComponent(next.page)}`;
  }
  const qs = q.toString();
  return `${current.pathname}${qs ? `?${qs}` : ""}${hash}`;
}
