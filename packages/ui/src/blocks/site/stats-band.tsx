import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { SectionHeader } from "../section-header";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { RichDoc } from "../schema/rich-doc";
import { CountUp } from "../../motion/count-up";
import { Reveal, Stagger } from "../../motion/reveal";
import { siteText, useBlockIds, type SiteBlockLabels } from "./_kit-1";

export type StatsBandVariant = "inline" | "with-text" | "ledger";

export interface StatItem {
  /** Numbers are formatted with `Intl` (4.8 → "4,8" in tr); strings are shown verbatim ("24/7"). */
  value: number | string;
  /** Small superscript unit ("%", "k", "min"). */
  unit?: string;
  /** Spoken unit for screen readers ("percent"). `%` is spelled out automatically. */
  unitLabel?: string;
  label: React.ReactNode;
  /** Where the figure comes from ("Google Business Profile, Oct 2026"). Unsourced figures read as marketing. */
  source?: React.ReactNode;
}

export interface StatsBandProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * inline: 3–4 figures on one line between vertical rules; unit as a superscript, label below.
   * with-text: a paragraph on the start side, a 2×2 grid of figures on the end side.
   * ledger: label, dotted leader, figure — an annual report line; mono source below.
   */
  variant?: StatsBandVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** with-text: the paragraph(s) beside the figures. */
  body?: RichDoc | string;
  items: StatItem[];
  labels?: SiteBlockLabels;
}

function formatValue(v: number | string, locale: string): string {
  if (typeof v !== "number") return v;
  const decimals = Math.min(2, (String(v).split(".")[1] ?? "").length);
  return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

/**
 * Concrete, sourced numbers ("4.8 on Google · 1,240 reviews"). Semantic `dl`, Intl formatting,
 * units spelled out for screen readers. Numeric figures count up once when they scroll into view
 * (motion kit CountUp: width reserved, final value for screen readers, still under reduced
 * motion / `motion="off"`); the items reveal in sequence. Server component.
 *
 * ```tsx
 * <StatsBand items={[{ value: 4.8, label: "Google rating", source: "1,240 reviews, Nov 2026" }]} />
 * ```
 */
export function StatsBand({ variant = "inline", eyebrow, title, lead, body, items, id, theme, anchor, className, headingLevel = 2, labels, locale = "en-US", components, editMode }: StatsBandProps) {
  const t = siteText(labels, locale);
  const { base, headingId } = useBlockIds(id, "stats");

  const figure = (s: StatItem, size: string) => {
    const spoken = s.unitLabel ?? (s.unit === "%" ? t("percent") : s.unit);
    return (
      <span className={cn("font-display tabular text-fg", size)}>
        {typeof s.value === "number" && !editMode ? <CountUp value={s.value} locale={locale} /> : formatValue(s.value, locale)}
        {s.unit ? (
          <>
            <sup aria-hidden className="vb-stat-unit ms-[0.08em] align-super font-sans text-[0.38em] font-medium tracking-normal text-fg-muted">
              {s.unit}
            </sup>
            <span className="sr-only"> {spoken}</span>
          </>
        ) : null}
      </span>
    );
  };
  const source = (s: StatItem, cls?: string) =>
    s.source ? (
      <dd className={cn("font-mono text-[0.6875rem] leading-snug tracking-[0.02em] text-fg-subtle", cls)}>
        <span className="sr-only">{t("source", { source: "" })}</span>
        {s.source}
      </dd>
    ) : null;

  const header =
    title || eyebrow || (lead && variant !== "with-text") ? (
      <Reveal disabled={editMode}>
        <SectionHeader eyebrow={eyebrow} title={title} lead={variant === "with-text" ? undefined : lead} headingLevel={headingLevel} headingId={headingId} editMode={editMode} labels={labels} locale={locale} />
      </Reveal>
    ) : null;

  let content: React.ReactNode;
  if (variant === "ledger") {
    content = (
      <div className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
        {header ? <div className="@4xl:col-span-4">{header}</div> : null}
        <Stagger asChild effect="fade" disabled={editMode}>
          <dl className={cn("flex flex-col border-t border-line", header ? "@4xl:col-span-7 @4xl:col-start-6" : "@4xl:col-span-12")}>
            {items.map((s, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line py-5" data-field={editMode ? `props.items.${i}` : undefined}>
                <dt className="text-body text-fg">{s.label}</dt>
                <span aria-hidden className="vb-leader self-end" />
                <dd className="text-end">{figure(s, "text-display-m")}</dd>
                {source(s, "col-span-3")}
              </div>
            ))}
          </dl>
        </Stagger>
      </div>
    );
  } else if (variant === "with-text") {
    content = (
      <div className="grid gap-x-(--gutter) gap-y-12 @4xl:grid-cols-12 @4xl:items-start">
        <div className="flex flex-col gap-6 @4xl:col-span-5">
          {header}
          {lead ? <p className="vb-lead text-lead text-fg-muted">{lead}</p> : null}
          {body ? <RichText doc={body} components={components} labels={labels} locale={locale} headingOffset={1} editMode={editMode} field="props.body" /> : null}
        </div>
        <Stagger asChild disabled={editMode}>
          <dl className="grid grid-cols-2 border-s border-t border-line @4xl:col-span-6 @4xl:col-start-7">
            {items.slice(0, 4).map((s, i) => (
              <div key={i} className="flex flex-col gap-2 border-e border-b border-line p-[clamp(1rem,3cqi,2rem)]" data-field={editMode ? `props.items.${i}` : undefined}>
                <dt className="order-2 text-small text-fg-muted text-pretty">{s.label}</dt>
                <dd className="order-1">{figure(s, "text-display-l")}</dd>
                {source(s, "order-3 mt-auto pt-3")}
              </div>
            ))}
          </dl>
        </Stagger>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-12">
        {header}
        <Stagger asChild disabled={editMode}>
          <dl className={cn("grid grid-cols-2 gap-y-10", items.length >= 3 && "@4xl:grid-cols-3", items.length >= 4 && "@4xl:grid-cols-4", items.length >= 5 && "@6xl:grid-cols-5")}>
            {items.map((s, i) => (
              <div key={i} className="vb-stat-inline flex flex-col gap-2 border-line ps-[clamp(0.75rem,2.5cqi,2rem)]" data-field={editMode ? `props.items.${i}` : undefined}>
                <dt className="order-2 max-w-[24ch] text-small text-fg-muted text-pretty">{s.label}</dt>
                <dd className="order-1">{figure(s, "text-display-l")}</dd>
                {source(s, "order-3")}
              </div>
            ))}
          </dl>
        </Stagger>
      </div>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={base} blockType="stats" editMode={editMode} className={cn("vb-stats", className)} data-variant={variant}>
      <Container>{content}</Container>
    </Section>
  );
}
