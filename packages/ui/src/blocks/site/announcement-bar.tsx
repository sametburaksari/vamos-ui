import * as React from "react";
import { cn } from "../../lib/cn";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { AnnouncementDismiss } from "./announcement-dismiss";
import { ArrowEnd, field, siteText, type SiteBlockLabels } from "./_kit-1";

export type AnnouncementVariant = "inline" | "centered";
export type AnnouncementTone = "neutral" | "accent" | "warning";

export interface AnnouncementBarProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /** inline: text at the start, link after it, dismiss at the end. centered: a mono "Notice" label, text + link centred. */
  variant?: AnnouncementVariant;
  /** One line, ≤ 120 characters. */
  text: React.ReactNode;
  link?: { href: string; label: React.ReactNode; newTab?: boolean };
  /** neutral = ink strip, accent = accent strip, warning = 14% warning tint. Always solid. Default `"neutral"`. */
  tone?: AnnouncementTone;
  /** Show a dismiss button (tiny client island + cookie). */
  dismissible?: boolean;
  /** The app read the cookie server-side and the visitor dismissed it: render nothing. */
  dismissed?: boolean;
  /** Cookie name. Default `vb_ann_<hash of the text>` — new copy shows again. */
  storageKey?: string;
  /** ISO datetime: hidden before. */
  from?: string;
  /** ISO datetime (exclusive): hidden from. */
  until?: string;
  /** "Now" for the schedule check (tests, previews). Default the render time. */
  now?: Date | string;
  /** Small label before the text in `centered`. Default "Notice". */
  label?: React.ReactNode;
  labels?: SiteBlockLabels;
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const textOf = (n: React.ReactNode): string => (typeof n === "string" || typeof n === "number" ? String(n) : "");

const toneClass: Record<AnnouncementTone, string> = {
  neutral: "bg-fg text-scene",
  accent: "bg-accent text-accent-fg",
  warning: "vb-announcement-warning text-fg",
};

/**
 * A one-line, time-boxed notice at the very top of a site ("Closed 1–3 April for the holiday").
 * Server component; the dismiss button is a ~0.5 KB island.
 *
 * ```tsx
 * <AnnouncementBar text="Closed 1–3 April for Eid — open again Thursday from noon." link={{ href: "/hours", label: "Holiday hours" }} />
 * ```
 */
export function AnnouncementBar({
  variant = "inline",
  text,
  link,
  tone = "neutral",
  dismissible,
  dismissed,
  storageKey,
  from,
  until,
  now,
  label,
  id,
  anchor,
  className,
  labels,
  locale,
  components,
  editMode,
}: AnnouncementBarProps) {
  const t = siteText(labels, locale);
  if (dismissed && !editMode) return null;
  const at = now ? new Date(now).getTime() : Date.now();
  const outside = (from && at < Date.parse(from)) || (until && at >= Date.parse(until));
  if (outside && !editMode) return null;
  const cookie = storageKey ?? `vb_ann_${hash(textOf(text) + textOf(link?.label))}`;
  const centered = variant === "centered";

  const linkEl = link ? (
    <BlockLink
      href={link.href}
      newTab={link.newTab}
      components={components}
      labels={labels}
      locale={locale}
      editMode={editMode}
      field="props.link"
      className="group/ann inline-flex min-h-6 shrink-0 items-center gap-1.5 font-medium underline decoration-current/40 underline-offset-[0.28em] transition-[text-decoration-color] hover:decoration-current focus-ring rounded-[2px]"
    >
      {link.label}
      <ArrowEnd className="group-hover/ann:translate-x-0.5 rtl:group-hover/ann:-translate-x-0.5" />
    </BlockLink>
  ) : null;

  return (
    <div
      role="region"
      aria-label={t("announcement")}
      id={anchor}
      data-announcement=""
      data-variant={variant}
      data-tone={tone}
      data-block-id={editMode ? id : undefined}
      data-hidden={editMode && outside ? "" : undefined}
      className={cn("vb-announcement relative text-small", toneClass[tone], className)}
    >
      <div className={cn("vb-container flex min-h-9 items-center gap-3 py-1.5", centered && "justify-center text-center")}>
        <p className={cn("flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5", centered ? "justify-center" : "flex-1")}>
          {centered ? (
            <span className="font-mono text-eyebrow uppercase tracking-[0.08em] after:ms-3 after:inline-block after:h-[0.7em] after:w-px after:bg-current after:align-[-0.05em] after:opacity-40 after:content-['']" {...field(editMode, "label")}>
              {label ?? t("notice")}
            </span>
          ) : null}
          <span className="text-pretty" {...field(editMode, "text")}>
            {text}
          </span>
          {linkEl}
        </p>
        {dismissible ? (
          <AnnouncementDismiss cookie={cookie} label={t("dismiss")} className={centered ? "absolute end-[max(var(--gutter),0.5rem)] top-1/2 -translate-y-1/2" : undefined} />
        ) : null}
      </div>
    </div>
  );
}
