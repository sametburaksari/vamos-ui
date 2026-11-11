import * as React from "react";
import { Menu, Phone, X } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import { cn } from "../../lib/cn";
import { baseLanguage } from "../../lib/text";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import { SkipLink } from "../section";
import type { BlockBaseProps } from "../types";
import { NavbarSubmenu } from "./navbar-submenu";
import { CtaList, useBlockIds, siteText, type SiteBlockLabels, type SiteCta, type SiteImage, type SiteMeta } from "./_kit-1";

export type NavbarVariant = "bar" | "split" | "minimal" | "rail";

export interface NavbarLink {
  label: React.ReactNode;
  href: string;
  /** One line under the label in a submenu ("Weekly menus from the pass"). */
  description?: React.ReactNode;
  newTab?: boolean;
}

export interface NavbarItem extends NavbarLink {
  /** Submenu links (≤ 8). Desktop: a disclosure dropdown island; mobile: an indented list. */
  children?: NavbarLink[];
}

export interface NavbarLocale {
  /** "en", "tr" — shown uppercase. */
  code: string;
  href: string;
  /** Marks the active language. Default: `code` matches the `locale` prop. */
  current?: boolean;
}

export interface NavbarProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * bar: logo, links beside it, phone + one CTA at the end.
   * split: logo dead centre, links on both sides, CTA as a text link at the far end.
   * minimal: wordmark + "Menu" + CTA; a full-screen menu with display-size links.
   * rail: links inside one framed pill in the middle, "Sign in" + "Try free" at the end.
   */
  variant?: NavbarVariant;
  logo?: SiteImage;
  /** Shown instead of `logo` inside dark sections / dark mode. */
  logoDark?: SiteImage;
  /** Text mark when there's no logo (or beside it in `minimal`). */
  wordmark?: React.ReactNode;
  /** Brand link. Default `"/"`. */
  homeHref?: string;
  items?: NavbarItem[];
  /** Up to two calls to action; one primary. */
  actions?: SiteCta[];
  /** E.164 (`+902160000000`). Shown in national format, dialled as `tel:`. */
  phone?: string;
  locales?: NavbarLocale[];
  /** Stick to the top; the background fills in as the page scrolls (CSS scroll timeline). */
  sticky?: boolean;
  /** Start transparent with light text over a full-bleed hero. */
  overlay?: boolean;
  /** Path of the current page → `aria-current="page"`. */
  currentPath?: string;
  /** Facts at the bottom of the full-screen menu (address, hours). */
  panelMeta?: SiteMeta[];
  /** Render the "Skip to content" link first. Default true. */
  skipLink?: boolean;
  labels?: SiteBlockLabels;
}

/** National format in the number's own locale, international elsewhere ("0216 000 00 00" for tr). */
export function formatSitePhone(e164: string, locale = "en-US"): string {
  const p = parsePhoneNumberFromString(e164);
  if (!p) return e164;
  const sameCountry = baseLanguage(locale) === "tr" ? p.country === "TR" : locale.toUpperCase().endsWith(`-${p.country ?? "?"}`);
  return (sameCountry ? p.formatNational() : p.formatInternational()).replace(/[()]/g, "");
}

const isCurrent = (href: string, path?: string) => !!path && (path === href || (href !== "/" && path.replace(/\/$/, "") === href.replace(/\/$/, "")));
const inGroup = (item: NavbarItem, path?: string) => !!path && (isCurrent(item.href, path) || !!item.children?.some((c) => isCurrent(c.href, path) || (c.href !== "/" && path.startsWith(`${c.href}/`))));

/**
 * Site top navigation in four characters. Server component: the mobile menu is a native
 * `popover` (0 JS), submenus a tiny disclosure island, the scrolled background a CSS scroll
 * timeline.
 *
 * ```tsx
 * <Navbar wordmark="Kıyı" items={[{ label: "Menu", href: "/menu" }]} actions={[{ link: { href: "/book", label: "Book a table" }, style: "primary" }]} sticky />
 * ```
 */
