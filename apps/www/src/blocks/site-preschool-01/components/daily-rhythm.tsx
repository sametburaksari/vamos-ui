"use client";

import * as React from "react";
import { Button, cn, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BookOpen, DoorOpen, Moon, Pause, Play, Shapes, Trees, Utensils, type LucideIcon } from "lucide-react";
import { DAY_END, DAY_START, fill, GROUPS, groups, kindNames, rhythm, toMin, type Block, type Kind } from "./content";
import { useSchool } from "./school-provider";
import { Reveal } from "@vamos-ui/react/motion";

const c = {
  group: { en: "Age group", tr: "Yaş grubu" },
  day: { en: "A day in {group}", tr: "{group} grubunda bir gün" },
  now: { en: "Now", tr: "Şimdi" },
  nowLine: { en: "It is {time} in Istanbul — {group} are at “{title}”.", tr: "İstanbul’da saat {time} — {group} şu an “{title}” bölümünde." },
  outLine: { en: "It is {time} in Istanbul and the children are at home. Here is how a school day runs.", tr: "İstanbul’da saat {time}, çocuklar evde. Bir okul günü böyle geçiyor." },
  play: { en: "Play the day", tr: "Günü oynat" },
  pause: { en: "Pause", tr: "Duraklat" },
  led: { en: "Led by {name}", tr: "Yürüten: {name}" },
  kitchen: { en: "Cooked by our kitchen team", tr: "Mutfak ekibimiz hazırlıyor" },
  min: { en: "{n} min", tr: "{n} dk" },
  hint: { en: "Use the arrow keys to move through the day.", tr: "Gün içinde ok tuşlarıyla gezinin." },
};

export const KIND_ICONS: Record<Kind, LucideIcon> = { care: DoorOpen, play: Shapes, learn: BookOpen, outdoor: Trees, rest: Moon, meal: Utensils };

