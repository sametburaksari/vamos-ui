"use client";

import * as React from "react";
import { ArrowRight, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Search, Sun, UserRound, Wind, X } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, MobileNav, type SiteNavItem } from "../../components/navigation-menu";
import { BlockLink } from "../block-link";
import type { BlockAdapters } from "../types";
import { AuthDialog, type AuthDialogProps } from "./auth-dialog";
import { PostCard } from "./post-card";
import { BrandIcon, BRAND_NAMES, type BrandName } from "./shared/brand-icons";
import { cn2 as cn } from "./shared/kit-2";
import { useInheritedDir } from "./shared/use-dir";
import { newsText, type NewsBlockLabels } from "./shared/labels-news";
import type { NewsPost } from "./shared/news";

/* ------------------------------------------------------------------ */
/* Top bar                                                              */
/* ------------------------------------------------------------------ */

export type WeatherCondition = "clear" | "partly-cloudy" | "cloudy" | "rain" | "snow" | "wind" | "fog" | "storm";

export interface WeatherData {
  /** Whole degrees in the unit you show. */
  temp: number;
  place: string;
  condition?: WeatherCondition;
  /** Localized description ("Light rain"). Default: none (the icon carries it). */
  conditionLabel?: string;
}

const weatherIcons: Record<WeatherCondition, typeof Sun> = { clear: Sun, "partly-cloudy": CloudSun, cloudy: Cloud, rain: CloudRain, snow: CloudSnow, wind: Wind, fog: CloudFog, storm: CloudLightning };

export interface NewsTopBarProps {
  /** The date shown (ISO). Default: today in `timeZone`, after hydration. */
  date?: string;
  /** IANA zone for the default date. Default: the browser's. */
  timeZone?: string;
  /** Static weather (demo data, or what your server fetched). */
  weather?: WeatherData;
  /** Adapter for live data: called once on mount; its result replaces `weather`. */
  loadWeather?: () => Promise<WeatherData | null | undefined>;
  /** Utility links (Newsletters, Print edition, Contact). */
  links?: { label: string; href: string }[];
  social?: { network: BrandName; href: string }[];
  /** "Sign in / Join" opening `AuthDialog` with these props. `false` hides it. */
  auth?: Omit<AuthDialogProps, "trigger" | "locale" | "labels"> | false;
  locale?: string;
  labels?: NewsBlockLabels;
  components?: BlockAdapters;
  className?: string;
}

/**
 * The thin strip above a news masthead: today's date, a weather slot, utility links, sign in /
 * join (an `AuthDialog`) and social links. Weather takes static data or a `loadWeather` adapter.
 *
 * ```tsx
 * <NewsTopBar weather={{ temp: 14, place: "Kadıköy", condition: "partly-cloudy" }} social={[{ network: "x", href: "https://x.com/example" }]} auth={{ onSignIn, joinHref: "/join" }} />
 * ```
 */
