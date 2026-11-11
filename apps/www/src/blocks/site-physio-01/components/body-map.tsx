"use client";

import * as React from "react";
import { buttonVariants, cn, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Clock } from "lucide-react";
import { AREAS, areas, fill, treatments, tl, type AreaId, type View } from "./content";
import { useArea } from "./area-provider";

export const mapCopy = {
  where: { en: "Where does it hurt?", tr: "Neresi ağrıyor?" },
  view: { en: "Figure side", tr: "Figür yönü" },
  front: { en: "Front", tr: "Ön" },
  back: { en: "Back", tr: "Arka" },
  common: { en: "What people come with", tr: "En sık gelinen nedenler" },
  visits: { en: "Usually {from}–{to} visits", tr: "Genellikle {from}–{to} seans" },
  suggested: { en: "Treatments for this area", tr: "Bu bölge için tedaviler" },
  min: { en: "{n} min", tr: "{n} dk" },
  book: { en: "Book for {area}", tr: "{area} için randevu" },
  bookOne: { en: "Book", tr: "Randevu" },
  live: { en: "{area} selected: {n} treatments.", tr: "{area} seçildi: {n} tedavi." },
  note: { en: "A guide, not a diagnosis — your physio decides at the first assessment.", tr: "Bir yol gösterici, teşhis değil — fizyoterapistiniz ilk değerlendirmede karar verir." },
};

/** Capsule segments of the mannequin (viewBox 200 × 440). */
const SEGMENTS: [number, number, number, number, number][] = [
  // x1, y1, x2, y2, width
  [100, 62, 100, 80, 18], // neck
  [74, 96, 126, 96, 50], // chest
  [82, 130, 118, 130, 50], // belly
  [86, 168, 114, 168, 46], // waist
  [80, 214, 120, 214, 44], // pelvis
  [62, 88, 46, 168, 20], // upper arm L
  [138, 88, 154, 168, 20], // upper arm R
  [46, 172, 32, 244, 17], // forearm L
  [154, 172, 168, 244, 17], // forearm R
  [84, 236, 80, 326, 26], // thigh L
  [116, 236, 120, 326, 26], // thigh R
  [80, 334, 82, 408, 20], // shin L
  [120, 334, 118, 408, 20], // shin R
];

/**
 * Motion Lab is a sports clinic and moves like one: full level, confident. Signature: the
 * mannequin turns on its axis when you switch front/back, and the hotspots pop on afterwards,
 * one by one. The selected hotspot keeps its ping (a live indicator).
 */
const labMotion = `
@keyframes ml-turn { from { transform: perspective(40rem) rotateY(80deg); opacity: 0.2; } }
@keyframes ml-spot { from { transform: scale(0); } }
@media screen and (prefers-reduced-motion: no-preference) {
  .ml-turn:where(:not([data-motion="off"] *)) { transform-origin: 50% 50%; animation: ml-turn 520ms var(--ease-out-quint); }
  .ml-spot:where(:not([data-motion="off"] *)) > span:first-child { animation: ml-spot 360ms var(--ease-spring) backwards; animation-delay: calc(var(--ml-wait, 0ms) + var(--vm-i, 0) * 45ms); }
}
`;

function Mannequin({ view }: { view: View }) {
  return (
    <svg aria-hidden viewBox="0 0 200 440" className="ml-turn absolute inset-0 size-full">
      {/* One group with group opacity: overlapping capsules merge into a single flat silhouette. */}
      <g strokeLinecap="round" stroke="var(--fg)" fill="var(--fg)" opacity="0.2">
        <circle cx="100" cy="36" r="23" stroke="none" />
        {SEGMENTS.map(([x1, y1, x2, y2, w], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} />
        ))}
        <ellipse cx="78" cy="420" rx="13" ry="7" stroke="none" />
        <ellipse cx="122" cy="420" rx="13" ry="7" stroke="none" />
      </g>
      {/* A spine on the back view, a sternum line on the front. */}
      {view === "back" ? (
        <path d="M100 76 V226" stroke="var(--fg-subtle)" strokeWidth="1.2" strokeDasharray="3 4" fill="none" />
      ) : (
        <path d="M100 82 V150" stroke="var(--fg-subtle)" strokeWidth="1.2" fill="none" />
      )}
    </svg>
  );
}

