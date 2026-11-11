"use client";

import * as React from "react";
import { Badge, Button, cn, IconButton, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Timeline, TimelineContent, TimelineIndicator, TimelineItem, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Check, Plus, X } from "lucide-react";

export type Shape = "circle" | "square" | "triangle";

export interface BoardSession {
  id: string;
  day: number;
  start: string;
  end: string;
  /** Formatted times ("10:30"). */
  startLabel: string;
  endLabel: string;
  /** `null` = for everyone (keynotes, breaks): shown under every track filter. */
  track: string | null;
  kind: "talk" | "keynote" | "workshop" | "break";
  title: string;
  speaker?: string;
  speakerRole?: string;
  room: string;
}

export interface BoardLabels {
  days: string[];
  daysLabel: string;
  tracksLabel: string;
  onlyMine: string;
  add: string;
  added: string;
  remove: string;
  agendaTitle: string;
  agendaEmpty: string;
  /** "{n} saved" */
  agendaCount: string;
  /** "Clashes with {title}" */
  clash: string;
  clear: string;
  noTrack: string;
  nothingSaved: string;
  everyone: string;
  keynote: string;
  /** "Added: {title}" / "Removed: {title}" */
  addedMsg: string;
  removedMsg: string;
}

const STORAGE_KEY = "interface-days-2027-agenda";
const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
const mins = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Track glyph: the conference's geometric language instead of colour coding. */
export function TrackShape({ shape, className }: { shape?: Shape; className?: string }) {
  if (!shape) return <span aria-hidden className={cn("inline-block size-2.5 shrink-0 rounded-full border border-fg", className)} />;
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 bg-fg", shape === "circle" && "rounded-full", shape === "triangle" && "[clip-path:polygon(50%_0,100%_100%,0_100%)]", className)}
    />
  );
}

/**
 * The signature of the Interface Days site: the full programme with a day switch (Tabs), a
 * track filter (ToggleGroup, multiple) and "Add to my agenda" on every session. The agenda is
 * local state saved in this browser, flags clashes and can be shown on its own.
 */
