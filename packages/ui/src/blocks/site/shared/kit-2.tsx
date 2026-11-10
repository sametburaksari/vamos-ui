// Small shared helpers for the registry-2 site blocks. Server-safe: only useId, no context, no zod.

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { createFormatter } from "../../../format/core";
import type { MoneyValue, ImageRef, LinkRef } from "../../schema/types";

/** Stable ids for a block: `base` (anchor-safe) and the heading id. */
export function useBlockIds2(id: string | undefined, prefix: string) {
  const auto = React.useId();
  const base = id ?? `${prefix}-${auto.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return { base, headingId: `${base}-title` };
}

/** `data-field` attribute for edit mode. */
export const fieldAttr = (editMode: boolean | undefined, path: string) => (editMode ? { "data-field": `props.${path}` } : undefined);

/** Two-digit mono index ("01"). */
export const index2 = (i: number) => String(i + 1).padStart(2, "0");

/** Plain image as layer-1 blocks receive it (after `localize()`: `alt` is a string). */
export type SiteImage2 = Omit<ImageRef, "alt" | "width" | "height"> & { alt?: string; width?: number; height?: number };

/** Plain link as layer-1 blocks receive it. */
export interface SiteLink2 {
  href: string;
  label: React.ReactNode;
  newTab?: boolean;
  kind?: LinkRef["kind"];
}

/** Money → "$4,500" / "₺4.500". Whole amounts drop the decimals. */
export function formatMoney(value: MoneyValue, locale = "en-US", display: Intl.NumberFormatOptions["currencyDisplay"] = "narrowSymbol"): string {
  const whole = /^-?\d+(\.0+)?$/.test(value.amount);
  return createFormatter(locale).currency(value.amount, {
    currency: value.currency,
    display,
    minimumFractionDigits: whole ? 0 : undefined,
    maximumFractionDigits: whole ? 0 : undefined,
  });
}

/** Money with the full currency name, for screen readers ("4,500 US dollars"). */
export const formatMoneyLong = (value: MoneyValue, locale = "en-US") => formatMoney(value, locale, "name");

/** A date-only or ISO value → "November 14, 2026" / "14 Kasım 2026". Stays on the calendar day. */
export function formatDate2(value: string, locale = "en-US", preset: "short" | "medium" | "long" = "long"): string {
  return createFormatter(locale).date(value, preset);
}

/** `YYYY-MM-DD` for `time[datetime]` from a date-only or ISO value. */
export const isoDay = (value: string) => value.slice(0, 10);

/** The string inside a ReactNode, when there is one. */
export const textOf = (n: React.ReactNode): string => (typeof n === "string" || typeof n === "number" ? String(n) : "");

/** Visually hidden text. */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/** Digits of a phone number for `tel:` (keeps the leading +). */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** "+902168072907" → "+90 216 807 29 07" for TR numbers; other numbers are grouped loosely. */
export function prettyPhone(e164: string): string {
  const d = e164.replace(/[^\d+]/g, "");
  const tr = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(d);
  if (tr) return `+90 ${tr[1]} ${tr[2]} ${tr[3]} ${tr[4]}`;
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(d);
  if (us) return `+1 ${us[1]} ${us[2]} ${us[3]}`;
  return d.replace(/^(\+\d{2})(\d{3})(\d{3})(\d+)$/, "$1 $2 $3 $4");
}

/**
 * Address lines in a locale-neutral order: street · district · postcode + city · region.
 * The country is omitted for a domestic audience unless `withCountry`.
 */
export function addressLines(a: import("../../schema/types").AddressValue, opts: { withCountry?: boolean; locale?: string } = {}): string[] {
  const cityLine = [a.postalCode, a.district && a.country === "TR" ? `${a.district}/${a.city}` : a.city].filter(Boolean).join(" ");
  const lines = [a.line, a.district && a.country !== "TR" ? a.district : undefined, cityLine, a.region && a.region !== a.city ? a.region : undefined];
  if (opts.withCountry) {
    try {
      lines.push(new Intl.DisplayNames([opts.locale ?? "en-US"], { type: "region" }).of(a.country));
    } catch {
      lines.push(a.country);
    }
  }
  return lines.filter((l): l is string => !!l);
}

// `cn` with the site type scale registered as font sizes. The shared `lib/cn` doesn't know
// text-h3 / text-lead / text-display-* yet and drops them next to a colour (text-fg) — see requests.
const twMergeSite = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["2xs", "h3", "lead", "body", "small", "eyebrow", "display-2xl", "display-xl", "display-l", "display-m"] }],
      rounded: [{ rounded: ["ui", "ui-sm", "ui-lg"] }],
    },
  },
});
/** Class merge for site blocks (last wins; type-scale aware). */
export function cn2(...inputs: ClassValue[]) {
  return twMergeSite(clsx(inputs));
}
