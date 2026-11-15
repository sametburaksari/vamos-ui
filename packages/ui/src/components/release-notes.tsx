"use client";

import * as React from "react";
import { Link2 } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Badge, type BadgeProps } from "./badge";
import { ToggleGroup, ToggleGroupItem } from "./toggle";

export const releaseNotesLabels = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  deprecated: "Deprecated",
  security: "Security",
  version: "Version {version}",
  anchor: "Link to version {version}",
  filter: "Show",
  shown: "{count, plural, one {# release shown} other {# releases shown}}",
  empty: "No changes match the filter.",
  readMore: "Read the {version} notes",
};
export type ReleaseNotesLabels = typeof releaseNotesLabels;

export type ReleaseChangeType = "added" | "changed" | "fixed" | "removed" | "deprecated" | "security" | (string & {});

export interface ReleaseChange {
  /** Key into `types` — the tag shown beside the change. */
  type: ReleaseChangeType;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface Release {
  /** "4.12.0" — shown as "v4.12.0" and used for the anchor. */
  version: string;
  /** `"YYYY-MM-DD"` or an ISO instant. */
  date: string;
  /** Headline of the release. */
  title?: React.ReactNode;
  summary?: React.ReactNode;
  changes: ReleaseChange[];
  /** Full notes page — adds a "Read the v… notes" link. */
  href?: string;
  /** Anchor id override. Default: `releaseAnchor(version)`. */
  id?: string;
}

export interface ReleaseChangeTypeDef {
  /** Tag text. Default: the `labels` entry with the same key, or the key itself. */
  label?: string;
  tone?: NonNullable<BadgeProps["tone"]>;
}

export const releaseChangeTypes: Record<string, ReleaseChangeTypeDef> = {
  added: { tone: "success" },
  changed: { tone: "info" },
  fixed: { tone: "accent" },
  removed: { tone: "danger" },
  deprecated: { tone: "warning" },
  security: { tone: "danger" },
};

/** Anchor id of a release: `"4.12.0"` → `"v4-12-0"`. */
export function releaseAnchor(version: string, prefix = "v"): string {
  return `${prefix}${version.trim().replace(/^v/i, "").replace(/[^\w-]+/g, "-")}`;
}

export interface ReleaseNotesProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Newest first. */
  releases: Release[];
  /** Change types (order = tag order and filter order). Merged over added / changed / fixed / removed / deprecated / security. */
  types?: Record<string, ReleaseChangeTypeDef>;
  /** `"none"` (default) one list with a tag per change; `"type"` a sub-heading per type (Keep a Changelog). */
  groupBy?: "none" | "type";
  /** Type filter above the list. Default `false`. */
  filter?: boolean;
  /** Types shown at first when `filter` is on. Default: all present. */
  defaultTypes?: string[];
  /** Release heading level. Default `2`. */
  headingLevel?: 2 | 3;
  /** Date format (preset or Intl options). Default `"long"`. */
  dateFormat?: Parameters<ReturnType<typeof useFormat>["date"]>[1];
  /** Prefix of the anchor ids. Default `"v"`. */
  anchorPrefix?: string;
  /** Show a "#" link per release. Default `true`. */
  anchors?: boolean;
  /** Keep the date / version rail beside each release while it scrolls (wide containers). Default `true`. */
  stickyRail?: boolean;
  /** CSS length for the sticky offset (under a fixed navbar). Default `"1rem"`. */
  stickyTop?: string;
  labels?: Partial<ReleaseNotesLabels>;
}

/**
 * A changelog: one entry per release with a date / version rail, change-type tags (added,
 * changed, fixed, removed …) and a linkable anchor per release. Optional type filter with a
 * polite count announcement.
 *
 * ```tsx
 * <ReleaseNotes releases={[
 *   { version: "2.4.0", date: "2026-11-04", title: "Saved views", changes: [
 *     { type: "added", title: "Save a filtered list as a view" },
 *     { type: "fixed", title: "Export kept the old column order" },
 *   ] },
 * ]} />
 * ```
 */
