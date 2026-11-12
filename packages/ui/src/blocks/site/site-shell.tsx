"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { ThemeScope } from "../../lib/theme-scope";
import { useControllableState } from "../../lib/use-controllable-state";
import { isBuiltInAccent, siteAccent, siteAccentCss, siteAccentKey } from "./shared/site-accent";
import { motionAllowed } from "../../motion/core";
import { startPageTransition, viewTransitionsSupported } from "../../motion/page-transition";
import { parseSiteHref, readSiteLocation, sitePageHref, writeSiteLocation, type SiteLocation, type SiteRouting } from "./shared/site-routing";

export interface SiteShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "dir"> {
  /**
   * The site's accent: a built-in preset (`"lime"`, `"ocean"`, `"ember"`, `"rose"`, `"graphite"`)
   * or one brand colour (`"#B4532A"`, `rgb()`, `oklch()`). A colour becomes the four accent
   * variables on the site root, contrast-checked (text on the fill and accent ink ≥ 4.5:1).
   */
  accent?: string;
  /** Explicit dark-mode fill for a custom accent. Derived when the colour is too dark. */
  accentDark?: string;
  /** Type pairing → `data-font` (editorial, grotesk, corporate, system or your own). */
  font?: string;
  /** Surface material → `data-material`. */
  material?: "glass" | "solid";
  /** → `data-density`. */
  density?: "comfortable" | "compact" | "spacious";
  /** Force a mode for the whole site. Default: inherit the page's. */
  theme?: "light" | "dark";
  dir?: "ltr" | "rtl";
  /** Locale codes, default first. Default `["en", "tr"]`. */
  locales?: string[];
  /** Controlled locale. */
  locale?: string;
  defaultLocale?: string;
  onLocaleChange?: (locale: string) => void;
  /** Page ids, home first. Default `["home"]`. */
  pages?: string[];
  /** Controlled page. */
  page?: string;
  defaultPage?: string;
  onPageChange?: (page: string) => void;
  /** Where the page lives in the URL: `?page=` (default), `#page=`, or nowhere. The locale always uses `?lang=`. */
  routing?: SiteRouting;
  /** Query/hash key for the page. Default `"page"`. */
  pageParam?: string;
  /** Query key for the locale. Default `"lang"`. */
  localeParam?: string;
  /**
   * Motion level for the whole site → `data-motion`. subtle (default): short fades and small
   * rises, count-ups, the logo ticker. full: longer, wider, a wiping hero title, magnetic
   * calls-to-action. off: final state everywhere. Reduced motion always wins. Page and
   * language switches cross-fade (View Transitions where available, a fade otherwise).
   */
  motion?: "full" | "subtle" | "off";
}

export interface SiteShellContextValue {
  page: string;
  locale: string;
  pages: readonly string[];
  locales: readonly string[];
  /** Go to a page and/or locale (and optionally an anchor on it). */
  navigate: (to: SiteLocation) => void;
  /** The href for a page (respects `routing` and `pageParam`). */
  hrefFor: (page: string, anchor?: string) => string;
  /** The shell's motion level. */
  motion: "full" | "subtle" | "off";
  /** True after a switch that should fade the new page in (no View Transitions available). */
  pageEnter: boolean;
}

const SiteShellContext = /*#__PURE__*/ React.createContext<SiteShellContextValue | null>(null);

/** Page, locale and navigation of the closest Site shell. Throws outside one. */
export function useSiteShell(): SiteShellContextValue {
  const ctx = React.useContext(SiteShellContext);
  if (!ctx) throw new Error("useSiteShell must be used inside <SiteShell>.");
  return ctx;
}

/**
 * The frame of a demo or single-route website: EN/TR switch, inner-page switching and the
 * site's own look (accent from one colour, font, material, density), scoped to its root.
 *
 * Every language and page is rendered on the server as plain blocks; the shell shows one of
 * each and swaps on links like `?page=pricing`, `?page=home#faq` or `?lang=tr` inside it —
 * so server-rendered Navbar and Footer links work as they are. On a page change it scrolls to
 * the top of the site, moves focus to the page's `h1` and marks matching links
 * `aria-current="page"`. Back/forward follow the URL. Overlays opened inside keep its theme.
 *
 * ```tsx
 * <SiteShell accent="#B4532A" font="editorial" material="solid" pages={["home", "shop"]}>
 *   <Navbar items={[{ label: "Shop", href: "?page=shop" }]} … />
 *   <SiteShellPage id="home"><Hero … /></SiteShellPage>
 *   <SiteShellPage id="shop"><PageIntro title="Shop" … /></SiteShellPage>
 * </SiteShell>
 * ```
 */