export function Navbar({
  variant = "bar",
  logo,
  logoDark,
  wordmark,
  homeHref = "/",
  items = [],
  actions,
  phone,
  locales,
  sticky,
  overlay,
  currentPath,
  panelMeta,
  skipLink = true,
  id,
  anchor,
  className,
  labels,
  locale,
  components,
  editMode,
}: NavbarProps) {
  const t = siteText(labels, locale);
  const { base } = useBlockIds(id, "nav");
  const panelId = `${base}-menu`;
  const lang = baseLanguage(locale);
  const phoneText = phone ? formatSitePhone(phone, locale) : undefined;
  const linkProps = { components, labels, locale };

  const brand = (
    <BlockLink href={homeHref} {...linkProps} className="vb-nav-brand flex shrink-0 items-center gap-3 rounded-[2px] focus-ring">
      {logo ? (
        <>
          <BlockImage {...logo} decorative={!!wordmark || logo.decorative} alt={wordmark ? undefined : logo.alt} priority className={cn("vb-nav-logo", logoDark && "vb-logo-light")} components={components} />
          {logoDark ? <BlockImage {...logoDark} decorative priority className="vb-nav-logo vb-logo-dark" components={components} /> : null}
        </>
      ) : null}
      {wordmark || !logo ? (
        <span className={cn("vb-nav-wordmark font-display text-fg", variant === "split" ? "text-[1.625rem]" : "text-[1.375rem]")} data-field={editMode ? "props.wordmark" : undefined}>
          {wordmark}
        </span>
      ) : null}
    </BlockLink>
  );

  const renderLink = (item: NavbarLink, key: React.Key, className?: string) => (
    <BlockLink
      key={key}
      href={item.href}
      newTab={item.newTab}
      {...linkProps}
      aria-current={isCurrent(item.href, currentPath) ? "page" : undefined}
      className={cn("vb-nav-link", className)}
    >
      {item.label}
    </BlockLink>
  );

  const desktopItem = (item: NavbarItem, i: number) =>
    item.children?.length ? (
      <li key={i}>
        <NavbarSubmenu label={item.label} active={inGroup(item, currentPath)} wide={item.children.some((c) => c.description)}>
          <ul className={cn("grid gap-0.5", item.children.some((c) => c.description) && "grid-cols-2")}>
            {item.children.map((c, j) => (
              <li key={j}>
                <BlockLink
                  href={c.href}
                  newTab={c.newTab}
                  {...linkProps}
                  aria-current={isCurrent(c.href, currentPath) ? "page" : undefined}
                  className="vb-nav-sublink flex flex-col gap-0.5 rounded-ui-sm px-3 py-2.5 text-sm text-fg transition-colors hover:bg-hover focus-ring"
                >
                  <span className="font-medium">{c.label}</span>
                  {c.description ? <span className="text-small leading-snug text-fg-muted">{c.description}</span> : null}
                </BlockLink>
              </li>
            ))}
          </ul>
        </NavbarSubmenu>
      </li>
    ) : (
      <li key={i}>{renderLink(item, i)}</li>
    );

  const linkList = (list: NavbarItem[], offset = 0, className?: string) => (
    <ul className={cn("vb-nav-links hidden items-center @4xl:flex", variant === "rail" ? "gap-1" : "gap-7", className)}>{list.map((it, i) => desktopItem(it, i + offset))}</ul>
  );

  const phoneLink = phone ? (
    <a href={`tel:${phone}`} aria-label={t("callUs", { phone: phoneText })} data-track="call" className="vb-nav-phone hidden items-center gap-2 rounded-[2px] font-mono text-small tabular text-fg-muted transition-colors hover:text-fg focus-ring @6xl:inline-flex">
      <Phone aria-hidden strokeWidth={1.5} className="size-3.5" />
      {phoneText}
    </a>
  ) : null;

  const localeSwitch = locales?.length ? (
    <ul aria-label={t("languages")} className="hidden items-center gap-1 font-mono text-eyebrow uppercase tracking-[0.08em] @4xl:flex">
      {locales.map((l, i) => {
        const current = l.current ?? baseLanguage(l.code) === lang;
        return (
          <li key={l.code} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden className="text-fg-subtle">/</span> : null}
            <a href={l.href} hrefLang={l.code} lang={l.code} aria-current={current ? "true" : undefined} className={cn("rounded-[2px] px-0.5 transition-colors focus-ring", current ? "text-fg" : "text-fg-muted hover:text-fg")}>
              {l.code}
            </a>
          </li>
        );
      })}
    </ul>
  ) : null;

  const trigger = (always: boolean) => (
    <button
      type="button"
      popoverTarget={panelId}
      aria-haspopup="dialog"
      aria-controls={panelId}
      className={cn(
        "vb-nav-trigger inline-flex h-10 items-center gap-2 rounded-ui px-2 text-sm font-medium text-fg transition-colors hover:bg-hover focus-ring",
        !always && "@4xl:hidden",
      )}
    >
      {always ? (
        <span className="font-mono text-eyebrow uppercase tracking-[0.08em]">{t("openMenu")}</span>
      ) : (
        <>
          <Menu aria-hidden strokeWidth={1.5} className="size-5" />
          <span className="sr-only">{t("openMenu")}</span>
        </>
      )}
    </button>
  );

  const primaryAction = actions?.length ? <CtaList actions={actions} {...linkProps} size="md" max={variant === "bar" || variant === "minimal" ? 1 : 2} className="hidden flex-nowrap gap-x-2 @2xl:flex" /> : null;

  let row: React.ReactNode;
  if (variant === "split") {
    const half = Math.ceil(items.length / 2);
    row = (
      <>
        <div className="flex min-w-0 items-center">
          {trigger(false)}
          {linkList(items.slice(0, half))}
        </div>
        <div className="flex justify-center">{brand}</div>
        <div className="flex min-w-0 items-center justify-end gap-7">
          {linkList(items.slice(half), half)}
          {localeSwitch}
          {actions?.length ? <CtaList actions={actions.slice(0, 1)} {...linkProps} forceStyle="link" arrow={false} className="hidden @2xl:flex" /> : null}
        </div>
      </>
    );
  } else if (variant === "minimal") {
    row = (
      <>
        {brand}
        <div className="ms-auto flex items-center gap-3">
          {localeSwitch}
          {primaryAction}
          {trigger(true)}
        </div>
      </>
    );
  } else if (variant === "rail") {
    row = (
      <>
        {brand}
        <div className="flex flex-1 justify-center">{items.length ? <div className="vb-nav-rail hidden rounded-full p-1 @4xl:block">{linkList(items)}</div> : null}</div>
        <div className="flex items-center gap-2">
          {localeSwitch}
          {actions?.length ? (
            <CtaList
              actions={actions.map((a) => (a.style === "primary" ? a : { ...a, style: "secondary" as const }))}
              {...linkProps}
              size="md"
              className="hidden flex-nowrap gap-x-1.5 @2xl:flex [&>a:not(.vb-action-primary)]:border-transparent [&>a:not(.vb-action-primary)]:bg-transparent [&>a:not(.vb-action-primary)]:shadow-none"
            />
          ) : null}
          {trigger(false)}
        </div>
      </>
    );
  } else {
    row = (
      <>
        {brand}
        {linkList(items, 0, "ms-4")}
        <div className="ms-auto flex items-center gap-5">
          {phoneLink}
          {localeSwitch}
          {primaryAction}
          {trigger(false)}
        </div>
      </>
    );
  }

  const panelLinkSize = variant === "minimal" ? "font-display text-display-l" : "font-display text-display-m";

  return (
    <header
      id={anchor}
      data-variant={variant}
      data-sticky={sticky ? "" : undefined}
      data-overlay={overlay ? "" : undefined}
      data-block-id={editMode ? id : undefined}
      className={cn("vb-navbar", overlay && "dark", className)}
    >
      {skipLink ? <SkipLink labels={labels} locale={locale} /> : null}
      <nav aria-label={t("mainNavigation")} className={cn("vb-container vb-navbar-row items-center", variant === "split" ? "grid grid-cols-[1fr_auto_1fr] gap-6" : "flex gap-6")}>
        {row}
      </nav>

      <div id={panelId} popover="auto" role="dialog" aria-label={t("menuDialog")} className="vb-nav-panel">
        <div className="vb-container flex min-h-full flex-col">
          <div className="vb-navbar-row flex items-center justify-between gap-6">
            {brand}
            <button
              type="button"
              popoverTarget={panelId}
              popoverTargetAction="hide"
              className="inline-flex h-10 items-center gap-2 rounded-ui px-2 text-fg transition-colors hover:bg-hover focus-ring"
            >
              <span className={variant === "minimal" ? "font-mono text-eyebrow uppercase tracking-[0.08em]" : "sr-only"}>{t("closeMenu")}</span>
              <X aria-hidden strokeWidth={1.5} className="size-5" />
            </button>
          </div>
          <ul className="flex flex-col py-[clamp(1.5rem,6vh,4rem)]">
            {items.map((it, i) => (
              <li key={i} className="border-b border-line">
                {renderLink(it, i, cn("vb-nav-panel-link block py-3 text-fg", panelLinkSize))}
                {it.children?.length ? (
                  <ul className="flex flex-wrap gap-x-6 gap-y-2 pb-4">
                    {it.children.map((c, j) => (
                      <li key={j}>{renderLink(c, j, "text-small text-fg-muted hover:text-fg")}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
            {actions?.length ? <CtaList actions={actions} {...linkProps} size="lg" /> : null}
            {phone || panelMeta?.length || locales?.length ? (
              <dl className="grid gap-x-8 gap-y-4 border-t border-line pt-6 text-small sm:grid-cols-3">
                {phone ? (
                  <div>
                    <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("phoneLabel")}</dt>
                    <dd className="mt-1">
                      <a href={`tel:${phone}`} data-track="call" className="tabular text-fg underline decoration-line underline-offset-4 focus-ring">
                        {phoneText}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {panelMeta?.map((m, i) => (
                  <div key={i}>
                    <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{m.label}</dt>
                    <dd className="mt-1 text-fg">{m.value}</dd>
                  </div>
                ))}
                {locales?.length ? (
                  <div>
                    <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("languages")}</dt>
                    <dd className="mt-1 flex gap-3">
                      {locales.map((l) => (
                        <a key={l.code} href={l.href} hrefLang={l.code} lang={l.code} aria-current={(l.current ?? baseLanguage(l.code) === lang) ? "true" : undefined} className="font-mono uppercase text-fg-muted aria-[current]:text-fg focus-ring">
                          {l.code}
                        </a>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
