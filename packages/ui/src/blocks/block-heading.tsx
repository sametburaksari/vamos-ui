import * as React from "react";
import { cn } from "../lib/cn";
import { parseEmphasis } from "./schema/emphasis";
import { blockText, type BlockLabels } from "./labels";

export type BlockHeadingSize = "display-2xl" | "display-xl" | "display-l" | "display-m" | "h3";

const sizeClass: Record<BlockHeadingSize, string> = {
  "display-2xl": "font-display text-display-2xl",
  "display-xl": "font-display text-display-xl",
  "display-l": "font-display text-display-l",
  "display-m": "font-display text-display-m",
  h3: "text-h3 font-semibold tracking-[-0.012em]",
};

/** Renders a heading string with its `*emphasis*` as `<em>`. ReactNodes pass through untouched. */
export function renderEmphasis(text: React.ReactNode): React.ReactNode {
  if (typeof text !== "string") return text;
  const parts = parseEmphasis(text);
  if (parts.length === 0) return "";
  if (parts.length === 1 && !parts[0]!.em) return parts[0]!.text;
  return parts.map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <React.Fragment key={i}>{p.text}</React.Fragment>));
}

export interface BlockHeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "children"> {
  /** Heading copy. A string supports one `*emphasis*`. */
  text?: React.ReactNode;
  children?: React.ReactNode;
  /** Outline level. Default 2 (the renderer passes 1 to the page's first intro block). */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size, independent of the level. Default `"display-m"`. */
  size?: BlockHeadingSize;
  /** Builder canvas: an empty heading renders an "Add a title" placeholder. */
  editMode?: boolean;
  /** Prop path for edit mode (`data-field`), e.g. `"props.title"`. */
  field?: string;
  labels?: Partial<BlockLabels>;
  locale?: string;
}

/**
 * Display heading for site blocks. Fluid size from the `--text-display-*` scale, follows the
 * `data-font` preset (italic serif emphasis in editorial, accent ink in sans presets). Server component.
 *
 * ```tsx
 * <BlockHeading level={1} size="display-xl" text="Dinner, *slowly*." />
 * ```
 */
export const BlockHeading = React.forwardRef<HTMLHeadingElement, BlockHeadingProps>(function BlockHeading(
  { text, children, level = 2, size = "display-m", editMode, field, labels, locale, className, ...props },
  ref,
) {
  const Tag = `h${level}` as "h2";
  const content = children ?? renderEmphasis(text);
  const empty = content === undefined || content === null || content === "";
  if (empty && !editMode) return null;
  return (
    <Tag
      ref={ref}
      className={cn("vb-heading text-fg", sizeClass[size], className)}
      data-field={editMode ? field : undefined}
      data-empty={empty ? "" : undefined}
      {...props}
    >
      {empty ? blockText(labels, locale)("addTitle") : content}
    </Tag>
  );
});
