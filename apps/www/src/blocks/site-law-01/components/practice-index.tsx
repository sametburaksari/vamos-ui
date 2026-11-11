"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@vamos-ui/react";

export interface PracticeIndexItem {
  id: string;
  no: string;
  title: string;
  short: string;
  href: string;
  lead: string;
  head: { name: string; role: string; photo?: string };
  matters: { year: string; text: string; value?: string }[];
  facts: { label: string; value: string }[];
}

export interface PracticeIndexProps {
  items: PracticeIndexItem[];
  /** Accessible name of the list. */
  label: string;
  /** Small caps label over the preview ("Recent matters"). */
  mattersLabel: string;
  /** "Read more" link text in the preview; `{title}` is replaced. */
  moreLabel: string;
  /** Level of each practice title. Default 3. */
  headingLevel?: 2 | 3;
}

/**
 * The practice-area index (signature element): one row per practice with a large serif
 * numeral. Numerals are drawn as outlines; the active row's numeral fills with the accent and
 * the panel beside the list (wide screens) shows that practice — its lead, the partner who runs
 * it and recent matters. Hover or keyboard focus selects a row; every row links to its page.
 */
export function PracticeIndex({ items, label, mattersLabel, moreLabel, headingLevel = 3 }: PracticeIndexProps) {
  const [active, setActive] = React.useState(0);
  const current = items[active] ?? items[0]!;
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    <div className="grid gap-10 @5xl:grid-cols-12 @5xl:gap-12">
      <ol aria-label={label} className="@5xl:col-span-7">
        {items.map((it, i) => (
          <li key={it.id} className="border-t border-[color-mix(in_oklch,var(--accent-ink)_35%,transparent)] last:border-b">
            <a
              href={it.href}
              data-practice-row=""
              data-active={i === active ? "" : undefined}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-x-5 rounded-[2px] py-6 focus-ring @2xl:grid-cols-[7.5rem_minmax(0,1fr)_auto] @2xl:items-center @2xl:py-7"
            >
              <span
                aria-hidden
                className={cn(
                  "font-display text-[4.25rem] leading-[0.8] tracking-[-0.04em] tabular-nums transition-colors duration-300 motion-reduce:transition-none @2xl:text-[6.5rem]",
                  "text-accent-ink @5xl:text-transparent @5xl:[-webkit-text-stroke:1.25px_var(--accent-ink)]",
                  "@5xl:group-data-[active]:text-accent-ink",
                )}
              >
                {it.no}
              </span>
              <span className="min-w-0">
                <Heading className="font-display text-h3 leading-tight text-fg @2xl:text-[1.875rem]">
                  <span className="sr-only">{it.no}. </span>
                  {it.title}
                </Heading>
                <span className="mt-1.5 block max-w-[46ch] text-pretty text-small text-fg-muted @2xl:text-body">{it.short}</span>
                <span className="mt-2 block text-[0.8125rem] text-fg-muted @5xl:hidden">{it.head.name}</span>
              </span>
              <ArrowRight aria-hidden className="col-start-2 mt-3 size-5 text-accent-ink transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none @2xl:col-start-auto @2xl:mt-0" />
            </a>
          </li>
        ))}
      </ol>

      {/* Preview of the active practice — wide screens only, decorative: the rows carry the same links and text. */}
      <aside aria-hidden className="hidden @5xl:col-span-5 @5xl:block">
        <div className="sticky top-[calc(var(--topbar-h,4rem)+2rem)] border-t-2 border-accent-ink pt-6">
          <p className="font-mono text-eyebrow uppercase tracking-[0.14em] text-accent-ink">
            {current.no} — {current.title}
          </p>
          <p className="mt-4 text-pretty text-lead leading-[1.5] text-fg">{current.lead}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-line py-4">
            {current.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{f.label}</dt>
                <dd className="mt-1 text-small font-medium text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-eyebrow uppercase tracking-[0.14em] text-fg-muted">{mattersLabel}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {current.matters.slice(0, 2).map((m) => (
              <li key={m.text} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 text-small">
                <span className="font-mono tabular-nums text-fg-muted">{m.year}</span>
                <span className="text-pretty text-fg">
                  {m.text}
                  {m.value ? <span className="ms-1 font-medium text-accent-ink">{m.value}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-4">
            {current.head.photo ? <img src={current.head.photo} alt="" width={56} height={70} className="h-[70px] w-14 rounded-[2px] object-cover grayscale" /> : null}
            <div className="min-w-0">
              <p className="font-display text-[1.25rem] leading-tight">{current.head.name}</p>
              <p className="text-[0.8125rem] text-fg-muted">{current.head.role}</p>
            </div>
          </div>
          <a href={current.href} tabIndex={-1} className="mt-6 inline-flex items-center gap-2 text-small font-medium text-accent-ink underline decoration-1 underline-offset-[0.3em] hover:decoration-2">
            {moreLabel.replace("{title}", current.title)}
            <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </aside>
    </div>
  );
}