/** Minutes since midnight in Istanbul on a school day, or the clock text when school is out. */
function useIstanbulNow() {
  const [now, setNow] = React.useState<{ min: number; text: string; school: boolean } | null>(null);
  React.useEffect(() => {
    const read = () => {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }).formatToParts(new Date());
      const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
      const min = Number(get("hour")) * 60 + Number(get("minute"));
      const weekday = !["Sat", "Sun"].includes(get("weekday"));
      setNow({ min, text: `${get("hour")}:${get("minute")}`, school: weekday && min >= DAY_START && min < DAY_END });
    };
    read();
    const id = window.setInterval(read, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const pct = (min: number) => ((min - DAY_START) / (DAY_END - DAY_START)) * 100;
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

/**
 * Signature element: the daily rhythm as a proportional timeline. Pick an age group, step
 * through the day (click, arrow keys, or "Play the day"); a live marker shows where the
 * children are right now in Istanbul time.
 */
export function DailyRhythm({ headingId, compact = false }: { headingId?: string; compact?: boolean }) {
  const { t, group, setGroup, locale } = useSchool();
  const blocks = rhythm[group];
  const now = useIstanbulNow();
  const nowIndex = now?.school ? blocks.findIndex((b) => toMin(b.start) <= now.min && now.min < toMin(b.end)) : -1;
  const [selected, setSelected] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const touched = React.useRef(false);
  const wideRef = React.useRef<HTMLDivElement>(null);
  const narrowRef = React.useRef<HTMLDivElement>(null);
  const uid = React.useId();

  // Follow the clock until the visitor picks something themselves.
  React.useEffect(() => {
    if (!touched.current && nowIndex >= 0) setSelected(nowIndex);
  }, [nowIndex]);
  React.useEffect(() => {
    setSelected((s) => Math.min(s, blocks.length - 1));
  }, [blocks.length]);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setSelected((s) => {
        if (s >= blocks.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1800);
    return () => window.clearInterval(id);
  }, [playing, blocks.length]);

  const pick = (i: number, focus?: "wide" | "narrow") => {
    touched.current = true;
    setPlaying(false);
    setSelected(i);
    if (focus) {
      const root = focus === "wide" ? wideRef.current : narrowRef.current;
      root?.querySelectorAll<HTMLElement>("[role=tab]")[i]?.focus();
    }
  };

  const onKey = (e: React.KeyboardEvent, where: "wide" | "narrow") => {
    const prev = where === "wide" ? ["ArrowLeft"] : ["ArrowUp"];
    const next = where === "wide" ? ["ArrowRight"] : ["ArrowDown"];
    const rtl = (e.currentTarget as HTMLElement).closest("[dir=rtl]") !== null;
    let k = e.key;
    if (rtl && where === "wide") k = k === "ArrowLeft" ? "ArrowRight" : k === "ArrowRight" ? "ArrowLeft" : k;
    let to = -1;
    if (prev.includes(k)) to = Math.max(0, selected - 1);
    else if (next.includes(k)) to = Math.min(blocks.length - 1, selected + 1);
    else if (k === "Home") to = 0;
    else if (k === "End") to = blocks.length - 1;
    if (to < 0) return;
    e.preventDefault();
    pick(to, where);
  };

  const block = blocks[selected] ?? blocks[0]!;
  const Icon = KIND_ICONS[block.kind];
  const panelId = `${uid}-panel`;
  const g = groups[group];
  const minutes = toMin(block.end) - toMin(block.start);

  const tabProps = (b: Block, i: number, where: "w" | "n") => ({
    role: "tab" as const,
    id: `${uid}-${where}-${i}`,
    "aria-selected": i === selected,
    "aria-controls": panelId,
    tabIndex: i === selected ? 0 : -1,
    onClick: () => pick(i),
    "aria-label": `${b.start}–${b.end} ${t(b.title)}${i === nowIndex ? ` (${t(c.now)})` : ""}`,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-small font-medium text-fg-muted">{t(c.group)}</p>
          <ToggleGroup
            type="single"
            variant="segmented"
            aria-label={t(c.group)}
            value={group}
            onValueChange={(v) => {
              if (!v) return;
              touched.current = false;
              setPlaying(false);
              setGroup(v as typeof group);
            }}
          >
            {GROUPS.map((id) => (
              <ToggleGroupItem key={id} value={id} className="gap-1.5 px-3">
                <span className="font-semibold">{t(groups[id].name)}</span>
                <span className="hidden text-fg-muted @md:inline">{t(groups[id].ages)}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="max-w-[44ch] text-small text-fg-muted" aria-live="polite">
            {now
              ? nowIndex >= 0
                ? fill(t(c.nowLine), { time: now.text, group: t(g.name), title: t(blocks[nowIndex]!.title) })
                : fill(t(c.outLine), { time: now.text })
              : " "}
          </p>
          <Button variant="secondary" size="sm" className="rounded-full" onClick={() => {
            touched.current = true;
            if (!playing && selected >= blocks.length - 1) setSelected(0);
            setPlaying((p) => !p);
          }} aria-pressed={playing}>
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            {playing ? t(c.pause) : t(c.play)}
          </Button>
        </div>
      </div>

      {/* Wide: a proportional track with an hour ruler and the live marker. */}
      <div className="hidden @3xl:block">
        <div className="relative mb-2 h-5 text-[11px] text-fg-muted" aria-hidden>
          {HOURS.map((h) => (
            <span key={h} className="tabular absolute -translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${pct(h * 60)}%` }}>
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>
        <Reveal effect="fade" duration={1100} className="lo-day relative">
          <div ref={wideRef} role="tablist" aria-label={fill(t(c.day), { group: t(g.name) })} aria-describedby={`${uid}-hint`} onKeyDown={(e) => onKey(e, "wide")} className="flex h-28 gap-1">
            {blocks.map((b, i) => {
              const KIcon = KIND_ICONS[b.kind];
              const long = toMin(b.end) - toMin(b.start) >= 45;
              const on = i === selected;
              return (
                <button
                  key={`${group}-${i}`}
                  type="button"
                  {...tabProps(b, i, "w")}
                  style={{ flexGrow: toMin(b.end) - toMin(b.start), flexBasis: 0, "--lo-i": i } as React.CSSProperties}
                  className={cn(
                    "focus-ring group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[1.1rem] p-2.5 text-start transition-[background-color,transform] duration-200 motion-reduce:transition-none",
                    on ? "bg-accent text-accent-fg" : b.kind === "outdoor" ? "bg-accent-soft text-fg hover:-translate-y-0.5" : b.kind === "rest" ? "border border-dashed border-line bg-surface-2 text-fg hover:-translate-y-0.5" : "border border-line bg-surface text-fg hover:-translate-y-0.5",
                  )}
                >
                  <KIcon aria-hidden className={cn("size-4 shrink-0", on ? "" : "text-fg-muted")} />
                  {long ? <span aria-hidden className="line-clamp-2 text-[12px] leading-tight font-semibold">{t(b.title)}</span> : null}
                </button>
              );
            })}
          </div>
          {now?.school ? (
            <div aria-hidden className="pointer-events-none absolute -top-1 -bottom-1 w-0.5 rounded-full bg-fg" style={{ insetInlineStart: `${pct(now.min)}%` }}>
              <span className="absolute -bottom-6 start-1/2 -translate-x-1/2 rounded-full bg-fg px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-scene rtl:translate-x-1/2">
                {t(c.now)} {now.text}
              </span>
            </div>
          ) : null}
        </Reveal>
      </div>

      {/* Narrow: the same day as a vertical list. */}
      <div ref={narrowRef} role="tablist" aria-orientation="vertical" aria-label={fill(t(c.day), { group: t(g.name) })} onKeyDown={(e) => onKey(e, "narrow")} className={cn("flex flex-col gap-1.5 @3xl:hidden", compact && "max-h-[26rem] overflow-y-auto pe-1")}>
        {blocks.map((b, i) => {
          const KIcon = KIND_ICONS[b.kind];
          const on = i === selected;
          return (
            <button
              key={`${group}-n-${i}`}
              type="button"
              {...tabProps(b, i, "n")}
              aria-label={undefined}
              className={cn("focus-ring flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-start", on ? "bg-accent text-accent-fg" : "border border-line bg-surface text-fg")}
            >
              <span className={cn("tabular w-[5.5rem] shrink-0 text-[12px]", on ? "" : "text-fg-muted")}>
                {b.start}–{b.end}
              </span>
              <KIcon aria-hidden className={cn("size-4 shrink-0", on ? "" : "text-fg-muted")} />
              <span className="min-w-0 flex-1 truncate text-small font-semibold">{t(b.title)}</span>
              {i === nowIndex ? (
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", on ? "bg-accent-fg text-accent" : "bg-fg text-scene")}>
                  {t(c.now)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p id={`${uid}-hint`} className="sr-only">
        {t(c.hint)}
      </p>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${uid}-w-${selected}`}
        className="mt-2 grid gap-6 rounded-[1.75rem] border border-line bg-surface p-6 @3xl:mt-6 @3xl:grid-cols-[13rem_minmax(0,1fr)] @3xl:p-8"
      >
        <div key={`${group}-${selected}-a`} className="flex flex-col gap-2 animate-[ui-rise_300ms_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none">
          <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent-ink">
            <Icon aria-hidden className="size-5" />
          </span>
          <p className="tabular font-display text-display-m text-fg">{block.start}</p>
          <p className="text-small text-fg-muted">
            {block.start}–{block.end} · {fill(t(c.min), { n: minutes.toLocaleString(locale === "tr" ? "tr-TR" : "en-GB") })}
          </p>
        </div>
        <div key={`${group}-${selected}-b`} className="flex flex-col gap-3 animate-[ui-rise_340ms_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none">
          <p className="text-xs font-semibold tracking-wide text-accent-ink uppercase">{t(kindNames[block.kind])}</p>
          <h3 className="font-display text-h3 text-fg">{t(block.title)}</h3>
          <p className="max-w-[60ch] text-lead text-fg-muted">{t(block.detail)}</p>
          <p className="text-small text-fg">{block.lead === "Kitchen" ? t(c.kitchen) : fill(t(c.led), { name: block.lead })}</p>
        </div>
      </div>
    </div>
  );
}
