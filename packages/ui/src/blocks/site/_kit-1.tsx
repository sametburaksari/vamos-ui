// Shared parts for the site blocks of registry-1 (navbar, hero, feature grid, …).
// Server-safe: no hooks except useId, no context, no zod.

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatMessage } from "../../lib/message-format";
import { BlockLink } from "../block-link";
import { blockLabels, type BlockLabels } from "../labels";
import type { BlockAdapters, ImageData } from "../types";
import type { CtaStyle } from "../schema/types";

/* ------------------------------------------------------------------ */
/* Built-in strings (D2b). English defaults; `site1LabelsTr` for tr.   */
/* ------------------------------------------------------------------ */

export const site1Labels = {
  announcement: "Announcement",
  notice: "Notice",
  dismiss: "Dismiss announcement",
  mainNavigation: "Main",
  openMenu: "Menu",
  closeMenu: "Close menu",
  menuDialog: "Site menu",
  languages: "Language",
  callUs: "Call {phone}",
  phoneLabel: "Phone",
  breadcrumb: "Breadcrumb",
  playVideo: "Play video: {title}",
  pauseVideo: "Pause background video",
  resumeVideo: "Play background video",
  video: "Video",
  openCalendar: "Open calendar",
  loadsCalendar: "Loads the booking calendar from {provider}",
  faqMore: "Can’t find your question?",
  stepLabel: "Step {n}",
  emailLabel: "Email address",
  emailPlaceholder: "you@company.com",
  subscribe: "Subscribe",
  subscribed: "Thanks — check your inbox to confirm.",
  subscribeError: "That didn’t go through. Try again in a moment.",
  date: "Date",
  time: "Time",
  guests: "Guests",
  service: "Service",
  guestsCount: "{count, plural, one {# guest} other {# guests}}",
  askAvailability: "Ask for availability",
  opensWhatsApp: "(opens WhatsApp)",
  closedOn: "We’re closed on {day}. Pick another date.",
  bookingMessage: "Hi, I’d like to book for {guests} on {date} at {time}.",
  bookingMessageService: "Hi, I’d like to book {service} on {date} at {time}.",
  bookingFallback: "Hi, I’d like to make a booking.",
  percent: "percent",
  logos: "Clients",
  source: "Source: {source}",
};
export type Site1Labels = typeof site1Labels;

export const site1LabelsTr: Site1Labels = {
  announcement: "Duyuru",
  notice: "Duyuru",
  dismiss: "Duyuruyu kapat",
  mainNavigation: "Ana menü",
  openMenu: "Menü",
  closeMenu: "Menüyü kapat",
  menuDialog: "Site menüsü",
  languages: "Dil",
  callUs: "Ara: {phone}",
  phoneLabel: "Telefon",
  breadcrumb: "Sayfa yolu",
  playVideo: "Videoyu oynat: {title}",
  pauseVideo: "Arka plan videosunu duraklat",
  resumeVideo: "Arka plan videosunu oynat",
  video: "Video",
  openCalendar: "Takvimi aç",
  loadsCalendar: "Rezervasyon takvimi {provider} üzerinden yüklenir",
  faqMore: "Sorunuzu bulamadınız mı?",
  stepLabel: "Adım {n}",
  emailLabel: "E-posta adresi",
  emailPlaceholder: "siz@sirket.com",
  subscribe: "Abone ol",
  subscribed: "Teşekkürler — onay için gelen kutunuza bakın.",
  subscribeError: "Gönderilemedi. Birazdan tekrar deneyin.",
  date: "Tarih",
  time: "Saat",
  guests: "Kişi",
  service: "Hizmet",
  guestsCount: "{count} kişi",
  askAvailability: "Uygunluk sor",
  opensWhatsApp: "(WhatsApp’ı açar)",
  closedOn: "{day} günleri kapalıyız. Başka bir tarih seçin.",
  bookingMessage: "Merhaba, {date} {time} için {guests} rezervasyon yapmak istiyorum.",
  bookingMessageService: "Merhaba, {date} {time} için {service} randevusu almak istiyorum.",
  bookingFallback: "Merhaba, rezervasyon yapmak istiyorum.",
  percent: "yüzde",
  logos: "Müşteriler",
  source: "Kaynak: {source}",
};

