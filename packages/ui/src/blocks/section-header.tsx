import * as React from "react";
import { cn } from "../lib/cn";
import { BlockHeading, renderEmphasis } from "./block-heading";
import type { BlockLabels } from "./labels";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small mono line above the title ("Menu", "Since 1998"). */
  eyebrow?: React.ReactNode;
  /** Index before the eyebrow ("01"). */
  index?: string;
  /** Title; a string supports one `*emphasis*`. */
  title?: React.ReactNode;
  /** Intro paragraph. */
  lead?: React.ReactNode;
  /** Buttons / links (one primary at most). */
  actions?: React.ReactNode;
  /**
   * start (default): stacked, start-aligned, capped at 64ch.
   * split: on wide containers the title takes 5 of 12 columns, lead + actions the other 7.
   * center: narrow measure — only for statement heroes and minimal CTAs.
   */
  align?: "start" | "split" | "center";
  /** Title size: m = section h2, l = large section title. Default `"m"`. */
  size?: "m" | "l";
  /** Heading level. Default 2. */
  headingLevel?: 1 | 2 | 3;
  /** Id for the title — pass the same value to `Section headingId`. */
  headingId?: string;
  editMode?: boolean;
  labels?: Partial<BlockLabels>;
  locale?: string;
}

/**
 * The heading group at the top of a block: eyebrow, title, lead, actions. Start-aligned by
 * default (D6-2). Server component.
 *
 * ```tsx
 * <SectionHeader eyebrow="Private dining" title="Rooms for *twelve* or forty" lead="…" align="split" headingId="rooms" />
 * ```
 */
export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { eyebrow, index, title, lead, actions, align = "start", size = "m", headingLevel = 2, headingId, editMode, labels, locale, className, ...props },
  ref,
) {
  const heading = (
    <BlockHeading
      id={headingId}
      level={headingLevel}
      size={size === "l" ? "display-l" : "display-m"}
      text={title}
      editMode={editMode}
      field="props.title"
      labels={labels}
      locale={locale}
    />
  );
  const eyebrowEl =
    eyebrow || index ? (
      <p className={cn("flex items-center gap-3 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted", align === "center" && "justify-center")} data-field={editMode ? "props.eyebrow" : undefined}>
        {index ? (
          <>
            <span className="tabular text-fg">{index}</span>
            <span aria-hidden className="h-px w-6 bg-current opacity-40" />
          </>
        ) : null}
        {eyebrow ? <span>{renderEmphasis(eyebrow)}</span> : null}
      </p>
    ) : null;
  const leadEl = lead ? (
    <p className="vb-lead max-w-(--measure) text-lead text-fg-muted" data-field={editMode ? "props.lead" : undefined}>
      {lead}
    </p>
  ) : null;
  const actionsEl = actions ? <div className={cn("flex flex-wrap items-center gap-3", align === "center" && "justify-center")}>{actions}</div> : null;

  if (align === "split") {
    return (
      <div ref={ref} data-align="split" className={cn("grid gap-x-(--gutter) gap-y-6 @4xl:grid-cols-12 @4xl:items-end", className)} {...props}>
        <div className="flex flex-col gap-5 @4xl:col-span-6 @6xl:col-span-5">
          {eyebrowEl}
          {heading}
        </div>
        {leadEl || actionsEl ? (
          <div className="flex flex-col gap-6 @4xl:col-span-6 @4xl:col-start-7 @6xl:col-span-6 @6xl:col-start-7 [&_.vb-lead]:max-w-[52ch]">
            {leadEl}
            {actionsEl}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-align={align}
      className={cn("flex flex-col gap-5", align === "center" ? "mx-auto max-w-(--prose) items-center text-center [&_.vb-lead]:mx-auto" : "max-w-(--measure)", className)}
      {...props}
    >
      {eyebrowEl}
      {heading}
      {leadEl ? <div className="pt-1">{leadEl}</div> : null}
      {actionsEl ? <div className="pt-3">{actionsEl}</div> : null}
    </div>
  );
});
