import * as React from "react";
import { cn } from "../lib/cn";
import { Container } from "../blocks/section";
import { JsonLd, mergeJsonLd, type JsonLdNode } from "../blocks/json-ld";
import { renderInline } from "../blocks/rich-text";
import { blockText, type BlockLabels } from "../blocks/labels";
import { inlineToText } from "../blocks/schema/rich-doc";
import { prepareDoc, resolveDoc, type PreparedDoc, type PreparedNode, type PrepareOptions, type Resolvers } from "./prepare";
import type { BlockAdapters, BlockComponentProps } from "../blocks/types";
import type { BlockRegion } from "../blocks/schema/define-block";
import type { VamosDoc } from "../blocks/schema/types";

export interface RenderDocOptions extends PrepareOptions {
  /** Framework bindings passed to every block (`{ Image: NextImage, Link: NextLink }`). */
  components?: BlockAdapters;
  /** Built-in strings (e.g. `blockLabelsTr`). */
  labels?: Partial<BlockLabels>;
  /** Show placeholders for unknown / invalid blocks. Default: `editMode` or not production. */
  dev?: boolean;
  /** Regions to render, in order. Default all four. */
  regions?: readonly BlockRegion[];
  /** Wrap the body in `<main id={mainId}>` (skip-link target). */
  mainId?: string;
  /** Emit one merged JSON-LD `@graph` script. Default true. */
  jsonLd?: boolean;
  /** Classes for the wrapper around consecutive text blocks. */
  proseClassName?: string;
}

const isProd = () => typeof process !== "undefined" && process.env?.NODE_ENV === "production";

/** Edit/dev placeholder for a block that can't render normally. Server component. */
export function BlockNotice({
  tone = "danger",
  title,
  hint,
  type,
  blockId,
}: {
  tone?: "danger" | "warning";
  title: string;
  hint?: string;
  type: string;
  blockId?: string;
}) {
  return (
    <div className="vb-container py-4" data-block-id={blockId} data-block-type={type} data-block-notice={tone}>
      <div role="note" data-tone={tone} className="vb-notice flex flex-col gap-1 rounded-ui px-4 py-3.5 @2xl:flex-row @2xl:items-baseline @2xl:gap-4">
        <span className="shrink-0 font-mono text-eyebrow uppercase tracking-[0.08em] text-(--tone-ink)">{type}</span>
        <span className="text-small">
          <strong className="font-semibold text-fg">{title}</strong>
          {hint ? <span className="text-fg-muted"> — {hint}</span> : null}
        </span>
      </div>
    </div>
  );
}

interface Ctx {
  opts: RenderDocOptions;
  dev: boolean;
  t: ReturnType<typeof blockText>;
  jsonLd: JsonLdNode[];
  locale: string;
}

function editAttrs(ctx: Ctx, n: PreparedNode) {
  return ctx.opts.editMode ? { "data-block-id": n.node.id, "data-block-type": n.node.type, "data-hidden": n.node.hidden ? "" : undefined } : {};
}

/** Core text blocks (paragraph, heading, list, quote, code, divider) — render without a registry entry. */
function renderCore(n: PreparedNode, ctx: Ctx, key: string): React.ReactNode {
  const { node } = n;
  const p = (node.props ?? {}) as { level?: number; ordered?: boolean; start?: number; language?: string; cite?: string };
  const io = { components: ctx.opts.components, labels: ctx.opts.labels, locale: ctx.locale };
  const attrs = editAttrs(ctx, n);
  const children = (slot = "items") => (n.slots[slot] ?? []).map((c, i) => renderCore(c, ctx, `${key}-${i}`));
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} {...attrs}>
          {renderInline(node.content, io)}
        </p>
      );
    case "heading": {
      const level = Math.min(6, Math.max(1, p.level ?? 2));
      const Tag = `h${level}` as "h2";
      return (
        <Tag key={key} id={node.anchor} {...attrs}>
          {renderInline(node.content, io)}
        </Tag>
      );
    }
    case "list": {
      const Tag = p.ordered ? "ol" : "ul";
      return (
        <Tag key={key} start={p.ordered && p.start && p.start !== 1 ? p.start : undefined} {...attrs}>
          {children()}
        </Tag>
      );
    }
    case "list-item":
      return (
        <li key={key} {...attrs}>
          {node.content?.length ? renderInline(node.content, io) : null}
          {children()}
        </li>
      );
    case "quote":
      return (
        <blockquote key={key} {...attrs}>
          {node.content?.length ? <p>{renderInline(node.content, io)}</p> : null}
          {children()}
          {p.cite ? <footer>{p.cite}</footer> : null}
        </blockquote>
      );
    case "code":
      return (
        <pre key={key} data-language={p.language} {...attrs}>
          <code>{inlineToText(node.content)}</code>
        </pre>
      );
    case "divider":
      return <hr key={key} {...attrs} />;
    default:
      return null;
  }
}

