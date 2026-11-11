import * as React from "react";
import { cn } from "@vamos-ui/react";
import { coachCues, liveRun, pace, plans, recovery, week, type Copy } from "./content";

/**
 * A phone drawn from tokens (no device art): a rounded body, a speaker slit, a status bar and a
 * screen slot. Server component. Screens are plain JSX so they re-theme with the site.
 */
export function PhoneFrame({ children, className, time = "07:12", size = "md" }: { children: React.ReactNode; className?: string; time?: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "relative shrink-0 rounded-[2.9rem] border border-line bg-surface-2 p-[7px] shadow-2xl",
        size === "md" ? "w-[17.5rem]" : "w-[14.5rem]",
        className,
      )}
    >
      <div className="relative flex aspect-[9/19.2] flex-col overflow-hidden rounded-[2.4rem] bg-scene">
        <div className="flex items-center justify-between px-6 pt-3 pb-1 font-mono text-[11px] font-semibold text-fg tabular">
          <span>{time}</span>
          <span aria-hidden className="h-[5px] w-14 rounded-full bg-line" />
          <span className="flex items-center gap-1" aria-hidden>
            <span className="h-2 w-[3px] rounded-[1px] bg-fg" />
            <span className="h-2.5 w-[3px] rounded-[1px] bg-fg" />
            <span className="ms-1 h-2.5 w-5 rounded-[3px] border border-fg-muted p-[1.5px]">
              <span className="block h-full w-3/4 rounded-[1px] bg-fg" />
            </span>
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-4 pt-2 pb-4">{children}</div>
      </div>
    </div>
  );
}

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-fg-muted", className)}>{children}</div>
);