export const SiteShell = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SiteShellProps>(function SiteShell(
  {
    accent,
    accentDark,
    font,
    material,
    density,
    theme,
    dir,
    locales = ["en", "tr"],
    locale: localeProp,
    defaultLocale,
    onLocaleChange,
    pages = ["home"],
    page: pageProp,
    defaultPage,
    onPageChange,
    routing = "search",
    pageParam = "page",
    localeParam = "lang",
    motion = "subtle",
    className,
    onClick,
    children,
    ...props
  },
  ref,
) {
  const homeLocale = defaultLocale ?? locales[0] ?? "en";
  const homePage = defaultPage ?? pages[0] ?? "home";
  const [locale, setLocale] = useControllableState({ value: localeProp, defaultValue: homeLocale, onChange: onLocaleChange, name: "SiteShell" });
  const [page, setPage] = useControllableState({ value: pageProp, defaultValue: homePage, onChange: onPageChange, name: "SiteShell" });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const setRoot = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  /** What to do after the next render: focus the h1, scroll to the top or to an anchor. */
  const pending = React.useRef<{ focus: boolean; scroll: boolean; anchor?: string } | null>(null);
  const [pageEnter, setPageEnter] = React.useState(false);

  /** Swap page/locale as a page transition: a View Transition, or a fade on the new page. */
  const transition = React.useCallback((commit: () => void) => {
    const root = rootRef.current;
    const animate = motion !== "off" && motionAllowed(root);
    setPageEnter(animate && !viewTransitionsSupported());
    if (animate) startPageTransition(commit, { scope: root });
    else commit();
  }, [motion]);
  const transitionRef = React.useRef(transition);
  transitionRef.current = transition;

  const pageKey = pages.join("|");
  const localeKey = locales.join("|");
  const params = React.useMemo(() => ({ pageParam, localeParam }), [pageParam, localeParam]);

  const apply = React.useCallback(
    (to: SiteLocation, mode: "push" | "replace" | "none") => {
      const nextPage = to.page && pages.includes(to.page) ? to.page : page;
      const nextLocale = to.locale && locales.includes(to.locale) ? to.locale : locale;
      const pageChanged = nextPage !== page;
      if (mode !== "none" && routing !== "memory" && typeof window !== "undefined") {
        const url = writeSiteLocation(window.location, { page: nextPage, locale: nextLocale, anchor: to.anchor }, { page: homePage, locale: homeLocale }, routing, params);
        if (mode === "push") window.history.pushState(null, "", url);
        else window.history.replaceState(null, "", url);
      }
      if (pageChanged) pending.current = { focus: !to.anchor, scroll: true, anchor: to.anchor };
      if (pageChanged || nextLocale !== locale) {
        transition(() => {
          if (nextLocale !== locale) setLocale(nextLocale);
          if (pageChanged) setPage(nextPage);
        });
      } else if (to.anchor) scrollToAnchor(rootRef.current, to.anchor, false);
      // The Navbar's mobile menu is a native popover: close it after any switch.
      rootRef.current?.querySelectorAll<HTMLElement>("[popover]").forEach((p) => {
        try {
          p.hidePopover();
        } catch {
          /* not open */
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, locale, pageKey, localeKey, routing, homePage, homeLocale, params, setLocale, setPage, transition],
  );

  // URL → state on mount and on back/forward.
  React.useEffect(() => {
    if (routing === "memory") return;
    const sync = (initial: boolean) => {
      const loc = readSiteLocation(window.location.search, window.location.hash, routing, params);
      const nextPage = loc.page && pages.includes(loc.page) ? loc.page : homePage;
      const nextLocale = loc.locale && locales.includes(loc.locale) ? loc.locale : homeLocale;
      const anchor = routing === "search" && window.location.hash.length > 1 ? decodeURIComponent(window.location.hash.slice(1)) : undefined;
      const commit = () => {
        setLocale(nextLocale);
        setPage((prev) => {
          if (prev !== nextPage) pending.current = { focus: !initial && !anchor, scroll: !initial, anchor: initial ? anchor : undefined };
          return nextPage;
        });
      };
      if (initial) commit();
      else transitionRef.current(commit);
    };
    // A deep link (`?page=order`) is server-rendered as home and switched here. As a transition,
    // React finishes hydrating the home tree (and any Suspense boundary still dehydrated) before
    // swapping pages, instead of re-rendering mid-hydration — which shifted useId values.
    React.startTransition(() => sync(true));
    const onPop = () => sync(false);
    window.addEventListener("popstate", onPop);
    if (routing === "hash") window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routing, pageKey, localeKey, homePage, homeLocale, params]);

  // After a page change: scroll, focus the h1, and mark the current links.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const todo = pending.current;
    pending.current = null;
    if (todo?.anchor) scrollToAnchor(root, todo.anchor, true);
    else if (todo?.scroll) {
      const top = root.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: "instant" as ScrollBehavior });
    }
    if (todo?.focus) {
      const h1 = root.querySelector<HTMLElement>(`[data-site-page="${cssString(page)}"] h1`) ?? root.querySelector<HTMLElement>("h1");
      if (h1) {
        if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1");
        h1.focus({ preventScroll: true });
      }
    }
    root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
      const loc = parseSiteHref(a.getAttribute("href"), params);
      if (!loc?.page || loc.anchor) return;
      if (loc.page === page) a.setAttribute("aria-current", "page");
      else if (a.getAttribute("aria-current") === "page") a.removeAttribute("aria-current");
    });
  }, [page, locale, params]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const loc = parseSiteHref(a.getAttribute("href"), params);
    if (!loc) return;
    if (loc.page && !pages.includes(loc.page)) return;
    if (loc.locale && !locales.includes(loc.locale)) return;
    e.preventDefault();
    apply(loc, "push");
  };

  const ctx = React.useMemo<SiteShellContextValue>(
    () => ({
      page,
      locale,
      pages,
      locales,
      navigate: (to) => apply(to, "push"),
      hrefFor: (p, anchor) => sitePageHref(p, anchor, { routing, pageParam }),
      motion,
      pageEnter,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, locale, pageKey, localeKey, apply, routing, pageParam, motion, pageEnter],
  );

  // A colour → scoped variables. A name (built-in preset or your own, like "brand") goes
  // straight to data-accent.
  const custom = accent && !isBuiltInAccent(accent) && looksLikeColour(accent) ? accent : undefined;
  const accentStyle = React.useMemo(() => {
    if (!custom) return null;
    try {
      const key = siteAccentKey(`${custom}${accentDark ? `-${accentDark}` : ""}`);
      return { key, css: siteAccentCss(siteAccent(custom, { dark: accentDark }), key) };
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn(`[vamos-ui] SiteShell: ${(err as Error).message}`);
      return null;
    }
  }, [custom, accentDark]);

  return (
    <SiteShellContext.Provider value={ctx}>
      <ThemeScope
        ref={setRoot}
        theme={theme}
        material={material}
        density={density}
        font={font}
        dir={dir}
        accent={accentStyle ? "site" : custom ? undefined : accent}
        data-site-accent={accentStyle?.key}
        data-site-shell=""
        data-motion={motion}
        data-page={page}
        lang={locale}
        className={cn("vb-scope font-sans text-fg", className)}
        onClick={handleClick}
        {...props}
      >
        {accentStyle ? <style>{accentStyle.css}</style> : null}
        {children}
      </ThemeScope>
    </SiteShellContext.Provider>
  );
});

