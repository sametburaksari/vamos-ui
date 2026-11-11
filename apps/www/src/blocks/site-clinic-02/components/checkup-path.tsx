"use client";

import * as React from "react";
import { addIsoDays, Badge, Button, cn, DatePicker, Field, Input, isoDiffDays, todayIso } from "@vamos-ui/react";
import { Container, Section, SectionHeader } from "@vamos-ui/react/blocks";
import { ArrowRight, Check, Syringe } from "lucide-react";
import { Reveal } from "@vamos-ui/react/motion";
import { addMonthsIso, fill, ink, longDate, stops, type Stop } from "./content";
import { KiteMark } from "./illustrations";
import { useVisit } from "./visit-provider";

const c = {
  eyebrow: { en: "The check-up path", tr: "Kontrol yolu" },
  title: { en: "Where is your child on the *path*?", tr: "Çocuğunuz *yolun* neresinde?" },
  lead: { en: "Fourteen check-ups from two weeks to twelve years. Add a birth date and the path shows what is done, what is due and when the next one falls.", tr: "İki haftalıktan on iki yaşa kadar on dört kontrol. Doğum tarihini girin; yol neyin yapıldığını, neyin zamanının geldiğini ve bir sonrakinin ne zaman olduğunu göstersin." },
  name: { en: "Child’s first name", tr: "Çocuğun adı" },
  dob: { en: "Date of birth", tr: "Doğum tarihi" },
  example: { en: "Try a 7-month-old", tr: "7 aylık bir bebekle deneyin" },
  board: { en: "Check-ups from two weeks to twelve years", tr: "İki haftadan on iki yaşa kontroller" },
  empty: { en: "Add a date of birth to see where {name} is on the path.", tr: "{name} yolun neresinde, görmek için doğum tarihini girin." },
  yourChild: { en: "your child", tr: "çocuğunuz" },
  done: { en: "Done", tr: "Geçti" },
  dueNow: { en: "Due now", tr: "Zamanı geldi" },
  next: { en: "Next", tr: "Sıradaki" },
  later: { en: "Later", tr: "Sonra" },
  due: { en: "Due {date}", tr: "Tarihi: {date}" },
  wasDue: { en: "Was due {date}", tr: "{date} tarihindeydi" },
  here: { en: "{name}’s next stop", tr: "{name} için sıradaki durak" },
  vaccine: { en: "Usually a vaccine visit too", tr: "Genelde aşı ziyareti de" },
  book: { en: "Book the {label} check-up", tr: "{label} kontrolünü randevuya çevir" },
  bookAny: { en: "Book a check-up", tr: "Kontrol randevusu al" },
  pastNote: { en: "Missed it? No problem — we fold it into the next visit.", tr: "Kaçırdınız mı? Sorun değil — bir sonraki ziyarete ekleriz." },
  stopLabel: { en: "{label}, {state}", tr: "{label}, {state}" },
};

type State = "done" | "now" | "next" | "later" | "none";

const ROW = 128;

/** Columns that fit the measured board width (4 on phones, 7 on wide screens). */
function useColumns(ref: React.RefObject<HTMLElement | null>) {
  const [cols, setCols] = React.useState(7);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect.width ?? 0;
      setCols(w >= 860 ? 7 : w >= 560 ? 5 : 4);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return cols;
}

/** Centre of stop i in board units (100 per column, ROW per row), snaking row by row. */
function centre(i: number, cols: number) {
  const row = Math.floor(i / cols);
  const k = i % cols;
  const col = row % 2 === 0 ? k : cols - 1 - k;
  return { x: col * 100 + 50, y: row * ROW + ROW / 2, row, col };
}

function roadPath(n: number, cols: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = centre(i, cols);
    if (i === 0) {
      d += `M${p.x - 40} ${p.y} L${p.x} ${p.y}`;
      continue;
    }
    const prev = centre(i - 1, cols);
    if (prev.row === p.row) d += ` L${p.x} ${p.y}`;
    else {
      const out = prev.col === cols - 1 ? 46 : -46;
      d += ` C${prev.x + out} ${prev.y} ${p.x + out} ${p.y} ${p.x} ${p.y}`;
    }
  }
  const last = centre(n - 1, cols);
  const dir = last.row % 2 === 0 ? 1 : -1;
  return `${d} L${last.x + dir * 40} ${last.y}`;
}

