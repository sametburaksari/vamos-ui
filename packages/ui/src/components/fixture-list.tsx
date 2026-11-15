"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Badge } from "./badge";
import { Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "./table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { ToggleGroup, ToggleGroupItem } from "./toggle";
import { FormGuide, type FormGuideLabels, type FormOutcome } from "./standings-table";

export const fixtureListLabels = {
  upcoming: "Upcoming",
  results: "Results",
  views: "Upcoming and results",
  competition: "Competition",
  venue: "Venue",
  all: "All",
  home: "Home",
  away: "Away",
  homeShort: "H",
  awayShort: "A",
  date: "Date",
  match: "Match",
  time: "Time",
  score: "Score",
  versus: "v",
  /** Spoken score: "Northgate 2, Riverside 1". */
  scoreSpoken: "{home} {homeScore}, {away} {awayScore}",
  timeTbc: "TBC",
  next: "Next",
  live: "Live",
  postponed: "Postponed",
  cancelled: "Cancelled",
  empty: "No matches for this filter.",
  shown: "{count, plural, one {# match shown} other {# matches shown}}",
  actions: "Actions",
};
export type FixtureListLabels = typeof fixtureListLabels;

type DateLike = string | number | Date;

export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";

export interface Fixture {
  id: string;
  /** Start as an instant, or a `"YYYY-MM-DD"` date when the time is not fixed yet (shows "TBC"). */
  start: DateLike;
  home: string;
  away: string;
  /** `[home, away]`. A score without a status counts as finished. */
  score?: [number, number] | null;
  /** Default: `"finished"` with a score, otherwise `"scheduled"`. */
  status?: FixtureStatus;
  /** Matches `competitions[].id`. */
  competition?: string;
  /** "Round 12", "Semi-final". */
  round?: string;
  venue?: string;
  /** Secondary line under the match: scorers, broadcast, a ticket note. */
  details?: React.ReactNode;
  /** Small badges next to the match ("Sold out", "Streamed"). */
  tags?: React.ReactNode;
  /** Makes the match name a link (match report, preview). */
  href?: string;
}

export interface FixtureCompetition {
  id: string;
  label: string;
  /** Short form shown on phones where the competition column is hidden. */
  short?: string;
}

export type FixtureView = "upcoming" | "results";

export interface FixtureListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  fixtures: Fixture[];
  /** Enables the competition filter (shown with two or more). */
  competitions?: FixtureCompetition[];
  /**
   * Your own side (team, player, debating society). Enables the home/away filter, H/A tags,
   * the outcome square on results and marks the next match.
   */
  side?: string;
  view?: FixtureView;
  defaultView?: FixtureView;
  onViewChange?: (view: FixtureView) => void;
  /** Month rows between groups. Default `true`. */
  groupByMonth?: boolean;
  /** Show the filter bar. Default `true`. */
  filters?: boolean;
  /** Trailing cell per match — "Add to calendar", "Tickets". */
  renderActions?: (fixture: Fixture) => React.ReactNode;
  /** Names the tables for screen readers. */
  caption?: string;
  labels?: Partial<FixtureListLabels>;
  formLabels?: Partial<FormGuideLabels>;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const toMs = (v: DateLike) => (v instanceof Date ? v.getTime() : typeof v === "number" ? v : Date.parse(v));
const statusOf = (m: Fixture): FixtureStatus => m.status ?? (m.score ? "finished" : "scheduled");
const isResult = (m: Fixture) => statusOf(m) === "finished";

/** FormOutcome from `side`'s point of view, or `undefined` when the side did not play or there is no score. */
export function fixtureOutcome(m: Fixture, side: string): FormOutcome | undefined {
  if (!m.score || (m.home !== side && m.away !== side)) return undefined;
  const [h, a] = m.score;
  const mine = m.home === side ? h : a;
  const theirs = m.home === side ? a : h;
  return mine > theirs ? "win" : mine === theirs ? "draw" : "loss";
}

/**
 * Upcoming matches and results between two sides — any head-to-head competition: sports,
 * esports, chess, debating. Upcoming / Results tabs with counts, an optional competition and
 * home/away filter, month rows, the next match marked, and scores read as sentences. Dates and
 * times come from the locale formatter (and its time zone).
 *
 * ```tsx
 * <FixtureList side="Northgate" fixtures={matches} competitions={[{ id: "league", label: "League" }, { id: "cup", label: "Cup" }]} />
 * ```
 */
export const FixtureList = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FixtureListProps>(function FixtureList(
  { fixtures, competitions = [], side, view: viewProp, defaultView = "upcoming", onViewChange, groupByMonth = true, filters = true, renderActions, caption, labels, formLabels, className, ...props },
  ref,
) {
  const t = useLabels("fixtureList", fixtureListLabels, labels);
  const [innerView, setInnerView] = React.useState<FixtureView>(defaultView);
  const view = viewProp ?? innerView;
  const setView = (v: string) => {
    if (viewProp === undefined) setInnerView(v as FixtureView);
    onViewChange?.(v as FixtureView);
  };
  const [comps, setComps] = React.useState<string[]>(() => competitions.map((c) => c.id));
  const compKey = competitions.map((c) => c.id).join("|");
  React.useEffect(() => setComps(competitions.map((c) => c.id)), [compKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [venue, setVenue] = React.useState<"all" | "home" | "away">("all");

  const showComp = filters && competitions.length > 1;
  const showVenue = filters && side != null;
  const filtered = fixtures.filter(
    (m) =>
      (!showComp || m.competition == null || comps.includes(m.competition)) &&
      (!showVenue || venue === "all" || (venue === "home" ? m.home === side : m.away === side)),
  );
  const upcoming = filtered.filter((m) => !isResult(m)).sort((a, b) => toMs(a.start) - toMs(b.start));
  const results = filtered.filter(isResult).sort((a, b) => toMs(b.start) - toMs(a.start));
  const nextId = side != null ? upcoming.find((m) => statusOf(m) === "scheduled" || statusOf(m) === "live")?.id : undefined;
  const count = view === "upcoming" ? upcoming.length : results.length;
  const compById = new Map(competitions.map((c) => [c.id, c]));

  return (
    <div ref={ref} data-slot="fixture-list" className={cn("grid min-w-0 gap-5", className)} {...props}>
      <p aria-live="polite" className="sr-only">
        {t("shown", { count })}
      </p>
      {showComp || showVenue ? (
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4" data-slot="fixture-filters">
          {showComp ? (
            <FilterGroup label={t("competition")}>
              <ToggleGroup type="multiple" variant="outline" size="sm" aria-label={t("competition")} value={comps} onValueChange={setComps}>
                {competitions.map((c) => (
                  <ToggleGroupItem key={c.id} value={c.id}>
                    {c.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FilterGroup>
          ) : null}
          {showVenue ? (
            <FilterGroup label={t("venue")}>
              <ToggleGroup size="sm" aria-label={t("venue")} value={venue} onValueChange={(v) => setVenue(v as typeof venue)}>
                <ToggleGroupItem value="all">{t("all")}</ToggleGroupItem>
                <ToggleGroupItem value="home">{t("home")}</ToggleGroupItem>
                <ToggleGroupItem value="away">{t("away")}</ToggleGroupItem>
              </ToggleGroup>
            </FilterGroup>
          ) : null}
        </div>
      ) : null}

      <Tabs value={view} onValueChange={setView} className="min-w-0">
        <TabsList aria-label={t("views")}>
          <TabsTrigger value="upcoming" count={upcoming.length}>
            {t("upcoming")}
          </TabsTrigger>
          <TabsTrigger value="results" count={results.length}>
            {t("results")}
          </TabsTrigger>
        </TabsList>
        {(["upcoming", "results"] as const).map((kind) => (
          <TabsContent key={kind} value={kind} className="rounded-ui focus-ring">
            <MatchTable
              kind={kind}
              rows={kind === "upcoming" ? upcoming : results}
              nextId={nextId}
              side={side}
              compById={compById}
              groupByMonth={groupByMonth}
              renderActions={renderActions}
              caption={caption}
              t={t}
              formLabels={formLabels}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
});

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <span aria-hidden="true" className="text-xs text-fg-muted">
        {label}
      </span>
      <div className="min-w-0 overflow-x-auto pb-0.5">{children}</div>
    </div>
  );
}

function MatchTable({
  kind,
  rows,
  nextId,
  side,
  compById,
  groupByMonth,
  renderActions,
  caption,
  t,
  formLabels,
}: {
  kind: FixtureView;
  rows: Fixture[];
  nextId?: string;
  side?: string;
  compById: Map<string, FixtureCompetition>;
  groupByMonth: boolean;
  renderActions?: (m: Fixture) => React.ReactNode;
  caption?: string;
  t: LabelFn<FixtureListLabels>;
  formLabels?: Partial<FormGuideLabels>;
}) {
  const f = useFormat();
  if (rows.length === 0) return <p className="m-0 rounded-ui border border-dashed border-line p-6 text-small text-fg-muted">{t("empty")}</p>;
  const hasComp = rows.some((m) => m.competition != null && compById.has(m.competition));
  const groups: { label: string; rows: Fixture[] }[] = [];
  for (const m of rows) {
    const label = groupByMonth ? f.date(m.start, { month: "long", year: "numeric" }) : "";
    const last = groups.at(-1);
    if (last && last.label === label) last.rows.push(m);
    else groups.push({ label, rows: [m] });
  }
  const cols = 3 + (hasComp ? 1 : 0) + (renderActions ? 1 : 0);
  const tag = { live: "danger", postponed: "warning", cancelled: "outline" } as const;

  return (
    <TableContainer>
      <Table className="text-sm" data-kind={kind}>
        <TableCaption visuallyHidden>{[caption, t(kind)].filter(Boolean).join(" — ")}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">{t("date")}</TableHead>
            {hasComp ? <TableHead className="hidden w-40 md:table-cell">{t("competition")}</TableHead> : null}
            <TableHead>{t("match")}</TableHead>
            <TableHead align="end" className="w-24">
              {kind === "upcoming" ? t("time") : t("score")}
            </TableHead>
            {renderActions ? (
              <TableHead className="w-12">
                <span className="sr-only">{t("actions")}</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        {groups.map((g, gi) => (
          <TableBody key={`${g.label}-${gi}`}>
            {groupByMonth ? (
              <TableRow>
                <TableCell rowHeader colSpan={cols} className="h-auto bg-surface-2 py-1.5 text-xs font-semibold text-fg-muted">
                  {g.label}
                </TableCell>
              </TableRow>
            ) : null}
            {g.rows.map((m) => {
              const status = statusOf(m);
              const dateOnly = typeof m.start === "string" && DATE_ONLY.test(m.start);
              const comp = m.competition != null ? compById.get(m.competition) : undefined;
              const isNext = m.id === nextId;
              const outcome = side != null ? fixtureOutcome(m, side) : undefined;
              const own = side != null && (m.home === side || m.away === side);
              const name = (
                <>
                  <span className={cn(m.home === side && "font-semibold")}>{m.home}</span>
                  {" "}
                  <span className="text-fg-muted">{t("versus")}</span>{" "}
                  <span className={cn(m.away === side && "font-semibold")}>{m.away}</span>
                </>
              );
              return (
                <TableRow key={m.id} data-fixture={m.id} data-status={status} data-outcome={outcome} highlighted={isNext}>
                  <TableCell className="align-top">
                    <span className="block text-xs text-fg-muted">{f.date(m.start, { weekday: "short" })}</span>
                    <span className="block font-semibold whitespace-nowrap text-fg tabular">{f.date(m.start, { day: "numeric", month: "short" })}</span>
                  </TableCell>
                  {hasComp ? (
                    <TableCell className="hidden align-top md:table-cell">
                      <span className="block font-medium text-fg">{comp?.label}</span>
                      {m.round ? <span className="block text-xs text-fg-muted">{m.round}</span> : null}
                    </TableCell>
                  ) : null}
                  <TableCell className="min-w-0 py-2.5 align-top">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {own ? (
                        <span
                          aria-label={m.home === side ? t("home") : t("away")}
                          role="img"
                          className={cn(
                            "inline-grid size-5 shrink-0 place-items-center rounded-ui-sm font-mono text-[10px] font-bold",
                            m.home === side ? "bg-accent text-accent-fg" : "border border-fg text-fg",
                          )}
                        >
                          <span aria-hidden="true">{m.home === side ? t("homeShort") : t("awayShort")}</span>
                        </span>
                      ) : null}
                      <span className="text-base leading-tight text-fg">
                        {m.href ? (
                          <a href={m.href} className="rounded-ui-sm underline-offset-[0.2em] hover:underline focus-ring">
                            {name}
                          </a>
                        ) : (
                          name
                        )}
                      </span>
                      {isNext ? (
                        <Badge tone="accent" size="sm">
                          {t("next")}
                        </Badge>
                      ) : null}
                      {status === "live" || status === "postponed" || status === "cancelled" ? (
                        <Badge tone={tag[status]} size="sm">
                          {t(status)}
                        </Badge>
                      ) : null}
                      {m.tags}
                    </span>
                    {comp || m.venue || m.details ? (
                      <span className="mt-0.5 block text-xs text-fg-muted">
                        {comp ? <span className="md:hidden">{(comp.short ?? comp.label) + (m.venue ? " · " : "")}</span> : null}
                        {m.venue}
                        {m.details ? <span className="block text-fg">{m.details}</span> : null}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell align="end" className="align-top">
                    {m.score ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xl leading-none font-semibold text-fg tabular" aria-hidden="true">
                          {f.number(m.score[0])}–{f.number(m.score[1])}
                        </span>
                        <span className="sr-only">{t("scoreSpoken", { home: m.home, away: m.away, homeScore: f.number(m.score[0]), awayScore: f.number(m.score[1]) })}</span>
                        {outcome ? <FormGuide form={[outcome]} size="sm" labels={{ ...formLabels, form: "{results}" }} /> : null}
                      </span>
                    ) : (
                      <span className={cn("text-xl leading-none font-semibold tabular", status === "cancelled" ? "text-fg-muted line-through" : "text-fg")}>
                        {dateOnly ? t("timeTbc") : f.time(m.start)}
                      </span>
                    )}
                  </TableCell>
                  {renderActions ? (
                    <TableCell align="end" className="align-top">
                      {renderActions(m)}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        ))}
      </Table>
    </TableContainer>
  );
}