export const ReleaseNotes = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ReleaseNotesProps>(function ReleaseNotes(
  {
    releases,
    types: typesProp,
    groupBy = "none",
    filter = false,
    defaultTypes,
    headingLevel = 2,
    dateFormat = "long",
    anchorPrefix = "v",
    anchors = true,
    stickyRail = true,
    stickyTop = "1rem",
    labels,
    className,
    style,
    ...props
  },
  ref,
) {
  const t = useLabels("releaseNotes", releaseNotesLabels, labels);
  const f = useFormat();
  const uid = React.useId();
  const types = React.useMemo(() => ({ ...releaseChangeTypes, ...typesProp }), [typesProp]);
  const labelOf = (type: string) => types[type]?.label ?? (type in releaseNotesLabels ? t(type as keyof ReleaseNotesLabels) : type);

  // Types present, in `types` order, then unknown ones in order of appearance.
  const present = React.useMemo(() => {
    const seen = new Set(releases.flatMap((r) => r.changes.map((c) => c.type)));
    return [...Object.keys(types).filter((k) => seen.has(k)), ...[...seen].filter((k) => !(k in types))];
  }, [releases, types]);
  const counts = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of releases) for (const c of r.changes) out[c.type] = (out[c.type] ?? 0) + 1;
    return out;
  }, [releases]);

  const [shownTypes, setShownTypes] = React.useState<string[]>(() => defaultTypes ?? present);
  const visible = filter ? releases.map((r) => ({ ...r, changes: r.changes.filter((c) => shownTypes.includes(c.type)) })).filter((r) => r.changes.length > 0) : releases;

  const H = `h${headingLevel}` as "h2";
  const Sub = `h${headingLevel + 1}` as "h3";

  const changeList = (changes: ReleaseChange[], tagged: boolean) => (
    <ul className="m-0 grid list-none gap-3 p-0">
      {changes.map((c, i) => (
        <li key={i} data-type={c.type} className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {tagged ? (
              <Badge tone={types[c.type]?.tone ?? "outline"} size="sm" shape="square" className="shrink-0 translate-y-[-1px]">
                {labelOf(c.type)}
              </Badge>
            ) : null}
            <span className="min-w-0 font-medium text-fg">{c.title}</span>
          </div>
          {c.description ? <div className="mt-1 text-sm leading-relaxed text-fg-muted">{c.description}</div> : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={ref}
      data-slot="release-notes"
      className={cn("@container/release-notes min-w-0", className)}
      style={{ "--release-notes-top": stickyTop, ...style } as React.CSSProperties}
      {...props}
    >
      {filter && present.length > 1 ? (
        <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-4">
          <span id={`${uid}-filter`} className="text-xs font-medium text-fg-muted">
            {t("filter")}
          </span>
          <ToggleGroup type="multiple" variant="outline" size="sm" aria-labelledby={`${uid}-filter`} value={shownTypes} onValueChange={setShownTypes} className="max-w-full flex-wrap">
            {present.map((k) => (
              <ToggleGroupItem key={k} value={k} className="gap-1.5">
                {labelOf(k)}
                <span className="text-[11px] text-fg-subtle tabular">{f.number(counts[k] ?? 0)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="sr-only" aria-live="polite">
            {t("shown", { count: visible.length })}
          </span>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="m-0 rounded-ui-lg border border-dashed border-line px-5 py-8 text-center text-sm text-fg-muted">{t("empty")}</p>
      ) : (
        <ol className="m-0 list-none p-0">
          {visible.map((r) => {
            const id = r.id ?? releaseAnchor(r.version, anchorPrefix);
            const v = `v${r.version.replace(/^v/i, "")}`;
            const headingId = `${id}-title`;
            return (
              <li key={r.version} id={id} data-version={r.version} className="grid scroll-mt-(--release-notes-top) gap-x-10 gap-y-4 border-b border-line py-8 last:border-b-0 @2xl/release-notes:grid-cols-[9rem_minmax(0,1fr)]">
                <div className="@2xl/release-notes:relative">
                  <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1 @2xl/release-notes:flex-col @2xl/release-notes:items-start", stickyRail && "@2xl/release-notes:sticky @2xl/release-notes:top-(--release-notes-top)")}>
                    <time dateTime={r.date} className="text-sm font-medium text-fg tabular">
                      {f.date(r.date, dateFormat)}
                    </time>
                    <span className="font-mono text-xs text-accent-ink">
                      <span className="sr-only">{t("version", { version: r.version })}</span>
                      <span aria-hidden="true">{v}</span>
                    </span>
                  </div>
                </div>
                <article aria-labelledby={headingId} className="min-w-0">
                  <div className="group/heading flex items-baseline gap-2">
                    <H id={headingId} className="m-0 text-lg leading-snug font-semibold text-fg">
                      {r.title ?? v}
                      {r.title ? <span className="sr-only">{`, ${v}`}</span> : null}
                    </H>
                    {anchors ? (
                      <a
                        href={`#${id}`}
                        aria-label={t("anchor", { version: r.version })}
                        className="inline-grid size-6 shrink-0 place-items-center rounded-ui-sm text-fg-subtle opacity-60 transition-opacity hover:text-fg hover:opacity-100 focus-ring group-hover/heading:opacity-100 motion-reduce:transition-none [&_svg]:size-3.5"
                      >
                        <Link2 aria-hidden />
                      </a>
                    ) : null}
                  </div>
                  {r.summary ? <div className="mt-2 text-[15px] leading-relaxed text-fg-muted">{r.summary}</div> : null}
                  <div className="mt-5">
                    {groupBy === "type" ? (
                      <div className="grid gap-5">
                        {present
                          .filter((k) => r.changes.some((c) => c.type === k))
                          .map((k) => (
                            <section key={k} aria-labelledby={`${id}-${k}`}>
                              <Sub id={`${id}-${k}`} className="m-0 mb-2 flex items-center gap-2 text-sm font-semibold text-fg">
                                <Badge tone={types[k]?.tone ?? "outline"} size="sm" shape="square">
                                  {labelOf(k)}
                                </Badge>
                              </Sub>
                              {changeList(
                                r.changes.filter((c) => c.type === k),
                                false,
                              )}
                            </section>
                          ))}
                      </div>
                    ) : (
                      changeList(r.changes, true)
                    )}
                  </div>
                  {r.href ? (
                    <a href={r.href} className="mt-5 inline-block text-sm font-medium text-accent-ink underline-offset-4 hover:underline focus-ring">
                      {t("readMore", { version: v })}
                    </a>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
});