export type SiteBlockLabels = Partial<BlockLabels & Site1Labels>;

/** Label lookup for registry-1 blocks: `labels` prop → English. */
export function siteText(labels: SiteBlockLabels | undefined, locale = "en-US") {
  const merged: Record<string, string> = { ...blockLabels, ...site1Labels };
  if (labels) for (const [k, v] of Object.entries(labels)) if (typeof v === "string") merged[k] = v;
  return (key: keyof (BlockLabels & Site1Labels), vars?: Record<string, unknown>) => formatMessage(merged[key] ?? String(key), vars, locale);
}

/** The raw template of a label (for islands that format it later with their own values). */
export function siteTemplate(labels: SiteBlockLabels | undefined, key: keyof Site1Labels): string {
  const v = labels?.[key];
  return typeof v === "string" ? v : site1Labels[key];
}

/* ------------------------------------------------------------------ */
/* Plain data shapes (what the schema stores, after localize())        */
/* ------------------------------------------------------------------ */

/** A call to action: `{ link: { href, label }, style }` — the `f.cta()` shape. */
export interface SiteCta {
  link: { href: string; label: React.ReactNode; newTab?: boolean; kind?: string };
  style?: CtaStyle;
}

/** A short label/value fact ("Founded" · "2014"). */
export interface SiteMeta {
  label: React.ReactNode;
  value: React.ReactNode;
}

/** An image with intrinsic size; `alt` required unless decorative. */
export type SiteImage = ImageData;

/** Stable ids for a block: `base` (anchor-safe) and the heading id. Server-safe. */
export function useBlockIds(id: string | undefined, prefix: string) {
  const auto = React.useId();
  const base = id ?? `${prefix}-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return { base, headingId: `${base}-title` };
}

/** `data-field` attribute for edit mode. */
export const field = (editMode: boolean | undefined, path: string) => (editMode ? { "data-field": `props.${path}` } : undefined);

/* ------------------------------------------------------------------ */
/* Actions                                                              */
/* ------------------------------------------------------------------ */

export interface CtaListProps {
  actions?: readonly SiteCta[];
  components?: BlockAdapters;
  labels?: SiteBlockLabels;
  locale?: string;
  size?: "md" | "lg" | "xl";
  /** Override every action's style (e.g. "link" in a split navbar). */
  forceStyle?: CtaStyle;
  /** Only the first n actions. */
  max?: number;
  editMode?: boolean;
  className?: string;
  /** Add an arrow after `link`-style actions. Default true. */
  arrow?: boolean;
}

/** Renders a block's actions; enforces "one primary" by demoting later primaries to secondary. */
export function CtaList({ actions, components, labels, locale, size = "lg", forceStyle, max = 2, editMode, className, arrow = true }: CtaListProps) {
  if (!actions?.length) return null;
  let primarySeen = false;
  return (
    <div data-dock-avoid="items" className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}>
      {actions.slice(0, max).map((a, i) => {
        let style: CtaStyle = forceStyle ?? a.style ?? "secondary";
        if (style === "primary") {
          if (primarySeen) style = "secondary";
          primarySeen = true;
        }
        return (
          <BlockLink
            key={`${a.link.href}-${i}`}
            href={a.link.href}
            newTab={a.link.newTab}
            appearance={style}
            size={size}
            components={components}
            labels={labels}
            locale={locale}
            editMode={editMode}
            field={`props.actions.${i}`}
            data-track={a.link.kind}
          >
            {a.link.label}
            {style === "link" && arrow ? <ArrowEnd /> : null}
          </BlockLink>
        );
      })}
    </div>
  );
}

/** Logical "→" that mirrors in RTL. Decorative. */
export function ArrowEnd({ className }: { className?: string }) {
  return <ArrowRight aria-hidden strokeWidth={1.5} className={cn("vb-arrow size-[1em] shrink-0 transition-transform duration-200", className)} />;
}

/** Two-digit mono index ("01"). */
export const indexLabel = (i: number) => String(i + 1).padStart(2, "0");
