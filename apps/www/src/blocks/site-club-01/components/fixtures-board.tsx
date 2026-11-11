"use client";

import * as React from "react";
import { Badge, cn, IconButton, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { CalendarPlus, Radio } from "lucide-react";
import { FormGuide, type Outcome } from "./form-guide";

export interface BoardMatch {
  id: string;
  team: string;
  comp: string;
  compName: string;
  compShort: string;
  round?: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** "Sat" */
  weekday: string;
  /** "14 Nov" */
  dayMonth: string;
  /** "2026-11" and "November 2026" for the month rows. */
  monthKey: string;
  monthLabel: string;
  /** "HH:mm" for the calendar file, `kickoffLabel` for display. */
  kickoff: string;
  kickoffLabel: string;
  home: boolean;
  opponent: string;
  ground: string;
  score?: [number, number];
  outcome?: Outcome;
  scorers?: string;
  tickets?: { label: string; tone: "accent" | "neutral" | "outline" | "success" };
  stream?: boolean;
}

export interface BoardLabels {
  caption: string;
  fixtures: string;
  results: string;
  team: string;
  competition: string;
  venue: string;
  all: string;
  home: string;
  away: string;
  homeShort: string;
  awayShort: string;
  date: string;
  comp: string;
  match: string;
  kickoff: string;
  score: string;
  /** "Add {match} to your calendar" */
  addToCalendar: string;
  stream: string;
  next: string;
  noMatches: string;
  /** "{n} matches shown" */
  shown: string;
  played: string;
  won: string;
  drawn: string;
  lost: string;
  goals: string;
  form: string;
  outcome: Record<Outcome, string>;
}

const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** Builds an .ics file for one fixture (Europe/Istanbul, two hours) and downloads it. */
function downloadIcs(m: BoardMatch, club: string, domain: string) {
  const stamp = m.date.replaceAll("-", "") + "T" + m.kickoff.replace(":", "") + "00";
  const end = (() => {
    const [h, min] = m.kickoff.split(":").map(Number);
    const total = (h ?? 0) * 60 + (min ?? 0) + 120;
    return m.date.replaceAll("-", "") + "T" + String(Math.floor(total / 60) % 24).padStart(2, "0") + String(total % 60).padStart(2, "0") + "00";
  })();
  const title = m.home ? `${club} v ${m.opponent}` : `${m.opponent} v ${club}`;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${club}//Fixtures//EN`,
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${m.id}-${m.date}@${domain}`,
    `DTSTAMP:${stamp}Z`,
    `DTSTART;TZID=Europe/Istanbul:${stamp}`,
    `DTEND;TZID=Europe/Istanbul:${end}`,
    `SUMMARY:${esc(title)} (${esc(m.compName)})`,
    `LOCATION:${esc(m.ground)}`,
    `URL:https://${domain}/fixtures`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${m.date}-${m.opponent.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The signature of the Harbor City FC site: every fixture and result of the season in one table.
 * Fixtures / Results tabs, a team switch, a competition filter and home/away. Results add a
 * record and a five-game form guide for the current filter; fixtures get "Add to calendar"
 * (a real .ics file) and the next game is marked.
 */
export function FixturesBoard({
  matches,
  teams,
  competitions,
  club,
  domain,
  labels,
  defaultTab = "fixtures",
}: {
  matches: BoardMatch[];
  teams: { id: string; name: string }[];
  competitions: { id: string; name: string }[];
  club: string;
  domain: string;
  labels: BoardLabels;
  defaultTab?: "fixtures" | "results";
}) {
  const [tab, setTab] = React.useState<string>(defaultTab);
  const [team, setTeam] = React.useState(teams[0]!.id);
  const [comps, setComps] = React.useState<string[]>(competitions.map((c) => c.id));
  const [venue, setVenue] = React.useState("all");

  const filtered = matches.filter((m) => m.team === team && comps.includes(m.comp) && (venue === "all" || (venue === "home") === m.home));
  const fixtures = filtered.filter((m) => !m.score).sort((a, b) => (a.date + a.kickoff).localeCompare(b.date + b.kickoff));
  const results = filtered.filter((m) => m.score).sort((a, b) => (b.date + b.kickoff).localeCompare(a.date + a.kickoff));
  const nextId = matches.filter((m) => m.team === team && !m.score).sort((a, b) => a.date.localeCompare(b.date))[0]?.id;

  const record = results.reduce(
    (acc, m) => {
      acc[m.outcome!] += 1;
      acc.gf += m.score![0];
      acc.ga += m.score![1];
      return acc;
    },
    { W: 0, D: 0, L: 0, gf: 0, ga: 0 },
  );
  const form = results.slice(0, 5).reverse();
  const shownCount = tab === "fixtures" ? fixtures.length : results.length;

  return (
    <div className="grid gap-6" data-fixtures-board="">
      <p aria-live="polite" className="sr-only" data-board-status="">
        {fill(labels.shown, { n: shownCount })}
      </p>

      <div className="grid gap-x-8 gap-y-4 border-y-2 border-fg py-4 lg:grid-cols-[auto_1fr_auto] lg:items-end">
        <FilterGroup label={labels.team}>
          <ToggleGroup aria-label={labels.team} value={team} onValueChange={(v) => v && setTeam(v)} size="sm" data-team-filter="">
            {teams.map((t) => (
              <ToggleGroupItem key={t.id} value={t.id}>
                {t.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterGroup>
        <FilterGroup label={labels.competition}>
          <ToggleGroup type="multiple" aria-label={labels.competition} value={comps} onValueChange={setComps} size="sm" variant="outline" data-comp-filter="">
            {competitions.map((c) => (
              <ToggleGroupItem key={c.id} value={c.id} data-comp={c.id}>
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterGroup>
        <FilterGroup label={labels.venue}>
          <ToggleGroup aria-label={labels.venue} value={venue} onValueChange={(v) => v && setVenue(v)} size="sm" data-venue-filter="">
            <ToggleGroupItem value="all">{labels.all}</ToggleGroupItem>
            <ToggleGroupItem value="home">{labels.home}</ToggleGroupItem>
            <ToggleGroupItem value="away">{labels.away}</ToggleGroupItem>
          </ToggleGroup>
        </FilterGroup>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="min-w-0 gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <TabsList aria-label={`${labels.fixtures} / ${labels.results}`}>
            <TabsTrigger value="fixtures" count={fixtures.length} data-tab="fixtures">
              {labels.fixtures}
            </TabsTrigger>
            <TabsTrigger value="results" count={results.length} data-tab="results">
              {labels.results}
            </TabsTrigger>
          </TabsList>
          {tab === "results" && results.length > 0 ? (
            <dl className="m-0 flex flex-wrap items-end gap-x-6 gap-y-3" data-record="">
              {[
                [labels.played, results.length],
                [labels.won, record.W],
                [labels.drawn, record.D],
                [labels.lost, record.L],
                [labels.goals, `${record.gf}–${record.ga}`],
              ].map(([k, v]) => (
                <div key={String(k)} className="grid">
                  <dt className="font-mono text-[10.5px] tracking-wide text-fg-muted">{k}</dt>
                  <dd className="m-0 font-display text-3xl leading-none text-fg tabular">{v}</dd>
                </div>
              ))}
              <div className="grid gap-1">
                <dt className="font-mono text-[10.5px] tracking-wide text-fg-muted">{labels.form}</dt>
                <dd className="m-0">
                  <FormGuide form={form.map((m) => m.outcome!)} labels={labels.outcome} />
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <TabsContent value="fixtures" className="rounded-ui focus-ring">
          <MatchTable kind="fixtures" rows={fixtures} nextId={nextId} club={club} domain={domain} labels={labels} />
        </TabsContent>
        <TabsContent value="results" className="rounded-ui focus-ring">
          <MatchTable kind="results" rows={results} club={club} domain={domain} labels={labels} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <span aria-hidden className="font-mono text-[10.5px] tracking-wide text-fg-muted">
        {label}
      </span>
      <div className="min-w-0 overflow-x-auto pb-0.5">{children}</div>
    </div>
  );
}

function MatchTable({ kind, rows, nextId, club, domain, labels }: { kind: "fixtures" | "results"; rows: BoardMatch[]; nextId?: string; club: string; domain: string; labels: BoardLabels }) {
  if (rows.length === 0) return <p className="m-0 border border-dashed border-line p-6 text-small text-fg-muted">{labels.noMatches}</p>;
  const months: { key: string; label: string; rows: BoardMatch[] }[] = [];
  for (const m of rows) {
    const last = months.at(-1);
    if (last?.key === m.monthKey) last.rows.push(m);
    else months.push({ key: m.monthKey, label: m.monthLabel, rows: [m] });
  }
  const cols = kind === "fixtures" ? 5 : 4;
  return (
    <TableContainer>
      <Table hover className="text-sm" data-kind={kind}>
        <TableCaption visuallyHidden>
          {labels.caption} — {kind === "fixtures" ? labels.fixtures : labels.results}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[5.5rem]">{labels.date}</TableHead>
            <TableHead className="hidden w-40 md:table-cell">{labels.comp}</TableHead>
            <TableHead>{labels.match}</TableHead>
            <TableHead align="end" className="w-24">
              {kind === "fixtures" ? labels.kickoff : labels.score}
            </TableHead>
            {kind === "fixtures" ? (
              <TableHead className="w-12">
                <span className="sr-only">{labels.addToCalendar.replace("{match}", "").trim()}</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        {months.map((month) => (
          <TableBody key={month.key}>
            <TableRow className="[&>th]:border-t-2 [&>th]:border-fg">
              <TableCell rowHeader colSpan={cols} className="h-auto bg-surface-2 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-fg-muted">
                {month.label}
              </TableCell>
            </TableRow>
            {month.rows.map((m) => {
              const title = m.home ? `${club} v ${m.opponent}` : `${m.opponent} v ${club}`;
              const isNext = m.id === nextId;
              return (
                <TableRow key={m.id} data-match={m.id} data-outcome={m.outcome} highlighted={isNext}>
                  <TableCell className="align-top">
                    <span className="block font-mono text-[11px] text-fg-muted">{m.weekday}</span>
                    <span className="block font-semibold whitespace-nowrap text-fg tabular">{m.dayMonth}</span>
                  </TableCell>
                  <TableCell className="hidden align-top md:table-cell">
                    <span className="block font-medium text-fg">{m.compName}</span>
                    {m.round ? <span className="block text-xs text-fg-muted">{m.round}</span> : null}
                  </TableCell>
                  <TableCell className="min-w-0 py-2.5 align-top">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        aria-label={m.home ? labels.home : labels.away}
                        className={cn(
                          "inline-grid size-5 shrink-0 place-items-center rounded-ui-sm font-mono text-[10px] font-bold",
                          m.home ? "bg-accent text-accent-fg" : "border border-fg text-fg",
                        )}
                      >
                        {m.home ? labels.homeShort : labels.awayShort}
                      </span>
                      <span className="font-display text-lg leading-tight text-fg">{m.opponent}</span>
                      {isNext ? (
                        <Badge tone="accent" size="sm" data-next="">
                          {labels.next}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-fg-muted">
                      <span className="md:hidden">{m.compShort} · </span>
                      {m.ground}
                      {m.scorers ? <span className="block text-fg">{m.scorers}</span> : null}
                    </span>
                    {m.tickets || m.stream ? (
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {m.tickets ? (
                          <Badge tone={m.tickets.tone} size="sm">
                            {m.tickets.label}
                          </Badge>
                        ) : null}
                        {m.stream ? (
                          <Badge tone="outline" size="sm">
                            <Radio aria-hidden />
                            {labels.stream}
                          </Badge>
                        ) : null}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell align="end" className="align-top">
                    {m.score ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="font-display text-2xl leading-none text-fg tabular">
                          {m.score[0]}–{m.score[1]}
                        </span>
                        <FormGuide form={[m.outcome!]} labels={labels.outcome} size="sm" />
                      </span>
                    ) : (
                      <span className="font-display text-2xl leading-none text-fg tabular">{m.kickoffLabel}</span>
                    )}
                  </TableCell>
                  {kind === "fixtures" ? (
                    <TableCell align="end" className="align-top">
                      <IconButton size="sm" variant="ghost" label={fill(labels.addToCalendar, { match: title })} onClick={() => downloadIcs(m, club, domain)} data-ics={m.id}>
                          <CalendarPlus />
                        </IconButton>
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
