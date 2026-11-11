import * as React from "react";
import { cn } from "../lib/cn";
import { BlockLink } from "./block-link";
import { isBreak, richFromText, type RichBlock, type RichDoc, type RichInline, type RichMark, type RichTextRun } from "./schema/rich-doc";
import { blockText, type BlockLabels } from "./labels";
import type { BlockAdapters } from "./types";

type LinkMark = Extract<RichMark, { type: "link" }>;
const MARK_ORDER = ["bold", "italic", "underline", "strike", "highlight", "code", "sub", "sup"] as const;
const markTag = { bold: "strong", italic: "em", underline: "u", strike: "s", highlight: "mark", code: "code", sub: "sub", sup: "sup" } as const;

export interface RichTextRenderOptions {
  components?: BlockAdapters;
  labels?: Partial<BlockLabels>;
  locale?: string;
  /** Shift stored heading levels: 1 renders h2 as h3 (inside a block whose title is h2). */
  headingOffset?: 0 | 1 | 2;
}

function textWithBreaks(text: string, key: string): React.ReactNode {
  if (!text.includes("\n")) return text;
  return text.split("\n").map((line, i) => (
    <React.Fragment key={`${key}-${i}`}>
      {i > 0 ? <br /> : null}
      {line}
    </React.Fragment>
  ));
}

function renderRun(run: RichTextRun, key: string): React.ReactNode {
  let node: React.ReactNode = textWithBreaks(run.text, key);
  const types = new Set((run.marks ?? []).map((m) => m.type));
  // innermost first so the nesting is always strong > em > u > s > mark > code > sub/sup
  for (const m of [...MARK_ORDER].reverse()) {
    if (types.has(m)) {
      const Tag = markTag[m];
      node = <Tag key={`${key}-${m}`}>{node}</Tag>;
    }
  }
  return node;
}

const linkOf = (n: RichInline): LinkMark | undefined => (isBreak(n) ? undefined : (n.marks?.find((m) => m.type === "link") as LinkMark | undefined));
const sameLink = (a?: LinkMark, b?: LinkMark) => !!a && !!b && a.href === b.href && !!a.newTab === !!b.newTab;

/** Renders inline runs. Consecutive runs with the same link share one `<a>`. */
export function renderInline(content: readonly RichInline[] | undefined, opts: RichTextRenderOptions = {}, keyPrefix = "i"): React.ReactNode {
  if (!content?.length) return null;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < content.length; i++) {
    const n = content[i]!;
    const key = `${keyPrefix}${i}`;
    if (isBreak(n)) {
      out.push(<br key={key} />);
      continue;
    }
    const link = linkOf(n);
    if (!link) {
      out.push(<React.Fragment key={key}>{renderRun(n, key)}</React.Fragment>);
      continue;
    }
    const group: React.ReactNode[] = [renderRun(n, key)];
    while (i + 1 < content.length && sameLink(link, linkOf(content[i + 1]!))) {
      i++;
      group.push(<React.Fragment key={`${keyPrefix}${i}`}>{renderRun(content[i] as RichTextRun, `${keyPrefix}${i}`)}</React.Fragment>);
    }
    out.push(
      <BlockLink key={key} href={link.href} newTab={link.newTab} title={link.title} components={opts.components} labels={opts.labels} locale={opts.locale}>
        {group}
      </BlockLink>,
    );
  }
  return out;
}

/** Renders RichDoc blocks (no wrapper). */
export function renderRichBlocks(blocks: readonly RichBlock[], opts: RichTextRenderOptions = {}, keyPrefix = "b"): React.ReactNode {
  return blocks.map((b, i) => {
    const key = `${keyPrefix}${i}`;
    switch (b.type) {
      case "paragraph":
        return b.content?.length ? <p key={key}>{renderInline(b.content, opts, `${key}-`)}</p> : null;
      case "heading": {
        const level = Math.min(6, b.level + (opts.headingOffset ?? 0));
        const Tag = `h${level}` as "h2";
        return (
          <Tag key={key} id={b.anchor}>
            {renderInline(b.content, opts, `${key}-`)}
          </Tag>
        );
      }
      case "list": {
        const items = b.items.map((it, j) => <li key={j}>{renderRichBlocks(it.content, opts, `${key}-${j}-`)}</li>);
        return b.ordered ? (
          <ol key={key} start={b.start && b.start !== 1 ? b.start : undefined}>
            {items}
          </ol>
        ) : (
          <ul key={key}>{items}</ul>
        );
      }
      case "blockquote":
        return (
          <blockquote key={key}>
            {renderRichBlocks(b.content, opts, `${key}-`)}
            {b.cite ? <footer>{b.cite}</footer> : null}
          </blockquote>
        );
      case "code":
        return (
          // Focusable + named so a long line that scrolls sideways is reachable by keyboard.
          <pre key={key} data-language={b.language} tabIndex={0} role="region" aria-label={b.language ? `${blockText(opts.labels, opts.locale)("codeSample")} (${b.language})` : blockText(opts.labels, opts.locale)("codeSample")}>
            <code>{b.text}</code>
          </pre>
        );
      case "hr":
        return <hr key={key} />;
      default:
        return null;
    }
  });
}

export interface RichTextProps extends RichTextRenderOptions, Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  /** A RichDoc, a list of RichDoc blocks, inline runs, or plain text (blank line = new paragraph). */
  doc?: RichDoc | readonly RichBlock[] | readonly RichInline[] | string;
  /** Text size: 14 / 16 / 18 px. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Remove the reading-width cap (64ch). */
  fullWidth?: boolean;
  editMode?: boolean;
  /** Prop path for edit mode (`data-field`). */
  field?: string;
}

const isInlineList = (v: readonly unknown[]): v is readonly RichInline[] => v.length > 0 && v.every((n) => typeof n === "object" && n !== null && ("text" in n || (n as { type?: string }).type === "br"));

/**
 * Pure server renderer for the RichDoc format (paragraphs, h2–h4, lists, quotes, code, rules +
 * bold, italic, underline, strike, code, highlight, sub/sup, links). No editor code reaches the
 * site. Links are sanitised and routed through `components.Link`.
 *
 * ```tsx
 * <RichText doc={props.body} components={{ Link: NextLink }} />
 * ```
 */
export function RichText({ doc, components, labels, locale, headingOffset, size = "md", fullWidth, editMode, field, className, ...props }: RichTextProps) {
  if (doc === undefined || doc === null || (typeof doc === "string" && !doc.trim())) {
    return editMode ? (
      <div data-field={field} data-empty="" className={cn("prose-ui vb-prose text-fg-subtle", className)} {...props}>
        <p>{blockText(labels, locale)("addText")}</p>
      </div>
    ) : null;
  }
  const opts: RichTextRenderOptions = { components, labels, locale, headingOffset };
  let body: React.ReactNode;
  if (typeof doc === "string") body = renderRichBlocks(richFromText(doc).content, opts);
  else if (Array.isArray(doc)) body = isInlineList(doc) ? <p>{renderInline(doc, opts)}</p> : renderRichBlocks(doc as readonly RichBlock[], opts);
  else body = renderRichBlocks((doc as RichDoc).content ?? [], opts);
  return (
    <div
      data-slot="rich-text"
      data-field={editMode ? field : undefined}
      className={cn("prose-ui vb-prose", size === "sm" && "prose-ui-sm", size === "lg" && "prose-ui-lg", fullWidth && "max-w-none", className)}
      {...props}
    >
      {body}
    </div>
  );
}
