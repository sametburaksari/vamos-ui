import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import type { BlockBaseProps } from "../types";
import { CtaList, indexLabel, useBlockIds, type SiteBlockLabels, type SiteCta, type SiteImage } from "./_kit-1";
import { Reveal } from "../../motion/reveal";

export type StepsVariant = "vertical" | "horizontal" | "split";

export interface StepsItem {
  title: React.ReactNode;
  /** A string renders as a paragraph; any other node (a code panel, a list) renders in a plain `div`. */
  text?: React.ReactNode;
  /** "1–2 weeks", "45 min". */
  duration?: React.ReactNode;
  media?: SiteImage;
}

export interface StepsProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * vertical: a thin rule along the start edge with mono numbers on it, a duration tag per step.
   * horizontal: a timeline on wide containers (numbers above the line, text below); vertical when narrow.
   * split: sticky title on the start side (4 cols), big hairline-separated numbered steps on the end side.
   */
  variant?: StepsVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  steps: StepsItem[];
  /** Under the steps (≤ 2). */
  actions?: SiteCta[];
  labels?: SiteBlockLabels;
}

/**
 * "How we work" — discovery → design → launch; a first spa visit; SaaS setup. An ordered list
 * (the order is announced; the numbers are visual). Server component.
 *
 * ```tsx
 * <Steps title="How a project *runs*" steps={[{ title: "Discovery", text: "…", duration: "1 week" }]} />
 * ```
 */
export function Steps({ variant = "vertical", eyebrow, title, lead, steps, actions, id, theme, anchor, className, headingLevel = 2, labels, locale, components, editMode }: StepsProps) {
  const { base, headingId } = useBlockIds(id, "steps");
  const StepTag = `h${Math.min(headingLevel + 1, 6)}` as "h3";
  const f = (i: number, k: string) => (editMode ? { "data-field": `props.steps.${i}.${k}` } : undefined);

  const stepTitle = (s: StepsItem, i: number, cls?: string) => (
    <StepTag className={cn("text-h3 font-semibold tracking-[-0.012em] text-fg text-balance", cls)} {...f(i, "title")}>
      {s.title}
    </StepTag>
  );
  const stepText = (s: StepsItem, i: number) => {
    if (!s.text) return null;
    const Tag = typeof s.text === "string" || typeof s.text === "number" ? "p" : "div";
    return (
      <Tag className={cn("text-body text-fg-muted text-pretty", Tag === "p" ? "max-w-[52ch]" : "flex min-w-0 flex-col gap-3")} {...f(i, "text")}>
        {s.text}
      </Tag>
    );
  };
  const duration = (s: StepsItem, i: number) =>
    s.duration ? (
      <span className="inline-flex w-fit items-center rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.6875rem] tabular tracking-[0.04em] text-fg-muted" {...f(i, "duration")}>
        {s.duration}
      </span>
    ) : null;
  const media = (s: StepsItem) => (s.media ? <BlockImage {...s.media} aspect="3:2" sizes="(min-width: 56rem) 30vw, 100vw" className="mt-2 max-w-md rounded-ui" components={components} labels={labels} /> : null);

  const header = title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} align={variant === "horizontal" && lead ? "split" : "start"} headingLevel={headingLevel} headingId={headingId} editMode={editMode} labels={labels} locale={locale} /> : null;
  const actionsEl = actions?.length ? <CtaList actions={actions} components={components} labels={labels} locale={locale} editMode={editMode} /> : null;

  let content: React.ReactNode;
  if (variant === "split") {
    content = (
      <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
        <div className="@4xl:col-span-4">
          <div className="flex flex-col gap-8 @4xl:sticky @4xl:top-[calc(var(--vb-nav-h,4.5rem)+2rem)]">
            {header}
            {actionsEl}
          </div>
        </div>
        <ol className="flex flex-col @4xl:col-span-7 @4xl:col-start-6">
          {steps.map((s, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr] gap-x-[clamp(1.25rem,4cqi,3rem)] gap-y-3 border-t border-line py-8 last:border-b">
              <span aria-hidden className="row-span-4 font-display text-display-m leading-none tabular text-fg-subtle">
                {indexLabel(i)}
              </span>
              {stepTitle(s, i, "pt-1")}
              {stepText(s, i)}
              {duration(s, i)}
              {media(s)}
            </li>
          ))}
        </ol>
      </Container>
    );
  } else if (variant === "horizontal") {
    content = (
      <Container className="flex flex-col gap-[calc(var(--section-y)*0.4)]">
        {header}
        <ol className="vb-steps-h grid gap-y-0 @4xl:gap-x-(--gutter)" style={{ "--vb-steps": steps.length } as React.CSSProperties}>
          {steps.map((s, i) => (
            <li key={i} className="vb-step relative flex flex-col gap-3 ps-10 pb-10 @4xl:ps-0 @4xl:pb-0">
              <span aria-hidden className="vb-step-num font-mono text-eyebrow tabular text-fg-muted">
                {indexLabel(i)}
              </span>
              <span aria-hidden className={cn("vb-step-dot", i === 0 && "vb-step-dot-first")} />
              <div className="flex flex-col gap-3 @4xl:pt-6">
                {stepTitle(s, i)}
                {stepText(s, i)}
                {duration(s, i)}
                {media(s)}
              </div>
            </li>
          ))}
        </ol>
        {actionsEl}
      </Container>
    );
  } else {
    content = (
      <Container className="grid gap-x-(--gutter) gap-y-12 @4xl:grid-cols-12">
        <div className="flex flex-col gap-8 @4xl:col-span-5">
          {header}
          {actionsEl}
        </div>
        <ol className="vb-steps-v flex flex-col @4xl:col-span-6 @4xl:col-start-7">
          {steps.map((s, i) => (
            <li key={i} className="vb-step relative flex flex-col gap-3 ps-12 pb-10 last:pb-0">
              <span aria-hidden className={cn("vb-step-badge absolute start-0 top-0 inline-flex size-8 items-center justify-center rounded-full border border-line bg-scene font-mono text-[0.6875rem] tabular text-fg-muted", i === 0 && "vb-step-badge-first")}>
                {indexLabel(i)}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pt-1">
                {stepTitle(s, i)}
                {duration(s, i)}
              </div>
              {stepText(s, i)}
              {media(s)}
            </li>
          ))}
        </ol>
      </Container>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={base} blockType="steps" editMode={editMode} className={cn("vb-steps", className)} data-variant={variant}>
      <Reveal disabled={editMode}>{content}</Reveal>
    </Section>
  );
}