/** Live run: pace, target band, rep, heart-rate zone. */
export function LiveScreen({ c }: { c: Copy }) {
  const { t, f } = c;
  const r = liveRun;
  // Marker position inside a 4:45–5:40 scale.
  const lo = 285;
  const hi = 340;
  const pos = (s: number) => `${((s - lo) / (hi - lo)) * 100}%`;
  return (
    <>
      <div className="flex items-center justify-between">
        <Label>{t({ en: "Intervals", tr: "İnterval" })}</Label>
        <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[9.5px] font-semibold text-accent-fg tabular">
          {t({ en: "Rep", tr: "Tekrar" })} {r.rep}/{r.reps}
        </span>
      </div>
      <div className="mt-5">
        <Label>{t({ en: "Current pace", tr: "Anlık tempo" })}</Label>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-[4.1rem] leading-[0.85] font-bold tracking-[-0.05em] text-fg tabular">{pace(r.paceSec)}</span>
          <span className="font-mono text-xs text-fg-muted">/km</span>
        </div>
      </div>
      <div className="mt-4">
        <div className="relative h-2 rounded-full bg-surface-2">
          <span className="absolute inset-y-0 rounded-full bg-accent-soft ring-1 ring-accent" style={{ insetInlineStart: pos(r.targetLow), width: `calc(${pos(r.targetHigh)} - ${pos(r.targetLow)})` }} />
          <span className="absolute -top-1 h-4 w-[3px] -translate-x-1/2 rounded-full bg-fg rtl:translate-x-1/2" style={{ insetInlineStart: pos(r.paceSec) }} />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9.5px] text-fg-muted tabular">
          <span>{pace(r.targetLow)}</span>
          <span className="text-accent-ink">{t({ en: "on target", tr: "hedefte" })}</span>
          <span>{pace(r.targetHigh)}</span>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-line pt-4">
        {[
          [t({ en: "Distance", tr: "Mesafe" }), `${f.number(r.km, { minimumFractionDigits: 2 })} km`],
          [t({ en: "Time", tr: "Süre" }), r.elapsed],
          [t({ en: "Rep left", tr: "Kalan" }), `${r.repLeft} m`],
          [t({ en: "Heart", tr: "Nabız" }), `${r.heart}`],
        ].map(([k, v]) => (
          <div key={k}>
            <dt><Label>{k}</Label></dt>
            <dd className="m-0 mt-0.5 font-mono text-lg font-semibold text-fg tabular">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4">
        <Label>{t({ en: "Zone", tr: "Bölge" })} {r.zone}</Label>
        <div className="mt-1.5 grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((z) => (
            <span key={z} className={cn("h-1.5 rounded-full", z === r.zone ? "bg-accent" : z < r.zone ? "bg-fg-subtle" : "bg-surface-2")} />
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-center gap-4">
        <span className="grid size-10 place-items-center rounded-full border border-line font-mono text-[9px] text-fg-muted">LAP</span>
        <span className="grid size-14 place-items-center rounded-full bg-accent">
          <span className="flex gap-1"><span className="h-4 w-1.5 rounded-[2px] bg-accent-fg" /><span className="h-4 w-1.5 rounded-[2px] bg-accent-fg" /></span>
        </span>
        <span className="grid size-10 place-items-center rounded-full border border-line font-mono text-[9px] text-fg-muted">GPS</span>
      </div>
    </>
  );
}

/** This week's plan. */
export function PlanScreen({ c }: { c: Copy }) {
  const { t } = c;
  return (
    <>
      <Label>{t({ en: "Week 6 of 10 · 10K under 50", tr: "10 haftanın 6.’sı · 50 dk altı 10K" })}</Label>
      <div className="mt-1 font-display text-2xl leading-tight font-bold tracking-[-0.03em] text-fg">{t({ en: "This week", tr: "Bu hafta" })}</div>
      <div className="mt-1 font-mono text-[10px] text-fg-muted tabular">{t({ en: "2 of 6 done · 37 km planned", tr: "6’nın 2’si tamam · 37 km planlı" })}</div>
      <ol className="m-0 mt-4 grid list-none gap-1.5 p-0">
        {week.map((d, i) => (
          <li
            key={i}
            className={cn(
              "grid grid-cols-[2.25rem_1fr_auto] items-center gap-2 rounded-xl border px-2.5 py-2",
              d.state === "today" ? "border-accent bg-accent-soft" : "border-line",
              d.state === "done" && "bg-surface-2",
            )}
          >
            <span className="font-mono text-[10px] font-semibold uppercase text-fg-muted">{t(d.day)}</span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold text-fg">{t(d.title)}</span>
              <span className="block truncate font-mono text-[9.5px] text-fg-muted">{t(d.detail)}</span>
            </span>
            <span className={cn("size-2 rounded-full", d.state === "done" ? "bg-fg-muted" : d.state === "today" ? "bg-accent" : d.state === "rest" ? "border border-dashed border-fg-subtle" : "border border-fg-subtle")} />
          </li>
        ))}
      </ol>
      <div className="mt-auto rounded-xl border border-dashed border-line px-3 py-2 text-center font-mono text-[9.5px] text-fg-muted">
        {t({ en: "Drag a session to move it", tr: "Taşımak için sürükleyin" })}
      </div>
    </>
  );
}

const WAVE = [6, 10, 18, 26, 14, 30, 22, 36, 28, 16, 24, 34, 20, 12, 26, 32, 18, 10, 22, 14, 8, 16, 12, 6];

/** Voice coach: waveform + cue transcript. */
export function CoachScreen({ c }: { c: Copy }) {
  const { t } = c;
  return (
    <>
      <Label>{t({ en: "Coach · Deniz", tr: "Koç · Deniz" })}</Label>
      <div className="mt-1 font-display text-2xl leading-tight font-bold tracking-[-0.03em] text-fg">{t({ en: "Speaking", tr: "Konuşuyor" })}</div>
      <div className="mt-5 flex h-12 items-center gap-[3px]" aria-hidden>
        {WAVE.map((h, i) => (
          <span key={i} className={cn("w-[5px] rounded-full", i > 6 && i < 17 ? "bg-accent" : "bg-fg-subtle")} style={{ height: h + 6 }} />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9.5px] text-fg-muted"><span>{t({ en: "music −14 dB", tr: "müzik −14 dB" })}</span><span>1:32</span></div>
      <ol className="m-0 mt-5 grid list-none gap-3 border-t border-line p-0 pt-4">
        {coachCues.map((cue, i) => (
          <li key={i} className={cn("grid grid-cols-[2.25rem_1fr] gap-2", false)}>
            <span className="font-mono text-[10px] text-fg-muted tabular">{cue.at}</span>
            <span className={cn("text-[12.5px] leading-snug", i === 1 ? "font-semibold text-fg" : "text-fg-muted")}>“{t(cue.text)}”</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1 text-center font-mono text-[9.5px]">
        <span className="rounded-lg py-1.5 text-fg">{t({ en: "Quiet", tr: "Sessiz" })}</span>
        <span className="rounded-lg bg-scene py-1.5 font-semibold text-fg">{t({ en: "Normal", tr: "Normal" })}</span>
        <span className="rounded-lg py-1.5 text-fg">{t({ en: "Chatty", tr: "Konuşkan" })}</span>
      </div>
    </>
  );
}

/** Morning readiness: score ring, sleep, resting HR, 7-day load. */
export function RecoverScreen({ c }: { c: Copy }) {
  const { t } = c;
  const r = recovery;
  const R = 46;
  const len = 2 * Math.PI * R;
  const days = [t({ en: "M", tr: "P" }), t({ en: "T", tr: "S" }), t({ en: "W", tr: "Ç" }), t({ en: "T", tr: "P" }), t({ en: "F", tr: "C" }), t({ en: "S", tr: "C" }), t({ en: "S", tr: "P" })];
  return (
    <>
      <Label>{t({ en: "Thursday morning", tr: "Perşembe sabahı" })}</Label>
      <div className="mt-4 grid place-items-center">
        <div className="relative size-36">
          <svg viewBox="0 0 110 110" className="size-full -rotate-90" aria-hidden>
            <circle cx="55" cy="55" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="9" />
            <circle cx="55" cy="55" r={R} fill="none" stroke="var(--accent)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(len * r.score) / 100} ${len}`} />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <span className="font-display text-5xl leading-none font-bold tracking-[-0.05em] text-fg tabular">{r.score}</span>
            <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-accent-ink">{t({ en: "ready", tr: "hazır" })}</span>
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div><dt><Label>{t({ en: "Sleep", tr: "Uyku" })}</Label></dt><dd className="m-0 mt-0.5 font-mono text-[15px] font-semibold text-fg">{t(r.sleep)}</dd></div>
        <div><dt><Label>{t({ en: "Resting HR", tr: "Dinlenik nabız" })}</Label></dt><dd className="m-0 mt-0.5 font-mono text-[15px] font-semibold text-fg tabular">{r.rhr}</dd></div>
      </dl>
      <div className="mt-4">
        <Label>{t({ en: "Load, last 7 days", tr: "Yük, son 7 gün" })}</Label>
        <div className="mt-2 flex h-14 items-end gap-1.5" aria-hidden>
          {r.load.map((v, i) => (
            <span key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className={cn("w-full rounded-[3px]", i === r.load.length - 1 ? "bg-accent" : v ? "bg-fg-subtle" : "bg-surface-2")} style={{ height: Math.max(3, (v / 80) * 44) }} />
              <span className="font-mono text-[8.5px] text-fg-muted">{days[i]}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="mt-auto rounded-xl bg-accent-soft px-3 py-2 text-[11.5px] leading-snug text-fg">
        {t({ en: "Good to go: tempo 8 km stays on the plan.", tr: "Hazırsınız: 8 km tempo planda kalıyor." })}
      </p>
    </>
  );
}

/** A plan overview for the Tabs section: phases and a week-by-week volume grid. */
export function PlanOverviewScreen({ c, planId }: { c: Copy; planId: string }) {
  const { t, f } = c;
  const p = plans.find((x) => x.id === planId) ?? plans[0]!;
  // Weekly volume curve: grows to the peak, step-back every 4th week, taper at the end.
  const vols = Array.from({ length: p.weeks }, (_, i) => {
    const base = p.peak * (0.45 + 0.55 * Math.min(1, i / Math.max(1, p.weeks - 3)));
    const stepBack = (i + 1) % 4 === 0 ? 0.78 : 1;
    const taper = i === p.weeks - 1 ? 0.5 : i === p.weeks - 2 && p.weeks > 10 ? 0.75 : 1;
    return Math.round(base * stepBack * taper);
  });
  return (
    <>
      <Label>{t({ en: "Plan", tr: "Plan" })}</Label>
      <div className="mt-1 font-display text-2xl leading-tight font-bold tracking-[-0.03em] text-fg">{t(p.name)}</div>
      <div className="mt-1 font-mono text-[10px] text-fg-muted">{f.number(p.weeks)} {t({ en: "weeks", tr: "hafta" })} · {t(p.perWeek)}</div>
      <div className="mt-5 flex h-28 items-end gap-[3px]" aria-hidden>
        {vols.map((v, i) => (
          <span key={i} className={cn("flex-1 rounded-t-[3px]", v === Math.max(...vols) ? "bg-accent" : "bg-fg-subtle")} style={{ height: `${(v / p.peak) * 100}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-fg-muted"><span>{t({ en: "wk 1", tr: "hf 1" })}</span><span>{t({ en: "peak", tr: "zirve" })} {p.peak} km</span><span>{t({ en: "race", tr: "yarış" })}</span></div>
      <ol className="m-0 mt-5 grid list-none gap-2 border-t border-line p-0 pt-4">
        {p.phases.map((ph, i) => (
          <li key={i} className="flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-2 text-fg"><span className="font-mono text-[9.5px] text-fg-muted">0{i + 1}</span>{t(ph.name)}</span>
            <span className="font-mono text-[10px] text-fg-muted tabular">{ph.weeks} {t({ en: "wk", tr: "hf" })}</span>
          </li>
        ))}
      </ol>
      <div className="mt-auto rounded-xl border border-line px-3 py-2 text-[11.5px] text-fg-muted">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-fg-muted">{t({ en: "Goal", tr: "Hedef" })} </span>
        {t(p.goal)}
      </div>
    </>
  );
}