function renderNode(n: PreparedNode, ctx: Ctx, key: string): React.ReactNode {
  const { node, def } = n;
  if (n.status === "core") return renderCore(n, ctx, key);
  if (n.status === "unknown") {
    return ctx.dev ? <BlockNotice key={key} type={node.type} blockId={node.id} title={ctx.t("unknownBlock", { type: node.type })} hint={ctx.t("unknownBlockHint")} /> : null;
  }
  if (n.status === "unrenderable" || !def?.component) {
    return ctx.dev ? (
      <BlockNotice key={key} type={node.type} blockId={node.id} title={ctx.t("invalidBlock", { type: node.type })} hint={def?.component ? ctx.t("invalidBlockHint", { count: n.replaced.length || 1 }) : undefined} />
    ) : null;
  }

  if (def.jsonLd) {
    const ld = def.jsonLd(n.props as never, { locale: ctx.locale, node });
    if (ld) ctx.jsonLd.push(...(Array.isArray(ld) ? ld : [ld]));
  }

  const Component = def.component as React.ComponentType<BlockComponentProps>;
  const slots = Object.fromEntries(Object.entries(n.slots).map(([k, list]) => [k, renderList(list, ctx, `${key}-${k}`)]));
  const element = (
    <Component
      {...n.props}
      id={node.id}
      variant={node.variant ?? def.defaultVariant ?? def.variants?.[0]}
      headingLevel={n.headingLevel}
      theme={node.theme}
      anchor={node.anchor}
      labels={ctx.opts.labels}
      locale={ctx.locale}
      components={ctx.opts.components}
      editMode={ctx.opts.editMode}
      slots={slots}
      block={{ id: node.id, type: node.type, mode: ctx.opts.editMode ? "edit" : "view", v: node.v ?? def.version }}
    />
  );
  const notice =
    ctx.dev && (n.status === "invalid" || n.status === "newer") ? (
      <BlockNotice
        tone="warning"
        type={node.type}
        title={n.status === "newer" ? ctx.t("newerBlock", { type: node.type, v: node.v ?? 1 }) : ctx.t("invalidBlock", { type: node.type })}
        hint={n.status === "invalid" ? ctx.t("invalidBlockHint", { count: n.replaced.length }) : undefined}
      />
    ) : null;
  // display:contents keeps the block's own layout while builders map clicks with closest("[data-block-id]").
  if (ctx.opts.editMode)
    return (
      <div key={key} style={{ display: "contents" }} {...editAttrs(ctx, n)}>
        {notice}
        {element}
      </div>
    );
  return notice ? (
    <React.Fragment key={key}>
      {notice}
      {element}
    </React.Fragment>
  ) : (
    <React.Fragment key={key}>{element}</React.Fragment>
  );
}

/** Renders a list; consecutive core text blocks share one prose wrapper. */
function renderList(list: readonly PreparedNode[], ctx: Ctx, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let run: PreparedNode[] = [];
  const flush = (i: number) => {
    if (!run.length) return;
    const items = run;
    run = [];
    out.push(
      <Container key={`${keyPrefix}-prose-${i}`} size="prose" className={cn("prose-ui vb-prose", ctx.opts.proseClassName)}>
        {items.map((n, j) => renderCore(n, ctx, `${keyPrefix}-${i}-${j}`))}
      </Container>,
    );
  };
  list.forEach((n, i) => {
    if (n.status === "core") {
      run.push(n);
      return;
    }
    flush(i);
    out.push(renderNode(n, ctx, `${keyPrefix}-${i}`));
  });
  flush(list.length);
  return out;
}

/** Renders an already prepared (and resolved) doc. */
export function renderPrepared(prepared: PreparedDoc, opts: RenderDocOptions): React.ReactNode {
  const ctx: Ctx = {
    opts,
    dev: opts.dev ?? (!!opts.editMode || !isProd()),
    t: blockText(opts.labels, prepared.locale),
    jsonLd: [],
    locale: prepared.locale,
  };
  const regions = opts.regions ?? ["header", "body", "footer", "overlay"];
  const parts = regions.map((r) => {
    const nodes = renderList(prepared[r], ctx, r);
    if (r === "body" && opts.mainId)
      return (
        <main key={r} id={opts.mainId} tabIndex={-1} className="outline-none">
          {nodes}
        </main>
      );
    return <React.Fragment key={r}>{nodes}</React.Fragment>;
  });
  const graph = opts.jsonLd === false ? null : mergeJsonLd(ctx.jsonLd);
  return (
    <>
      {parts}
      {graph ? <JsonLd data={graph} /> : null}
    </>
  );
}

/**
 * Synchronous render of a VamosDoc (RSC-safe, also works in client trees and tests).
 * `f.query` fields stay unresolved — use `<BlockRenderer resolvers>` for data-bound blocks.
 *
 * ```tsx
 * renderDoc(page, { registry: siteBlocks, locale: "tr", components: { Image: NextImage, Link: NextLink } });
 * ```
 */
export function renderDoc(doc: VamosDoc | unknown, opts: RenderDocOptions): React.ReactNode {
  return renderPrepared(prepareDoc(doc, opts), opts);
}

export interface BlockRendererProps extends RenderDocOptions {
  doc: VamosDoc | unknown;
  /** Data for `f.query` fields, fetched in parallel on the server. */
  resolvers?: Resolvers;
}

/**
 * Async Server Component: filters hidden/scheduled blocks → migrates → validates (salvaging bad
 * fields) → localizes → resolves queries in parallel → renders each block → merges JSON-LD.
 *
 * ```tsx
 * <BlockRenderer doc={page} registry={siteBlocks} locale="tr" fallbackLocales={["en"]}
 *   components={{ Image: NextImage, Link: NextLink }} resolvers={{ posts: (q) => db.posts.list(q) }} />
 * ```
 */
export async function BlockRenderer({ doc, resolvers, ...opts }: BlockRendererProps): Promise<React.ReactElement> {
  const prepared = await resolveDoc(prepareDoc(doc, opts), resolvers, opts.onIssue);
  return <>{renderPrepared(prepared, opts)}</>;
}