const looksLikeColour = (v: string) => v.trim().startsWith("#") || v.includes("(");
const cssString = (s: string) => s.replace(/["\\]/g, "\\$&");

function scrollToAnchor(root: HTMLElement | null, anchor: string, instant: boolean) {
  const el = root?.ownerDocument.getElementById(anchor);
  if (!el) return;
  el.scrollIntoView?.({ block: "start", behavior: instant ? ("instant" as ScrollBehavior) : undefined });
}

export interface SiteShellPageProps {
  /** Page id from the shell's `pages`. */
  id: string;
  /** Document title while this page is shown (set after navigating, not on first load). */
  title?: string;
  children?: React.ReactNode;
}

/** One inner page: rendered only while it is the shell's current page. */
export function SiteShellPage({ id, title, children }: SiteShellPageProps) {
  const { page, pageEnter } = useSiteShell();
  const active = page === id;
  const first = React.useRef(true);
  React.useEffect(() => {
    if (active && title && !first.current) document.title = title;
    first.current = false;
  }, [active, title]);
  if (!active) return null;
  return (
    <div data-site-page={id} data-page-enter={pageEnter ? "" : undefined} className="contents">
      {children}
    </div>
  );
}

export interface SiteShellLocaleProps {
  /** Locale code from the shell's `locales`. */
  code: string;
  children?: React.ReactNode;
}

/** One language version: rendered only while it is the shell's current locale (with `lang`). */
export function SiteShellLocale({ code, children }: SiteShellLocaleProps) {
  const { locale } = useSiteShell();
  if (locale !== code) return null;
  return (
    <div lang={code} className="contents">
      {children}
    </div>
  );
}

export interface SiteShellLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Target page id. */
  page: string;
  /** In-page anchor on that page (`"faq"`). */
  anchor?: string;
}

/**
 * A link to an inner page for client code. Server components can use a plain
 * `href={sitePageHref("pricing")}` instead; the shell handles both.
 */
export const SiteShellLink = /*#__PURE__*/ React.forwardRef<HTMLAnchorElement, SiteShellLinkProps>(function SiteShellLink({ page, anchor, ...props }, ref) {
  const { hrefFor, page: current } = useSiteShell();
  return <a ref={ref} href={hrefFor(page, anchor)} aria-current={!anchor && current === page ? "page" : undefined} {...props} />;
});
