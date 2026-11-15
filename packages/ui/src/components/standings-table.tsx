"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow, type TableProps } from "./table";

/* ------------------------------------------------------------------ */
/* FormGuide                                                           */
/* ------------------------------------------------------------------ */

export type FormOutcome = "win" | "draw" | "loss";

export const formGuideLabels = {
  win: "Win",
  draw: "Draw",
  loss: "Loss",
  winShort: "W",
  drawShort: "D",
  lossShort: "L",
  /** Accessible name of the whole strip. */
  form: "Form: {results}",
};
export type FormGuideLabels = typeof formGuideLabels;

export interface FormGuideProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Results, oldest first. */
  form: FormOutcome[];
  size?: "sm" | "md";
  labels?: Partial<FormGuideLabels>;
}

/**
 * Recent results as a strip of squares: win = accent, draw = outline, loss = ink. The letter is
 * visible and the strip has a spoken name ("Form: Win, Draw, Loss"), so colour is never the only signal.
 *
 * ```tsx
 * <FormGuide form={["win", "win", "draw", "loss", "win"]} />
 * ```
 */
export const FormGuide = /*#__PURE__*/ React.forwardRef<HTMLSpanElement, FormGuideProps>(function FormGuide({ form, size = "md", labels, className, ...props }, ref) {
  const t = useLabels("formGuide", formGuideLabels, labels);
  const f = useFormat();
  const names = form.map((o) => t(o));
  return (
    <span
      ref={ref}
      role="img"
      aria-label={t("form", { results: f.list(names, { type: "unit" }) })}
      data-slot="form-guide"
      className={cn("inline-flex gap-[3px]", className)}
      {...props}
    >
      {form.map((o, i) => (
        <span
          key={i}
          aria-hidden="true"
          data-outcome={o}
          className={cn(
            "inline-grid place-items-center rounded-[3px] font-mono leading-none font-bold",
            size === "sm" ? "size-[18px] text-[10px]" : "size-6 text-[11px]",
            o === "win" && "bg-accent text-accent-fg",
            o === "draw" && "border border-fg-muted bg-surface text-fg",
            o === "loss" && "bg-fg text-scene",
          )}
        >
          {t(`${o}Short` as "winShort")}
        </span>
      ))}
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* StandingsTable                                                      */
/* ------------------------------------------------------------------ */

export const standingsTableLabels = {
  position: "Position",
  positionShort: "#",
  side: "Team",
  played: "Played",
  playedShort: "P",
  won: "Won",
  wonShort: "W",
  drawn: "Drawn",
  drawnShort: "D",
  lost: "Lost",
  lostShort: "L",
  for: "For",
  forShort: "F",
  against: "Against",
  againstShort: "A",
  score: "Score",
  scoreShort: "F:A",
  difference: "Difference",
  differenceShort: "+/−",
  points: "Points",
  pointsShort: "Pts",
  form: "Last {count}",
  /** Spoken after the highlighted side's name. */
  current: "your team",
};
export type StandingsTableLabels = typeof standingsTableLabels;

export interface StandingRow {
  /** Stable key and the value `highlight` matches. Defaults to `side` when it is a string. */
  id?: string;
  /** Name of the team, player or entrant (row header). */
  side: React.ReactNode;
  /** Shown position. Default: the row's index + 1 (pass it for ties: 1, 2, 2, 4). */
  position?: number;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  /** Goals, points, maps or rounds scored. */
  for?: number;
  against?: number;
  /** Defaults to `won × pointsPerWin + drawn × pointsPerDraw`. */
  points?: number;
  /** Recent results, oldest first. */
  form?: FormOutcome[];
  /** Any extra values your custom columns read. */
  [key: string]: unknown;
}

export type StandingsColumnKey = "played" | "won" | "drawn" | "lost" | "for" | "against" | "score" | "difference" | "points";

export interface StandingsColumn {
  key: string;
  /** Full name (header tooltip and screen readers). */
  label: string;
  /** Short header text, e.g. "OT". Default: `label`. */
  short?: string;
  value: (row: StandingRow) => React.ReactNode;
  /** Hide on narrow screens. */
  hideBelow?: "sm" | "md" | "lg";
  numeric?: boolean;
}

export interface StandingsZone {
  /** Draw a rule under this position. */
  after: number;
  /** Explains the line in the legend under the table ("Promotion", "Play-offs"). */
  label: string;
  /** `"accent"` solid line (default) or `"muted"` dashed line. */
  tone?: "accent" | "muted";
}

export interface StandingsTableProps extends Omit<TableProps, "children"> {
  rows: StandingRow[];
  /** Names the table for screen readers (visually hidden). */
  caption: string;
  /** Columns between the side and the form guide. Built-in keys or your own definitions. */
  columns?: (StandingsColumnKey | StandingsColumn)[];
  /** `id` (or string `side`) of the row to emphasise — your own team or player. */
  highlight?: string;
  /** Show the form guide column. Default: when any row has `form`. */
  showForm?: boolean;
  /** Only the top N rows plus the highlighted row (with a gap rule when it is lower). */
  limit?: number;
  /** Lines under positions (promotion, play-offs, elimination) with a legend. */
  zones?: StandingsZone[];
  pointsPerWin?: number;
  pointsPerDraw?: number;
  labels?: Partial<StandingsTableLabels>;
  formLabels?: Partial<FormGuideLabels>;
}

const DEFAULT_COLUMNS: StandingsColumnKey[] = ["played", "won", "drawn", "lost", "difference", "points"];
const hide = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" } as const;
const rowKey = (r: StandingRow) => r.id ?? (typeof r.side === "string" ? r.side : undefined);

/**
 * A ranking table for any league or ladder — sports, esports, quiz nights, debating, sales
 * contests. Position, side, played / won / drawn / lost, score difference and points by default;
 * columns are configurable, your own side is highlighted (`aria-current`), zones draw
 * promotion or play-off lines, and `limit` shows the top of the table plus your row.
 *
 * ```tsx
 * <StandingsTable caption="North Division after round 11" rows={rows} highlight="harbour" zones={[{ after: 2, label: "Promotion" }]} />
 * ```
 */
export const StandingsTable = /*#__PURE__*/ React.forwardRef<HTMLTableElement, StandingsTableProps>(function StandingsTable(
  { rows, caption, columns = DEFAULT_COLUMNS, highlight, showForm, limit, zones, pointsPerWin = 3, pointsPerDraw = 1, labels, formLabels, className, ...props },
  ref,
) {
  const t = useLabels("standingsTable", standingsTableLabels, labels);
  const f = useFormat();
  const num = (v: unknown) => (typeof v === "number" ? f.number(v) : v == null ? "—" : (v as React.ReactNode));

  const builtIn: Record<StandingsColumnKey, StandingsColumn> = {
    played: { key: "played", label: t("played"), short: t("playedShort"), numeric: true, value: (r) => num(r.played) },
    won: { key: "won", label: t("won"), short: t("wonShort"), numeric: true, hideBelow: "sm", value: (r) => num(r.won) },
    drawn: { key: "drawn", label: t("drawn"), short: t("drawnShort"), numeric: true, hideBelow: "sm", value: (r) => num(r.drawn) },
    lost: { key: "lost", label: t("lost"), short: t("lostShort"), numeric: true, hideBelow: "sm", value: (r) => num(r.lost) },
    for: { key: "for", label: t("for"), short: t("forShort"), numeric: true, hideBelow: "md", value: (r) => num(r.for) },
    against: { key: "against", label: t("against"), short: t("againstShort"), numeric: true, hideBelow: "md", value: (r) => num(r.against) },
    score: { key: "score", label: t("score"), short: t("scoreShort"), numeric: true, hideBelow: "md", value: (r) => (r.for == null || r.against == null ? "—" : `${f.number(r.for)}:${f.number(r.against)}`) },
    difference: {
      key: "difference",
      label: t("difference"),
      short: t("differenceShort"),
      numeric: true,
      value: (r) => {
        if (r.for == null || r.against == null) return "—";
        const d = r.for - r.against;
        return d > 0 ? `+${f.number(d)}` : d < 0 ? `−${f.number(-d)}` : f.number(0);
      },
    },
    points: {
      key: "points",
      label: t("points"),
      short: t("pointsShort"),
      numeric: true,
      value: (r) => {
        const pts = r.points ?? (r.won != null ? r.won * pointsPerWin + (r.drawn ?? 0) * pointsPerDraw : undefined);
        return <span className="font-semibold text-fg">{num(pts)}</span>;
      },
    },
  };
  const cols = columns.map((c) => (typeof c === "string" ? builtIn[c] : c));
  const ranked = rows.map((r, i) => ({ row: r, pos: r.position ?? i + 1, index: i }));
  const isHighlighted = (r: StandingRow) => highlight != null && rowKey(r) === highlight;
  const shown = limit != null ? ranked.filter((x) => x.index < limit || isHighlighted(x.row)) : ranked;
  const formCount = Math.max(0, ...rows.map((r) => r.form?.length ?? 0));
  const withForm = showForm ?? formCount > 0;
  const zoneAt = new Map((zones ?? []).map((z) => [z.after, z]));

  return (
    <div className="grid min-w-0 gap-3" data-slot="standings-table">
      <TableContainer>
        <Table ref={ref} hover={false} className={cn("text-sm", className)} {...props}>
          <TableCaption visuallyHidden>{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead align="end" className="w-10" title={t("position")}>
                <span aria-hidden="true">{t("positionShort")}</span>
                <span className="sr-only">{t("position")}</span>
              </TableHead>
              <TableHead>{t("side")}</TableHead>
              {cols.map((c) => (
                <TableHead key={c.key} numeric={c.numeric} title={c.short && c.short !== c.label ? c.label : undefined} className={c.hideBelow ? hide[c.hideBelow] : undefined}>
                  {c.short && c.short !== c.label ? (
                    <>
                      <span aria-hidden="true">{c.short}</span>
                      <span className="sr-only">{c.label}</span>
                    </>
                  ) : (
                    c.label
                  )}
                </TableHead>
              ))}
              {withForm ? <TableHead className="hidden lg:table-cell">{t("form", { count: formCount })}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((x, i) => {
              const r = x.row;
              const me = isHighlighted(r);
              const gap = i > 0 && shown[i - 1]!.index !== x.index - 1;
              const zone = limit == null || x.index < limit - 1 ? zoneAt.get(x.pos) : undefined;
              return (
                <TableRow
                  key={rowKey(r) ?? x.index}
                  aria-current={me ? "true" : undefined}
                  data-highlighted={me ? "" : undefined}
                  data-zone={zone ? zone.tone ?? "accent" : undefined}
                  className={cn(
                    me && "bg-accent-soft [&>*]:font-semibold",
                    gap && "[&>*]:border-t-2 [&>*]:border-dashed [&>*]:border-t-line",
                    zone && (zone.tone === "muted" ? "[&>*]:border-b-2 [&>*]:border-dashed [&>*]:border-b-fg-muted" : "[&>*]:border-b-2 [&>*]:border-b-accent"),
                  )}
                >
                  <TableCell align="end" className="font-mono text-xs text-fg-muted tabular">
                    {f.number(x.pos)}
                  </TableCell>
                  <TableCell rowHeader className={cn("min-w-32", me ? "text-accent-ink" : "text-fg")}>
                    {r.side}
                    {me ? <span className="sr-only">{` (${t("current")})`}</span> : null}
                  </TableCell>
                  {cols.map((c) => (
                    <TableCell key={c.key} numeric={c.numeric} className={c.hideBelow ? hide[c.hideBelow] : undefined}>
                      {c.value(r)}
                    </TableCell>
                  ))}
                  {withForm ? (
                    <TableCell className="hidden lg:table-cell">{r.form?.length ? <FormGuide form={r.form} size="sm" labels={formLabels} /> : null}</TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {zones?.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small text-fg-muted" data-slot="standings-legend">
          {zones.map((z) => (
            <li key={z.after} className="flex items-center gap-2.5">
              <span aria-hidden="true" className={cn("w-7", z.tone === "muted" ? "border-t-2 border-dashed border-fg-muted" : "h-0.5 bg-accent")} />
              {z.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
