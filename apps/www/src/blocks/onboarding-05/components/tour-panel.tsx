"use client";

import * as React from "react";
import { Check, Compass, Play, RotateCcw } from "lucide-react";
import { Button, Card, CardHeader, Kbd, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { TourDef, TourId } from "./data";

export interface TourProgress {
  /** Furthest step reached (0-based), or -1 when never started. */
  seen: number;
  done: boolean;
}

export interface TourPanelProps {
  tours: TourDef[];
  progress: Record<TourId, TourProgress>;
  onStart: (id: TourId, fromStep: number) => void;
}

/** "Tours" card: each tour with its length, a step-by-step progress strip and Start / Resume / Replay. */
export function TourPanel({ tours, progress, onStart }: TourPanelProps) {
  const { c, t } = useBlockFormat();
  const finished = tours.filter((x) => progress[x.id].done).length;
  return (
    <Card data-tour="tours">
      <CardHeader
        titleAs="h2"
        title={c("Tours", "Turlar")}
        description={c(`${finished} of ${tours.length} finished`, `${tours.length} turdan ${finished} tanesi bitti`)}
        action={<Compass aria-hidden className="size-4 text-fg-subtle" />}
      />
      <ul className="m-0 grid list-none gap-0 divide-y divide-line p-0 pb-1">
        {tours.map((tour) => {
          const p = progress[tour.id];
          const started = p.seen >= 0 && !p.done;
          const label = p.done ? c("Replay", "Tekrar izle") : started ? c("Resume", "Devam et") : c("Start", "Başla");
          return (
            <li key={tour.id} className="grid gap-2.5 px-(--card-p) py-3.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[14px] font-medium text-fg">
                    {t(tour.title)}
                    {p.done ? (
                      <span className="tone-success inline-flex size-4 items-center justify-center rounded-full bg-(--tone) text-scene" aria-label={c("finished", "bitti")}>
                        <Check aria-hidden className="size-2.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{t(tour.description)}</p>
                </div>
                <Button
                  size="sm"
                  variant={p.done ? "ghost" : "secondary"}
                  onClick={() => onStart(tour.id, started ? p.seen : 0)}
                  aria-label={`${label}: ${t(tour.title)}`}
                  className="shrink-0"
                >
                  {p.done ? <RotateCcw /> : <Play />} {label}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <ol aria-hidden className="m-0 flex flex-1 list-none gap-1 p-0">
                  {tour.steps.map((s, i) => (
                    <li key={s.id} className={cn("h-1 flex-1 rounded-full", p.done || i <= p.seen ? "bg-fg-muted" : "bg-track")} />
                  ))}
                </ol>
                <span className="shrink-0 font-mono text-[11px] text-fg-subtle tabular">
                  {c(`${tour.steps.length} steps · ${tour.minutes} min`, `${tour.steps.length} adım · ${tour.minutes} dk`)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="flex flex-wrap items-center gap-1.5 border-t border-line px-(--card-p) py-3 text-[12px] text-fg-subtle">
        <Kbd size="sm">←</Kbd>
        <Kbd size="sm">→</Kbd> {c("to move", "ilerlemek için")} · <Kbd size="sm">Esc</Kbd> {c("to leave", "çıkmak için")}
      </p>
    </Card>
  );
}