/**
 * Signature: the check-up path. A board-game road of the fourteen well-child visits; a birth date
 * marks each stop done / due now / next / later with real dates, a kite sits on the child's next
 * stop, and the detail card books that exact check-up (pre-filled on the booking page).
 */
export function CheckupPath() {
  const { locale, t, draft, update, start } = useVisit();
  const boardRef = React.useRef<HTMLDivElement>(null);
  const cols = useColumns(boardRef);
  const [today, setToday] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  React.useEffect(() => setToday(todayIso("Europe/Istanbul")), []);

  const dob = draft.dob;
  const rows = Math.ceil(stops.length / cols);
  const childName = draft.childName.trim() || t(c.yourChild);

  const states = React.useMemo(() => {
    const out = new Map<string, { state: State; due: string | null }>();
    if (!dob || !today) {
      stops.forEach((s) => out.set(s.id, { state: "none", due: null }));
      return out;
    }
    let nextFound = false;
    for (const s of stops) {
      const due = addMonthsIso(dob, s.months);
      const diff = isoDiffDays(today, due);
      let state: State;
      if (diff < -21) state = "done";
      else if (diff <= 21 && !nextFound) state = "now";
      else if (!nextFound) state = "next";
      else state = "later";
      if (state === "now" || state === "next") nextFound = true;
      out.set(s.id, { state, due });
    }
    return out;
  }, [dob, today]);

  const current = stops.find((s) => {
    const st = states.get(s.id)?.state;
    return st === "now" || st === "next";
  });
  const shown: Stop = stops.find((s) => s.id === selected) ?? current ?? stops[0]!;
  const shownState = states.get(shown.id)!;
  const stateText = (s: State) => (s === "done" ? t(c.done) : s === "now" ? t(c.dueNow) : s === "next" ? t(c.next) : s === "later" ? t(c.later) : "");

  const book = (s: Stop) => {
    const st = states.get(s.id);
    let day: string | null = null;
    if (today && st?.due) {
      const d = isoDiffDays(today, st.due);
      if (d >= 1 && d <= 56) day = st.due;
      else if (d < 1 && d > -21) day = addIsoDays(today, 1);
    }
    start({ reason: "checkup", stop: s.id, day });
  };

  return (
    <Section anchor="path" aria-labelledby="pk-path-title" className="overflow-hidden">
      <Container>
        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @4xl:items-end">
          <SectionHeader headingId="pk-path-title" eyebrow={t(c.eyebrow)} title={t(c.title)} lead={t(c.lead)} />
          <div className="grid gap-4 rounded-ui-lg border border-line bg-surface p-5 @2xl:grid-cols-2 @2xl:items-start">
            <Field label={t(c.name)} optional>
              <Input value={draft.childName} onChange={(e) => update({ childName: e.target.value })} autoComplete="off" placeholder={locale === "tr" ? "Ada" : "Ada"} maxLength={24} />
            </Field>
            <Field label={t(c.dob)}>
              <DatePicker value={dob} onValueChange={(v) => { update({ dob: v }); setSelected(null); }} max={today ?? undefined} min={today ? addMonthsIso(today, -12 * 13) : undefined} />
            </Field>
            <button
              type="button"
              className="justify-self-start text-small font-medium text-accent-ink underline decoration-accent/40 underline-offset-4 hover:decoration-current focus-ring rounded-[2px] @2xl:col-span-2"
              onClick={() => {
                if (!today) return;
                update({ dob: addMonthsIso(today, -7), childName: draft.childName || "Ada" });
                setSelected(null);
              }}
            >
              {t(c.example)}
            </button>
          </div>
        </div>

        <Reveal effect="fade" duration={1400} className="pk-board mt-12 rounded-[calc(var(--radius)*2.4)] border border-line p-3 @2xl:p-6" style={{ background: ink.mint }}>
          <div ref={boardRef} className="relative" style={{ height: rows * ROW }}>
            <svg viewBox={`0 0 ${cols * 100} ${rows * ROW}`} preserveAspectRatio="none" className="pk-road absolute inset-0 size-full overflow-visible" aria-hidden focusable="false">
              <path d={roadPath(stops.length, cols)} fill="none" stroke={ink.line} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <path d={roadPath(stops.length, cols)} fill="none" stroke={ink.sand} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <path d={roadPath(stops.length, cols)} fill="none" stroke={ink.line} strokeWidth={2} strokeDasharray="3 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.5} />
            </svg>
            <ol aria-label={t(c.board)} className="contents">
              {stops.map((s, i) => {
                const p = centre(i, cols);
                const st = states.get(s.id)!;
                const isShown = s.id === shown.id;
                const isHere = s.id === current?.id;
                return (
                  <li key={s.id} className="pk-stop absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(p.x / (cols * 100)) * 100}%`, top: p.y, "--pk-i": i } as React.CSSProperties}>
                    {isHere ? (
                      <span aria-hidden className="pointer-events-none absolute -top-11 left-1/2 flex -translate-x-1/2 items-end gap-1">
                        <KiteMark className="h-9 w-7 -rotate-12" />
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setSelected(s.id)}
                      aria-pressed={isShown}
                      aria-current={isHere ? "step" : undefined}
                      className={cn(
                        "relative grid size-14 place-items-center rounded-full border-[3px] border-fg font-display text-small font-bold transition-transform duration-200 focus-ring motion-safe:hover:-translate-y-0.5",
                        st.state === "done" ? "bg-surface-2 text-fg-muted" : st.state === "now" || st.state === "next" ? "size-16 bg-accent text-accent-fg" : "bg-surface text-fg",
                        isShown && "ring-4 ring-accent/35 ring-offset-2 ring-offset-transparent",
                      )}
                    >
                      {st.state === "done" ? <Check aria-hidden className="size-5" strokeWidth={3} /> : <span>{t(s.short)}</span>}
                      <span className="sr-only">{st.state === "done" ? t(s.short) : ""} {st.state === "none" ? t(s.label) : fill(t(c.stopLabel), { label: t(s.label), state: stateText(st.state) })}</span>
                      {s.vaccine ? (
                        <span aria-hidden className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-fg bg-surface text-fg">
                          <Syringe className="size-3" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>

        <div aria-live="polite" className="mt-6 grid gap-6 rounded-ui-lg border border-line bg-surface p-6 @3xl:grid-cols-[auto_minmax(0,1fr)_auto] @3xl:items-center @3xl:p-8">
          <div aria-hidden className="grid size-20 place-items-center rounded-full border-[3px] border-fg font-display text-h3 font-bold" style={{ background: ink.sand }}>
            {t(shown.short)}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-h3 font-bold text-fg">{t(shown.label)}</h3>
              {shownState.state !== "none" ? <Badge tone={shownState.state === "done" ? "neutral" : shownState.state === "later" ? "outline" : "accent"}>{stateText(shownState.state)}</Badge> : null}
              {shown.vaccine ? (
                <Badge tone="info">
                  <Syringe aria-hidden className="size-3.5" /> {t(c.vaccine)}
                </Badge>
              ) : null}
            </div>
            <p className="max-w-[60ch] text-fg-muted">{t(shown.what)}</p>
            <p className="text-small font-medium text-fg">
              {shownState.due
                ? fill(t(shownState.state === "done" ? c.wasDue : c.due), { date: longDate(shownState.due, locale) })
                : fill(t(c.empty), { name: childName })}
              {shownState.state === "done" ? <span className="text-fg-muted"> · {t(c.pastNote)}</span> : null}
            </p>
            {current && shown.id === current.id && dob ? <p className="text-small text-accent-ink">{fill(t(c.here), { name: childName })}</p> : null}
          </div>
          <Button variant="primary" size="lg" className="rounded-full" onClick={() => book(shown)} disabled={shownState.state === "done"}>
            {dob ? fill(t(c.book), { label: t(shown.short) }) : t(c.bookAny)}
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
