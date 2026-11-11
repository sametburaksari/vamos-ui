"use client";

import * as React from "react";
import { Button, cn, IconButton, Slider, Switch } from "@vamos-ui/react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import { chapters, clock, copyFor, episodes, speakers, transcript, type SiteLocale } from "./content";

const RATES = [1, 1.25, 1.5, 2];
const BARS = 96;
/** Decorative waveform heights, deterministic (no hydration drift). */
const bar = (i: number) => 22 + Math.round(Math.abs(Math.sin(i * 1.7) * 48 + Math.sin(i * 0.31) * 30));

/** Index of the last item whose `at` is ≤ the time. */
function lastAt<T extends { at: number }>(list: T[], time: number) {
  let idx = 0;
  for (let i = 0; i < list.length; i++) if (list[i]!.at <= time) idx = i;
  return idx;
}

/**
 * The signature of the Long Table site: an episode player with chapter markers on the scrubber
 * and a transcript that follows playback (static data; the clock runs in the page). Click a
 * chapter or a transcript line to jump there. `hero` shows the line being spoken as a caption;
 * `full` adds the chapter list and the whole transcript with "Follow along".
 */
export function EpisodePlayer({ locale, mode = "hero" }: { locale: SiteLocale; mode?: "hero" | "full" }) {
  const { t, f } = copyFor(locale);
  const ep = episodes[0]!;
  const length = ep.length;
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [rate, setRate] = React.useState(1);
  const [follow, setFollow] = React.useState(true);
  const listRef = React.useRef<HTMLOListElement>(null);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((s) => {
        const next = s + 0.25 * rate;
        if (next >= length) {
          setPlaying(false);
          return length;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, rate, length]);

  const chapterIdx = lastAt(chapters, time);
  const lineIdx = lastAt(transcript, time);
  const line = transcript[lineIdx]!;
  const seek = (s: number) => setTime(Math.min(length, Math.max(0, s)));

  // Keep the active transcript line in view inside its own scroll box (never the page).
  React.useEffect(() => {
    if (mode !== "full" || !follow) return;
    const box = listRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-line="${lineIdx}"]`);
    if (!box || !el) return;
    const top = el.offsetTop - box.offsetTop - box.clientHeight / 3;
    box.scrollTo({ top: Math.max(0, top), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [lineIdx, follow, mode]);

  const played = time / length;

  return (
    <div className={cn("grid gap-6", mode === "full" && "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8")}>
      <div className="surface rounded-ui-lg p-5 sm:p-7" data-testid="player">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-accent-ink uppercase">
              {t({ en: `Episode ${ep.no}`, tr: `${ep.no}. bölüm` })} · {f.date(ep.date, { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="m-0 mt-1 font-display text-h3 leading-tight">{t(ep.title)}</p>
            <p className="m-0 text-small text-fg-muted">{t({ en: `with ${ep.guest}`, tr: `konuk: ${ep.guest}` })}</p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0 font-mono tabular-nums" onClick={() => setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length]!)} aria-label={t({ en: `Playback speed ${rate}×, change`, tr: `Oynatma hızı ${rate}×, değiştir` })}>
            {rate}×
          </Button>
        </div>

        {/* Chapter markers as a segmented strip */}
        <ol className="m-0 mt-6 flex list-none gap-[3px] p-0" aria-label={t({ en: "Chapters", tr: "Bölümler" })}>
          {chapters.map((ch, i) => {
            const end = chapters[i + 1]?.at ?? length;
            const width = ((end - ch.at) / length) * 100;
            const fill = time >= end ? 100 : time <= ch.at ? 0 : ((time - ch.at) / (end - ch.at)) * 100;
            return (
              <li key={ch.at} style={{ width: `${width}%` }} className="min-w-0">
                <button
                  type="button"
                  onClick={() => seek(ch.at)}
                  aria-current={i === chapterIdx ? "step" : undefined}
                  aria-label={`${clock(ch.at)} ${t(ch.title)}`}
                  title={t(ch.title)}
                  className="group block w-full py-2 focus-ring"
                >
                  <span className="relative block h-1.5 overflow-hidden rounded-full bg-track">
                    <span className="absolute inset-y-0 start-0 bg-accent" style={{ width: `${fill}%` }} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Waveform (decorative) + scrubber */}
        <div aria-hidden className="lt-wave mt-3 flex h-14 items-center gap-[2px]">
          {Array.from({ length: BARS }, (_, i) => (
            <span key={i} className={cn("block flex-1 rounded-full", i / BARS < played ? "bg-accent" : "bg-fg-subtle opacity-40")} style={{ height: `${bar(i)}%`, "--lt-i": i } as React.CSSProperties} />
          ))}
        </div>
        <Slider
          className="mt-2"
          value={[Math.floor(time)]}
          onValueChange={(v) => seek(v[0] ?? 0)}
          min={0}
          max={length}
          step={1}
          marks={chapters.slice(1).map((c) => c.at)}
          formatValue={clock}
          showValue="never"
          aria-label={t({ en: "Seek", tr: "İlerlet" })}
        />

        <div className="mt-5 flex items-center gap-3">
          <IconButton label={t({ en: "Back 15 seconds", tr: "15 saniye geri" })} variant="ghost" onClick={() => seek(time - 15)}>
            <RotateCcw />
          </IconButton>
          <Button variant="primary" size="lg" className="vm-press size-14 rounded-full p-0" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t({ en: "Pause", tr: "Duraklat" }) : t({ en: "Play", tr: "Oynat" })} data-testid="play">
            {playing ? <Pause className="size-6" /> : <Play className="size-6 translate-x-px" />}
          </Button>
          <IconButton label={t({ en: "Forward 30 seconds", tr: "30 saniye ileri" })} variant="ghost" onClick={() => seek(time + 30)}>
            <RotateCw />
          </IconButton>
          <p className="m-0 ms-auto font-mono text-sm tabular-nums" data-testid="player-time">
            {clock(time)} <span className="text-fg-muted">/ {clock(length)}</span>
          </p>
        </div>

        <p className="m-0 mt-5 border-t border-line pt-4 text-small">
          <span className="font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Chapter", tr: "Bölüm" })} {chapterIdx + 1}/{chapters.length}</span>
          <span className="ms-2 font-semibold" data-testid="chapter-title">{t(chapters[chapterIdx]!.title)}</span>
        </p>

        {mode === "full" ? (
          <ol className="m-0 mt-3 grid list-none gap-0.5 p-0" aria-label={t({ en: "Jump to a chapter", tr: "Bir bölüme atla" })}>
            {chapters.map((ch, i) => (
              <li key={ch.at}>
                <button
                  type="button"
                  onClick={() => seek(ch.at)}
                  aria-current={i === chapterIdx ? "step" : undefined}
                  className={cn("grid w-full grid-cols-[3.25rem_minmax(0,1fr)] gap-3 rounded-ui px-2 py-1.5 text-start text-small transition-colors focus-ring hover:bg-hover", i === chapterIdx ? "bg-selected font-semibold text-fg" : "text-fg-muted")}
                >
                  <span className="font-mono text-xs tabular-nums">{clock(ch.at)}</span>
                  <span>{t(ch.title)}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : null}

        {mode === "hero" ? (
          <figure className="m-0 mt-4 min-h-[6.5rem]" aria-live="off">
            <figcaption className="font-mono text-[11px] tracking-[0.12em] text-accent-ink uppercase">{speakers[line.who]}</figcaption>
            <blockquote className="m-0 mt-1 text-lead leading-snug" data-testid="caption">
              {t(line.text)}
            </blockquote>
          </figure>
        ) : null}
      </div>

      {mode === "full" ? (
        <section aria-labelledby="lt-transcript-title" className="surface flex min-w-0 flex-col rounded-ui-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id="lt-transcript-title" className="m-0 font-display text-h3">
              {t({ en: "Transcript", tr: "Döküm" })}
            </h2>
            <Switch checked={follow} onCheckedChange={setFollow} label={t({ en: "Follow along", tr: "Takip et" })} size="sm" />
          </div>
          <ol ref={listRef} className="m-0 max-h-[28rem] list-none overflow-y-auto p-2 lg:max-h-[34rem]" tabIndex={0} aria-label={t({ en: "Transcript lines", tr: "Döküm satırları" })}>
            {transcript.map((l, i) => {
              const startsChapter = chapters.findIndex((c) => c.at === l.at);
              return (
                <li key={l.at} data-line={i}>
                  {startsChapter > 0 ? (
                    <p className="m-0 mt-4 mb-1 px-3 font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">{t(chapters[startsChapter]!.title)}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => seek(l.at)}
                    aria-current={i === lineIdx ? "true" : undefined}
                    data-testid="transcript-line"
                    className={cn(
                      "grid w-full grid-cols-[3.25rem_minmax(0,1fr)] gap-3 rounded-ui px-3 py-2.5 text-start transition-colors focus-ring hover:bg-hover",
                      i === lineIdx ? "bg-accent-soft text-fg" : i < lineIdx ? "text-fg-muted" : "text-fg",
                    )}
                  >
                    <span className="pt-0.5 font-mono text-xs text-fg-muted tabular-nums">{clock(l.at)}</span>
                    <span>
                      <span className={cn("block font-mono text-[11px] tracking-[0.1em] uppercase", i === lineIdx ? "text-accent-ink" : "text-fg-muted")}>{speakers[l.who]}</span>
                      <span className="block leading-snug">{t(l.text)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