/** The figure with hotspots (pointer shortcut) and a front/back switch. The chips are the keyboard path. */
export function BodyFigure({ className }: { className?: string }) {
  const { t, area, setArea, view, setView } = useArea();
  const c = mapCopy;
  // Hotspots wait for the figure on first paint; after a front/back turn they follow quickly.
  const first = React.useRef(true);
  React.useEffect(() => {
    first.current = false;
  }, []);
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <ToggleGroup type="single" variant="outline" size="sm" aria-label={t(c.view)} value={view} onValueChange={(v) => v && setView(v as View)}>
        <ToggleGroupItem value="front" className="px-3 font-mono text-xs uppercase data-[state=on]:bg-accent data-[state=on]:text-accent-fg">
          {t(c.front)}
        </ToggleGroupItem>
        <ToggleGroupItem value="back" className="px-3 font-mono text-xs uppercase data-[state=on]:bg-accent data-[state=on]:text-accent-fg">
          {t(c.back)}
        </ToggleGroupItem>
      </ToggleGroup>
      <div
        className="relative aspect-[200/440] w-full max-w-[13rem] @4xl:max-w-[15rem]"
        style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)", backgroundSize: "10% 4.545%" }}
      >
        <span aria-hidden className="absolute -top-5 start-0 font-mono text-[10px] text-fg-subtle uppercase">
          {view === "front" ? "ML · A" : "ML · P"}
        </span>
        <style>{labMotion}</style>
        <Mannequin key={view} view={view} />
        {AREAS.map((id, i) => {
          const pos = areas[id].spot[view];
          if (!pos) return null;
          const on = id === area;
          return (
            <button
              key={`${view}-${id}`}
              type="button"
              tabIndex={-1}
              aria-hidden
              data-area={id}
              onClick={() => setArea(id)}
              title={t(areas[id].label)}
              style={{ left: `${pos[0]}%`, top: `${pos[1]}%`, "--vm-i": i, "--ml-wait": first.current ? "900ms" : "220ms" } as React.CSSProperties}
              className={cn(
                "ml-spot group absolute grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full",
              )}
            >
              <span
                className={cn(
                  "block rounded-full border-2 transition-[width,height,background-color] duration-200 motion-reduce:transition-none",
                  on ? "size-5 border-accent bg-accent shadow-[0_0_0_6px_var(--accent-soft)]" : "size-3.5 border-accent-ink bg-surface group-hover:size-4.5",
                )}
              />
              {on ? <span className="absolute size-9 animate-ping rounded-full border border-accent opacity-40 motion-reduce:hidden" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Area chips: the accessible picker (one tab stop, arrow keys). */
export function AreaChips({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { t, area, setArea } = useArea();
  return (
    <ToggleGroup type="single" variant="outline" aria-label={t(mapCopy.where)} value={area} onValueChange={(v) => v && setArea(v as AreaId)} className={cn("flex flex-wrap gap-1.5", className)}>
      {AREAS.map((id) => (
        <ToggleGroupItem
          key={id}
          value={id}
          className={cn(
            "rounded-full! border-line px-3.5 font-medium text-fg data-[state=on]:border-transparent data-[state=on]:bg-accent data-[state=on]:text-accent-fg",
            size === "md" ? "h-10 text-small" : "h-8 text-xs",
          )}
        >
          {t(areas[id].label)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** What the selected area means here: common reasons, the treatments for it with time and price. */
export function AreaPanel({ className }: { className?: string }) {
  const { t, locale, area, setTreatment } = useArea();
  const a = areas[area];
  const c = mapCopy;
  const label = t(a.label);
  return (
    <div className={cn("flex flex-col gap-5", className)} data-area-panel={area}>
      <p className="sr-only" aria-live="polite">
        {fill(t(c.live), { area: label, n: a.treatments.length })}
      </p>
      <div key={area} className="flex animate-[ui-rise_300ms_cubic-bezier(0.2,0.8,0.2,1)] flex-col gap-2 motion-reduce:animate-none">
        <p className="font-mono text-xs tracking-wider text-accent-ink uppercase">{fill(t(c.visits), { from: a.visits[0], to: a.visits[1] })}</p>
        <h2 className="font-display text-display-m text-fg">{label}</h2>
        <p className="text-small text-fg-muted">
          <span className="font-medium text-fg">{t(c.common)}: </span>
          {t(a.common)}
        </p>
      </div>
      <div className="flex flex-col">
        <h3 className="mb-1 text-xs font-semibold tracking-wide text-fg-muted uppercase">{t(c.suggested)}</h3>
        <ul key={area} className="divide-y divide-line border-y border-line">
          {a.treatments.map((id, i) => {
            const tr = treatments[id];
            return (
              <li key={id} style={{ animationDelay: `${i * 40}ms` }} className="flex animate-[ui-rise_300ms_cubic-bezier(0.2,0.8,0.2,1)_both] items-baseline justify-between gap-3 py-2.5 motion-reduce:animate-none">
                <a href={sitePageHref("booking")} onClick={() => setTreatment(id)} className="focus-ring min-w-0 rounded-sm font-medium text-fg underline-offset-4 hover:underline">
                  {t(tr.name)}
                </a>
                <span className="flex shrink-0 items-baseline gap-3 text-small">
                  <span className="flex items-center gap-1 text-fg-muted">
                    <Clock aria-hidden className="size-3.5" />
                    {fill(t(c.min), { n: tr.minutes })}
                  </span>
                  <span className="font-semibold text-fg tabular">{tl(tr.fee, locale)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <a href={sitePageHref("booking")} onClick={() => setTreatment("assessment")} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "self-start")}>
        {fill(t(c.book), { area: label.toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB") })}
        <ArrowRight aria-hidden className="rtl:rotate-180" />
      </a>
      <p className="text-xs text-fg-subtle">{t(c.note)}</p>
    </div>
  );
}
