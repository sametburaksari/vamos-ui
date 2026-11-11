import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { BlockHeading } from "../block-heading";
import { RichText } from "../rich-text";
import type { BlockBaseProps } from "../types";
import type { RichDoc } from "../schema/rich-doc";
import { field, useBlockIds, type SiteBlockLabels } from "./_kit-1";
import { headingLines } from "./shared/heading-lines";

export type RichTextSectionVariant = "column" | "aside-heading" | "two-column";

export interface RichTextSectionProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * column: a 42rem column on grid columns 2–9 (not centred); optional drop cap.
   * aside-heading: a sticky title on the start side (4 cols), the text on the end side (7 cols).
   * two-column: newspaper columns on wide containers only.
   */
  variant?: RichTextSectionVariant;
  eyebrow?: React.ReactNode;
  /** Optional title; body headings shift one level below it. */
  title?: React.ReactNode;
  /** RichDoc, or plain text (blank line = paragraph). */
  body: RichDoc | string;
  /** Large first letter (column variant; best with the editorial preset). */
  dropCap?: boolean;
  /** Meta line under an aside title ("Last updated 4 November 2026"). */
  note?: React.ReactNode;
  /** Text size. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  labels?: SiteBlockLabels;
}

/**
 * Long text — an about page, a privacy notice, a service description. Pure server rendering of
 * the RichDoc format; no editor code reaches the site.
 *
 * ```tsx
 * <RichTextSection variant="aside-heading" title="Privacy notice" body={doc} />
 * ```
 */
export function RichTextSection({ variant = "column", eyebrow, title, body, dropCap, note, size = "md", id, theme, anchor, className, headingLevel = 2, labels, locale, components, editMode }: RichTextSectionProps) {
  const { base, headingId } = useBlockIds(id, "text");
  const offset = (title ? 1 : 0) as 0 | 1;
  const heading = title ? <BlockHeading id={headingId} level={headingLevel} size="display-m" text={headingLines(title)} editMode={editMode} field="props.title" labels={labels} locale={locale} /> : null;
  const eyebrowEl = eyebrow ? (
    <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted" {...field(editMode, "eyebrow")}>
      {eyebrow}
    </p>
  ) : null;
  const text = (cls?: string) => (
    <RichText doc={body} size={size} headingOffset={offset} components={components} labels={labels} locale={locale} editMode={editMode} field="props.body" className={cls} />
  );

  let content: React.ReactNode;
  if (variant === "aside-heading") {
    content = (
      <Container className="grid gap-x-(--gutter) gap-y-8 @4xl:grid-cols-12">
        {heading || eyebrowEl ? (
          <div className="@4xl:col-span-4">
            <div className="flex flex-col gap-4 @4xl:sticky @4xl:top-[calc(var(--vb-nav-h,4.5rem)+2rem)]">
              {eyebrowEl}
              {heading}
              {note ? <p className="font-mono text-small text-fg-subtle">{note}</p> : null}
            </div>
          </div>
        ) : null}
        <div className="@4xl:col-span-7 @4xl:col-start-6">{text()}</div>
      </Container>
    );
  } else if (variant === "two-column") {
    content = (
      <Container className="flex flex-col gap-8">
        {eyebrowEl || heading ? (
          <div className="flex max-w-(--measure) flex-col gap-4">
            {eyebrowEl}
            {heading}
          </div>
        ) : null}
        {text("vb-prose-columns max-w-none")}
      </Container>
    );
  } else {
    content = (
      <Container className="grid gap-y-8 @4xl:grid-cols-12 @4xl:gap-x-(--gutter)">
        <div className="flex flex-col gap-8 @4xl:col-span-8 @4xl:col-start-2 @6xl:col-span-7 @6xl:col-start-2">
          {eyebrowEl || heading ? (
            <div className="flex flex-col gap-4">
              {eyebrowEl}
              {heading}
            </div>
          ) : null}
          {text(cn("max-w-(--prose)", dropCap && "vb-dropcap"))}
        </div>
      </Container>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={base} blockType="rich-text" editMode={editMode} className={cn("vb-rich-text", className)} data-variant={variant}>
      {content}
    </Section>
  );
}