export function ScheduleBoard({ sessions, tracks, labels }: { sessions: BoardSession[]; tracks: { id: string; name: string; shape: Shape }[]; labels: BoardLabels }) {
  const [day, setDay] = React.useState("0");
  const [active, setActive] = React.useState<string[]>(tracks.map((t) => t.id));
  const [onlyMine, setOnlyMine] = React.useState(false);
  const [saved, setSaved] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const loaded = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(ids)) setSaved(ids.filter((x): x is string => typeof x === "string" && sessions.some((s) => s.id === x)));
    } catch {
      /* storage blocked: the agenda just doesn't persist */
    }
    loaded.current = true;
  }, [sessions]);

  React.useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [saved]);

  const byId = React.useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);
  const trackOf = React.useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);
  const savedSet = React.useMemo(() => new Set(saved), [saved]);

  /** For each saved session, the first other saved session it overlaps. */
  const clashes = React.useMemo(() => {
    const out = new Map<string, BoardSession>();
    const list = saved.map((id) => byId.get(id)).filter((s): s is BoardSession => !!s);
    for (const a of list)
      for (const b of list) {
        if (a.id === b.id || a.day !== b.day) continue;
        if (mins(a.start) < mins(b.end) && mins(b.start) < mins(a.end) && !out.has(a.id)) out.set(a.id, b);
      }
    return out;
  }, [saved, byId]);

  const toggle = (s: BoardSession) => {
    setSaved((prev) => {
      const has = prev.includes(s.id);
      setMessage(fill(has ? labels.removedMsg : labels.addedMsg, { title: s.title }));
      return has ? prev.filter((x) => x !== s.id) : [...prev, s.id];
    });
  };

  const visible = (s: BoardSession) => (s.track === null || active.includes(s.track)) && (!onlyMine || savedSet.has(s.id));
  const agenda = saved
    .map((id) => byId.get(id))
    .filter((s): s is BoardSession => !!s)
    .sort((a, b) => a.day - b.day || mins(a.start) - mins(b.start));
  const savedOnDay = (d: number) => agenda.filter((s) => s.day === d).length;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-14" data-schedule-board="">
      <p aria-live="polite" className="sr-only">
        {message}
      </p>
      <Tabs value={day} onValueChange={setDay} className="min-w-0 gap-6">
        <div className="flex flex-col gap-4 border-b-2 border-fg pb-4 xl:flex-row xl:items-center xl:justify-between">
          <TabsList aria-label={labels.daysLabel}>
            {labels.days.map((d, i) => (
              <TabsTrigger key={d} value={String(i)} count={savedOnDay(i) || undefined}>
                {d}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ToggleGroup type="multiple" aria-label={labels.tracksLabel} value={active} onValueChange={setActive} size="sm" variant="outline">
              {tracks.map((t) => (
                <ToggleGroupItem key={t.id} value={t.id} data-track={t.id}>
                  <TrackShape shape={t.shape} />
                  {t.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Switch size="sm" checked={onlyMine} onCheckedChange={setOnlyMine} label={labels.onlyMine} data-only-mine="" />
          </div>
        </div>

        {labels.days.map((_, d) => {
          const daySessions = sessions.filter((s) => s.day === d && visible(s));
          const slots = Array.from(new Set(daySessions.map((s) => s.start))).sort((a, b) => mins(a) - mins(b));
          return (
            <TabsContent key={d} value={String(d)} className="rounded-ui focus-ring">
              {active.length === 0 ? (
                <p className="m-0 border border-dashed border-line p-6 text-small text-fg-muted">{labels.noTrack}</p>
              ) : slots.length === 0 ? (
                <p className="m-0 border border-dashed border-line p-6 text-small text-fg-muted">{labels.nothingSaved}</p>
              ) : (
                <Timeline>
                  {slots.map((start) => {
                    const items = daySessions.filter((s) => s.start === start);
                    const anySaved = items.some((s) => savedSet.has(s.id));
                    const label = items[0]!.startLabel;
                    return (
                      <TimelineItem key={start}>
                        <TimelineIndicator tone={anySaved ? "accent" : "neutral"}>
                          <span aria-hidden className={cn("size-2", anySaved ? "rounded-full bg-accent" : "bg-fg-subtle")} />
                        </TimelineIndicator>
                        <TimelineContent className="min-w-0 pb-2">
                          <h3 className="m-0 font-display text-2xl leading-none font-bold tracking-[-0.04em] text-fg tabular">{label}</h3>
                          <ul className="m-0 mt-3 grid list-none gap-3 p-0 md:grid-cols-2 2xl:grid-cols-3">
                            {items.map((s) => (
                              <SessionCard key={s.id} s={s} track={s.track ? trackOf.get(s.track) : undefined} saved={savedSet.has(s.id)} clash={clashes.get(s.id)} labels={labels} onToggle={() => toggle(s)} />
                            ))}
                          </ul>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <aside aria-labelledby="ifd-agenda-title" className="border-2 border-fg bg-surface lg:sticky lg:top-[calc(var(--topbar-h)+1rem)]" data-agenda="">
        <div className="flex items-center justify-between gap-3 border-b-2 border-fg bg-accent px-4 py-3 text-accent-fg">
          <h2 id="ifd-agenda-title" className="m-0 font-display text-lg font-bold tracking-[-0.02em] uppercase">
            {labels.agendaTitle}
          </h2>
          <span className="font-mono text-xs font-semibold tabular" data-agenda-count={agenda.length}>
            {fill(labels.agendaCount, { n: agenda.length })}
          </span>
        </div>
        {agenda.length === 0 ? (
          <p className="m-0 px-4 py-5 text-small text-fg-muted">{labels.agendaEmpty}</p>
        ) : (
          <ol className="m-0 max-h-[60vh] list-none overflow-y-auto p-0">
            {agenda.map((s) => (
              <li key={s.id} className="grid grid-cols-[1fr_auto] items-start gap-2 border-b border-line px-4 py-3 last:border-b-0">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-fg-muted tabular">
                    {labels.days[s.day]} · {s.startLabel}–{s.endLabel}
                  </div>
                  <div className="mt-0.5 text-small leading-snug font-semibold text-fg">{s.title}</div>
                  {clashes.get(s.id) ? (
                    <Badge tone="warning" size="sm" className="mt-1.5 max-w-full whitespace-normal py-0.5 leading-tight">
                      {fill(labels.clash, { title: clashes.get(s.id)!.title })}
                    </Badge>
                  ) : null}
                </div>
                <IconButton size="xs" variant="ghost" label={`${labels.remove}: ${s.title}`} onClick={() => toggle(s)}>
                  <X />
                </IconButton>
              </li>
            ))}
          </ol>
        )}
        {agenda.length > 0 ? (
          <div className="border-t-2 border-fg px-4 py-2">
            <Button variant="ghost" size="xs" onClick={() => { setSaved([]); setMessage(labels.clear); }}>
              {labels.clear}
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function SessionCard({ s, track, saved, clash, labels, onToggle }: { s: BoardSession; track?: { name: string; shape: Shape }; saved: boolean; clash?: BoardSession; labels: BoardLabels; onToggle: () => void }) {
  if (s.kind === "break") {
    return (
      <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border border-dashed border-line px-4 py-3 md:col-span-full" data-session={s.id}>
        <span className="text-small font-semibold text-fg">{s.title}</span>
        <span className="font-mono text-[11px] text-fg-muted tabular">
          {s.startLabel}–{s.endLabel} · {s.room}
        </span>
      </li>
    );
  }
  return (
    <li
      data-session={s.id}
      data-saved={saved ? "" : undefined}
      className={cn(
        "relative flex flex-col border bg-surface p-4 transition-colors",
        s.kind === "keynote" && "md:col-span-full",
        saved ? "border-fg shadow-[inset_0_4px_0_var(--accent)]" : "border-line",
      )}
    >
      <div className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.06em] text-fg-muted uppercase">
        <span className="flex items-center gap-2">
          <TrackShape shape={track?.shape} />
          {s.kind === "keynote" ? labels.keynote : (track?.name ?? labels.everyone)}
        </span>
        <span className="truncate normal-case">{s.room}</span>
      </div>
      <h4 className={cn("m-0 mt-3 font-display leading-[1.1] font-bold tracking-[-0.025em] text-fg", s.kind === "keynote" ? "text-[clamp(1.35rem,1.1rem+1cqi,2rem)]" : "text-lg")}>{s.title}</h4>
      {s.speaker ? (
        <p className="m-0 mt-2 text-small text-fg-muted">
          <span className="font-semibold text-fg">{s.speaker}</span>
          {s.speakerRole ? ` · ${s.speakerRole}` : null}
        </p>
      ) : null}
      {saved && clash ? (
        <Badge tone="warning" size="sm" className="mt-3 self-start whitespace-normal py-0.5 leading-tight">
          {fill(labels.clash, { title: clash.title })}
        </Badge>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="font-mono text-xs text-fg-muted tabular">
          {s.startLabel}–{s.endLabel}
        </span>
        <Button size="sm" variant={saved ? "solid" : "secondary"} onClick={onToggle} data-add={s.id}>
          {saved ? <Check aria-hidden /> : <Plus aria-hidden />}
          {saved ? labels.added : labels.add}
          <span className="sr-only">: {s.title}</span>
        </Button>
      </div>
    </li>
  );
}