export function NewsTopBar({ date, timeZone, weather: weatherProp, loadWeather, links, social, auth, locale = "en-US", labels, components, className }: NewsTopBarProps) {
  const t = newsText(labels, locale);
  const [weather, setWeather] = React.useState(weatherProp);
  const [today, setToday] = React.useState<string | undefined>(date);
    React.useEffect(() => {
    if (date) return setToday(date);
    setToday(new Date().toISOString());
  }, [date]);
  // The adapter runs once on mount (an inline arrow would otherwise refetch on every render).
  const loadRef = React.useRef(loadWeather);
  loadRef.current = loadWeather;
  const hasLoader = !!loadWeather;
  React.useEffect(() => {
    if (!hasLoader || !loadRef.current) return;
    let live = true;
    loadRef.current().then(
      (w) => live && w && setWeather(w),
      () => {},
    );
    return () => {
      live = false;
    };
  }, [hasLoader]);

  const dateText = today ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: date && date.length <= 10 ? "UTC" : timeZone }).format(new Date(date && date.length <= 10 ? `${date}T12:00:00Z` : today)) : "";
  const Icon = weather?.condition ? weatherIcons[weather.condition] : null;
  const link = "rounded-[2px] text-fg-muted hover:text-fg focus-ring";

  return (
    <div className={cn("vb-news-topbar @container border-b border-line text-[0.8125rem]", className)}>
      <div className="vb-container flex h-9 items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <time dateTime={today?.slice(0, 10)} className="truncate font-medium text-fg" suppressHydrationWarning>
            {dateText}
          </time>
          {weather ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-fg-muted" data-slot="weather">
              {Icon ? <Icon aria-hidden strokeWidth={1.75} className="size-4" /> : null}
              <span aria-hidden className="tabular">{t("weatherShort", { temp: weather.temp })}</span>
              <span aria-hidden className="@max-lg:hidden">{weather.place}</span>
              <span className="sr-only">{t("weather", { temp: weather.temp, condition: weather.conditionLabel ?? "", place: weather.place })}</span>
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {links?.length ? (
            <ul className="flex items-center gap-4 @max-3xl:hidden">
              {links.map((l) => (
                <li key={l.href}>
                  <BlockLink href={l.href} components={components} locale={locale} className={link}>
                    {l.label}
                  </BlockLink>
                </li>
              ))}
            </ul>
          ) : null}
          {auth === false || auth === undefined ? null : (
            <AuthDialog
              {...auth}
              locale={locale}
              labels={labels}
              trigger={
                <button type="button" className={cn(link, "inline-flex items-center gap-1.5 font-medium text-fg")}>
                  <UserRound aria-hidden strokeWidth={1.75} className="size-4" />
                  {t("signInOrJoin")}
                </button>
              }
            />
          )}
          {social?.length ? (
            <ul className="flex items-center gap-0.5 border-s border-line ps-3 @max-xl:hidden">
              {social.map((s) => (
                <li key={s.network}>
                  <BlockLink href={s.href} newTab components={components} locale={locale} aria-label={BRAND_NAMES[s.network]} className="flex size-7 items-center justify-center rounded-ui-sm text-fg-muted hover:bg-hover hover:text-fg focus-ring">
                    <BrandIcon name={s.network} className="size-[15px]" />
                  </BlockLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header + mega menu                                                   */
/* ------------------------------------------------------------------ */

export interface NewsMegaSection {
  id: string;
  /** "All", "Markets", "Energy". */
  label: string;
  href: string;
  /** Up to four latest stories shown when this section is hovered or focused. */
  posts: NewsPost[];
}

export interface NewsNavItem {
  label: string;
  href: string;
  /** A mega panel: section list on the start side, the hovered section's latest stories beside it. */
  mega?: NewsMegaSection[];
  /** A plain dropdown (used for "More"). */
  children?: { label: string; href: string }[];
}

export interface NewsHeaderProps {
  /** Wordmark (text or an inline SVG logo). */
  brand: React.ReactNode;
  /** Accessible name of the home link when `brand` is not text. */
  brandLabel?: string;
  homeHref?: string;
  /** One line under the wordmark ("Independent news from the coast since 1987"). */
  tagline?: React.ReactNode;
  /** Beside the wordmark on wide screens: an `AdSlot` (leaderboard) or an edition note. */
  aside?: React.ReactNode;
  nav: NewsNavItem[];
  /** Items folded into a final "More" dropdown. */
  more?: { label: string; href: string }[];
  /** Search form target (GET). `false` hides search. Default `{ action: "/search", param: "q" }`. */
  search?: { action: string; param?: string } | false;
  /** The nav row sticks to the top. Default true. */
  sticky?: boolean;
  /** Path of the current page → `aria-current` on the matching nav item. */
  currentPath?: string;
  /** Extra content at the bottom of the mobile drawer (sign-in button, newsletter link). */
  mobileFooter?: React.ReactNode;
  locale?: string;
  labels?: NewsBlockLabels;
  components?: BlockAdapters;
  className?: string;
}

function MegaPanel({ item, locale, labels, components }: { item: NewsNavItem; locale: string; labels?: NewsBlockLabels; components?: BlockAdapters }) {
  const t = newsText(labels, locale);
  const sections = item.mega!;
  const [active, setActive] = React.useState(sections[0]?.id);
  const current = sections.find((s) => s.id === active) ?? sections[0]!;
  const panelId = React.useId();
  return (
    <div className="grid w-[min(64rem,calc(100vw-3rem))] grid-cols-[12rem_minmax(0,1fr)] gap-6 p-5">
      <ul className="flex flex-col gap-0.5 border-e border-line pe-4">
        {sections.map((s) => (
          <li key={s.id}>
            <NavigationMenuLink
              href={s.href}
              variant="top"
              active={false}
              onPointerEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              aria-controls={panelId}
              data-current={s.id === current.id ? "" : undefined}
              className="h-9 w-full justify-start rounded-ui-sm px-3 data-current:bg-hover data-current:text-fg"
            >
              {s.label}
            </NavigationMenuLink>
          </li>
        ))}
      </ul>
      <div id={panelId} className="flex min-w-0 flex-col gap-4" aria-live="polite">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{t("storiesIn", { category: current === sections[0] ? item.label : current.label })}</p>
          <BlockLink href={current.href} components={components} locale={locale} className="inline-flex items-center gap-1 rounded-[2px] text-[0.8125rem] font-medium text-fg-muted hover:text-fg focus-ring">
            {t("viewAll")}
            <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
          </BlockLink>
        </div>
        <ul className="grid grid-cols-4 gap-5">
          {current.posts.slice(0, 4).map((p) => (
            <li key={p.id ?? p.href}>
              <PostCard post={p} variant="stack" size="sm" category={false} meta={{ author: false, comments: false, readingTime: false }} headingLevel={3} sizes="14rem" locale={locale} labels={labels} components={components} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * A newspaper header: the wordmark row (with an optional leaderboard beside it), then a sticky
 * section bar with mega menus — hover or focus a section in the panel to swap its latest
 * stories in. Keyboard: Tab / arrows through the bar, Enter or ↓ opens a panel, Escape closes.
 * On narrow screens the bar becomes a drawer (the kit `MobileNav`). Search opens inline.
 *
 * ```tsx
 * <NewsHeader brand="The Harbour Ledger" nav={[{ label: "City", href: "/city", mega: sections }]} more={[{ label: "Obituaries", href: "/obituaries" }]} />
 * ```
 */
export function NewsHeader({ brand, brandLabel, homeHref = "/", tagline, aside, nav, more, search = { action: "/search", param: "q" }, sticky = true, currentPath, mobileFooter, locale = "en-US", labels, components, className }: NewsHeaderProps) {
  const t = newsText(labels, locale);
  const [searching, setSearching] = React.useState(false);
  const searchBtn = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);
  const closeSearch = () => {
    setSearching(false);
    requestAnimationFrame(() => searchBtn.current?.focus());
  };
  // Radix navigation defaults to ltr; follow the page's direction (RTL sites).
  const barRef = React.useRef<HTMLDivElement>(null);
  const dir = useInheritedDir(barRef);
  const isCurrent = (href: string) => !!currentPath && (currentPath === href || (href !== "/" && currentPath.startsWith(`${href}/`)));

  const mobileItems: SiteNavItem[] = [
    ...nav.map((n) => ({ label: n.label, href: n.href, children: n.mega ? n.mega.map((s) => ({ label: s.label, href: s.href })) : n.children?.map((c) => ({ label: c.label, href: c.href })) })),
    ...(more?.length ? [{ label: t("more"), children: more.map((m) => ({ label: m.label, href: m.href })) }] : []),
  ];
  const iconBtn = "inline-flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-hover focus-ring [&_svg]:size-5";

  return (
    <>
      <header className={cn("vb-news-header contents", className)}>
        <div className="@container">
          <div className="vb-container flex items-center justify-between gap-8 py-[clamp(1rem,2.5cqi,1.75rem)] @max-4xl:hidden">
            <div className="flex min-w-0 flex-col gap-1">
              <BlockLink href={homeHref} components={components} locale={locale} aria-label={brandLabel} className="w-fit rounded-[2px] font-display text-[clamp(1.75rem,1.1rem+2.4cqi,3.25rem)] leading-[0.95] tracking-[-0.02em] text-fg focus-ring">
                {brand}
              </BlockLink>
              {tagline ? <p className="text-[0.8125rem] text-fg-muted">{tagline}</p> : null}
            </div>
            {aside ? <div className="min-w-0 flex-1 @max-5xl:hidden">{aside}</div> : null}
          </div>
        </div>
        <div ref={barRef} className={cn("vb-news-navbar @container z-(--z-nav) border-y border-fg bg-scene", sticky && "sticky top-0")}>
          <div className="vb-container relative flex h-12 items-center justify-between gap-2">
            <MobileNav items={mobileItems} title={t("sections")} className="-ms-2 @4xl:hidden" footer={mobileFooter} labels={{ label: t("mainNav"), title: t("sections") }} />
            <BlockLink href={homeHref} components={components} locale={locale} aria-label={brandLabel} className="me-auto truncate rounded-[2px] font-display text-[1.25rem] text-fg focus-ring @4xl:hidden">
              {brand}
            </BlockLink>
            <NavigationMenu dir={dir} className="static max-w-none flex-none justify-start @max-4xl:hidden" labels={{ label: t("mainNav") }}>
              <NavigationMenuList className="justify-start gap-0">
                {nav.map((item) => (
                  <NavigationMenuItem key={item.href} className="static">
                    {item.mega?.length || item.children?.length ? (
                      <>
                        <NavigationMenuTrigger className="h-12 rounded-none px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-fg data-[state=open]:bg-transparent data-[state=open]:shadow-[inset_0_-3px_0_var(--accent)]" aria-current={isCurrent(item.href) ? "page" : undefined}>
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className={cn("p-0", item.mega?.length ? "w-max" : "w-auto")}>
                          {item.mega?.length ? (
                            <MegaPanel item={item} locale={locale} labels={labels} components={components} />
                          ) : (
                            <ul className="grid w-56 gap-0.5 p-2">
                              {item.children!.map((c) => (
                                <li key={c.href}>
                                  <NavigationMenuLink href={c.href} title={c.label} className="p-2.5" />
                                </li>
                              ))}
                            </ul>
                          )}
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink href={item.href} variant="top" active={isCurrent(item.href)} className="h-12 rounded-none px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-fg aria-[current=page]:shadow-[inset_0_-3px_0_var(--accent)]">
                        {item.label}
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
                {more?.length ? (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="h-12 rounded-none px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-fg-muted data-[state=open]:bg-transparent">{t("more")}</NavigationMenuTrigger>
                    <NavigationMenuContent className="w-auto p-0">
                      <ul className="grid w-60 grid-cols-1 gap-0.5 p-2">
                        {more.map((m) => (
                          <li key={m.href}>
                            <NavigationMenuLink href={m.href} title={m.label} className="p-2.5" />
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : null}
              </NavigationMenuList>
            </NavigationMenu>
            {search ? (
              <button ref={searchBtn} type="button" className={cn(iconBtn, "-me-2 ms-auto")} aria-label={t("search")} aria-expanded={searching} onClick={() => (searching ? closeSearch() : setSearching(true))}>
                {searching ? <X aria-hidden /> : <Search aria-hidden />}
              </button>
            ) : null}
          </div>
          {search && searching ? (
            <div className="border-t border-line bg-scene">
              <form role="search" action={search.action} method="get" className="vb-container flex items-center gap-3 py-3" onKeyDown={(e) => e.key === "Escape" && closeSearch()}>
                <Search aria-hidden className="size-5 shrink-0 text-fg-muted" />
                <input
                  ref={inputRef}
                  type="search"
                  name={search.param ?? "q"}
                  aria-label={t("search")}
                  placeholder={t("searchPlaceholder")}
                  className="h-11 min-w-0 flex-1 bg-transparent font-display text-[1.375rem] text-fg outline-none placeholder:text-fg-subtle"
                />
                <button type="submit" className="inline-flex h-9 items-center rounded-ui-sm bg-fg px-4 text-[0.8125rem] font-semibold text-scene focus-ring">
                  {t("search")}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
