"use client";

import * as React from "react";
import { Download, FileText, Pause, Play, RotateCcw, RotateCw, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useEventCallback } from "../lib/use-controllable-state";
import { Slider } from "./slider";

export const audioPlayerLabels = {
  player: "Audio player",
  play: "Play",
  pause: "Pause",
  seek: "Seek",
  time: "{current} of {duration}",
  skipBack: "{seconds, plural, one {Back # second} other {Back # seconds}}",
  skipForward: "{seconds, plural, one {Forward # second} other {Forward # seconds}}",
  speed: "Playback speed {rate}×, change",
  speedValue: "{rate}×",
  chapters: "Chapters",
  chapterOf: "Chapter {index} of {count}",
  transcript: "Transcript",
  download: "Download",
  error: "This audio can't be played.",
};
export type AudioPlayerLabels = typeof audioPlayerLabels;

export interface AudioChapter {
  /** Start, in seconds from the beginning. */
  start: number;
  title: string;
}

export type AudioSource = string | { url: string; type?: string }[];

/** `1:02:05` / `3:07`, with the locale's digits. */
function clock(seconds: number, locale: string): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const two = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
  const one = new Intl.NumberFormat(locale, { useGrouping: false });
  return h > 0 ? `${one.format(h)}:${two.format(m)}:${two.format(s)}` : `${one.format(m)}:${two.format(s)}`;
}

/** Index of the chapter playing at `time` (-1 before the first one). */
export function chapterAt(chapters: AudioChapter[], time: number): number {
  let idx = -1;
  for (let i = 0; i < chapters.length; i++) if (chapters[i]!.start <= time + 0.001) idx = i;
  return idx;
}

export interface AudioPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onTimeUpdate" | "onEnded" | "title"> {
  src: AudioSource;
  /** Shown above the controls and used for the accessible name and the media session. */
  title?: string;
  /** A line under the title (series, author, date). */
  description?: React.ReactNode;
  /** Cover image URL (also given to the media session). */
  artwork?: string;
  /** Chapter markers: on the seek bar, as a list that seeks, and the current one highlighted. */
  chapters?: AudioChapter[];
  /** Hide the chapter list (markers stay on the seek bar). */
  hideChapterList?: boolean;
  /** Known length in seconds, shown before the metadata loads (and on the server). */
  duration?: number;
  /** Seconds for the back button and the J key. Default `15`. */
  skipBack?: number;
  /** Seconds for the forward button and the L key. Default `30`. */
  skipForward?: number;
  /** Rates the speed button cycles through. Default `[1, 1.25, 1.5, 2]`. */
  rates?: number[];
  /** Link to a transcript page. */
  transcriptHref?: string;
  /** Link to download the file. `true` uses the source URL. */
  download?: string | boolean;
  /** Register with the OS media controls (lock screen, headset keys) while playing. Default `true`. */
  mediaSession?: boolean;
  preload?: "none" | "metadata" | "auto";
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  /** Called with the chapter index when playback enters another chapter. */
  onChapterChange?: (index: number) => void;
  /** The `<audio>` element. */
  audioRef?: React.Ref<HTMLAudioElement>;
  labels?: Partial<AudioPlayerLabels>;
}

const DEFAULT_RATES = [1, 1.25, 1.5, 2];

/**
 * A player for spoken audio — episodes, talks, lessons, voice notes: play, a seek bar with chapter
 * marks, skip back / forward, speed, and a chapter list that seeks and follows playback. Keyboard
 * anywhere in the player: Space / K play, ← / → 5 s, J / L skip. It wires the OS media controls
 * (Media Session API) when available.
 *
 * ```tsx
 * <AudioPlayer src="/audio/episode-12.mp3" title="Episode 12: Moving house" duration={2710}
 *   chapters={[{ start: 0, title: "Intro" }, { start: 312, title: "Packing" }]} download />
 * ```
 */
export const AudioPlayer = /*#__PURE__*/ React.forwardRef<HTMLDivElement, AudioPlayerProps>(function AudioPlayer(
  {
    src,
    title,
    description,
    artwork,
    chapters,
    hideChapterList,
    duration: durationProp,
    skipBack = 15,
    skipForward = 30,
    rates = DEFAULT_RATES,
    transcriptHref,
    download,
    mediaSession = true,
    preload = "metadata",
    onTimeUpdate,
    onEnded,
    onChapterChange,
    audioRef,
    labels,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const t = useLabels("audioPlayer", audioPlayerLabels, labels);
  const { locale } = useLocale();
  const audio = React.useRef<HTMLAudioElement>(null);
  React.useImperativeHandle(audioRef, () => audio.current!, []);

  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(durationProp ?? 0);
  const [rate, setRate] = React.useState(1);
  const [error, setError] = React.useState(false);

  const sources = typeof src === "string" ? [{ url: src, type: undefined }] : src;
  const list = React.useMemo(() => [...(chapters ?? [])].sort((a, b) => a.start - b.start), [chapters]);
  const current = chapterAt(list, time);
  const nf = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);

  // Metadata can arrive before hydration attaches the listeners: read it once on mount.
  React.useEffect(() => {
    const el = audio.current;
    if (!el) return;
    if (el.readyState >= 1 && Number.isFinite(el.duration)) setDuration(el.duration);
    if (!el.paused) setPlaying(true);
  }, []);

  const chapterChanged = useEventCallback(onChapterChange);
  const lastChapter = React.useRef(current);
  React.useEffect(() => {
    if (lastChapter.current !== current) {
      lastChapter.current = current;
      if (current >= 0) chapterChanged(current);
    }
  }, [current, chapterChanged]);

  const togglePlay = React.useCallback(() => {
    const el = audio.current;
    if (!el) return;
    if (el.paused || el.ended) void el.play()?.catch?.(() => {});
    else el.pause();
  }, []);
  const seekTo = React.useCallback((s: number) => {
    const el = audio.current;
    if (!el) return;
    const max = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : Infinity;
    el.currentTime = Math.min(Math.max(0, s), max);
    setTime(el.currentTime);
  }, []);
  const seekBy = React.useCallback((d: number) => seekTo((audio.current?.currentTime ?? 0) + d), [seekTo]);
  const cycleRate = () => {
    const next = rates[(rates.indexOf(rate) + 1) % rates.length] ?? 1;
    if (audio.current) audio.current.playbackRate = next;
    setRate(next);
  };

  // OS media controls.
  const latest = React.useRef({ list, seekTo, seekBy, skipBack, skipForward, togglePlay });
  latest.current = { list, seekTo, seekBy, skipBack, skipForward, togglePlay };
  React.useEffect(() => {
    if (!mediaSession || !playing || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const Meta = (globalThis as { MediaMetadata?: typeof MediaMetadata }).MediaMetadata;
    if (Meta) ms.metadata = new Meta({ title: title ?? "", artwork: artwork ? [{ src: artwork }] : [] });
    const set = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(action, fn);
      } catch {
        /* unsupported action */
      }
    };
    const L = latest.current;
    set("play", () => latest.current.togglePlay());
    set("pause", () => latest.current.togglePlay());
    set("seekbackward", (d) => latest.current.seekBy(-(d.seekOffset ?? latest.current.skipBack)));
    set("seekforward", (d) => latest.current.seekBy(d.seekOffset ?? latest.current.skipForward));
    set("seekto", (d) => d.seekTime != null && latest.current.seekTo(d.seekTime));
    if (L.list.length) {
      set("previoustrack", () => {
        const { list: c } = latest.current;
        const now = audio.current?.currentTime ?? 0;
        const i = chapterAt(c, now);
        // Restart the chapter unless we are in its first 3 s.
        const target = i > 0 && now - c[i]!.start < 3 ? c[i - 1]!.start : (c[Math.max(0, i)]?.start ?? 0);
        latest.current.seekTo(target);
      });
      set("nexttrack", () => {
        const { list: c } = latest.current;
        const next = c[chapterAt(c, audio.current?.currentTime ?? 0) + 1];
        if (next) latest.current.seekTo(next.start);
      });
    }
    return () => {
      for (const a of ["play", "pause", "seekbackward", "seekforward", "seekto", "previoustrack", "nexttrack"] as MediaSessionAction[]) set(a, null);
    };
  }, [mediaSession, playing, title, artwork]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    const onSlider = target.getAttribute("role") === "slider";
    const onControl = target.tagName === "BUTTON" || target.tagName === "A";
    const k = e.key.toLowerCase();
    if ((k === " " && !onControl) || k === "k") togglePlay();
    else if (k === "arrowleft" && !onSlider) seekBy(-5);
    else if (k === "arrowright" && !onSlider) seekBy(5);
    else if (k === "j") seekBy(-skipBack);
    else if (k === "l") seekBy(skipForward);
    else return;
    e.preventDefault();
  };

  const downloadHref = download === true ? sources[0]?.url : typeof download === "string" ? download : undefined;
  const iconBtn = "focus-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full text-fg transition-colors hover:bg-hover [&_svg]:size-5";
  const linkCls = "focus-ring inline-flex items-center gap-1.5 rounded-ui-sm text-small font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg [&_svg]:size-4 [&_svg]:text-fg-muted";

  return (
    <div
      ref={ref}
      role="group"
      aria-label={title ? `${t("player")}: ${title}` : t("player")}
      data-slot="audio-player"
      data-state={error ? "error" : playing ? "playing" : "paused"}
      className={cn("flex flex-col gap-4 rounded-ui-lg border border-line bg-surface p-4 text-fg sm:p-5", className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <audio
        ref={audio}
        preload={preload}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onTimeUpdate={(e) => {
          setTime(e.currentTarget.currentTime);
          onTimeUpdate?.(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
        onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
        onError={() => setError(true)}
      >
        {sources.map((s) => (
          <source key={s.url} src={s.url} type={s.type} />
        ))}
      </audio>

      {title || description || artwork || rates.length > 1 ? (
        <div className="flex items-start gap-3">
          {artwork ? <img src={artwork} alt="" className="size-14 shrink-0 rounded-ui object-cover" /> : null}
          <div className="min-w-0 flex-1">
            {title ? (
              <p className="m-0 truncate font-semibold text-fg">
                {title}
              </p>
            ) : null}
            {description ? <div className="text-small text-fg-muted">{description}</div> : null}
          </div>
          {rates.length > 1 ? (
            <button
              type="button"
              data-slot="audio-speed"
              onClick={cycleRate}
              aria-label={t("speed", { rate: nf.format(rate) })}
              className="focus-ring inline-flex h-8 shrink-0 items-center rounded-ui-sm border border-line px-2 text-xs font-medium tabular transition-colors hover:bg-hover"
            >
              {t("speedValue", { rate: nf.format(rate) })}
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="m-0 flex items-center gap-2 text-small text-fg-muted">
          <TriangleAlert aria-hidden className="size-4 text-warning" />
          {t("error")}
        </p>
      ) : null}

      <Slider
        aria-label={t("seek")}
        min={0}
        max={duration || 1}
        step={1}
        value={[Math.min(time, duration || 0)]}
        onValueChange={([v]) => v !== undefined && seekTo(v)}
        marks={list.filter((c) => c.start > 0 && (!duration || c.start < duration)).map((c) => c.start)}
        formatValue={(v) => t("time", { current: clock(v, locale), duration: clock(duration, locale) })}
        showValue="never"
        dir="ltr"
        disabled={error}
      />

      <div className="flex items-center gap-1">
        <button type="button" data-slot="audio-skip-back" className={iconBtn} aria-label={t("skipBack", { seconds: skipBack })} onClick={() => seekBy(-skipBack)} disabled={error}>
          <RotateCcw aria-hidden />
        </button>
        <button
          type="button"
          data-slot="audio-play"
          aria-label={playing ? t("pause") : t("play")}
          onClick={togglePlay}
          disabled={error}
          className="focus-ring inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-transform active:scale-95 disabled:opacity-50 motion-reduce:transition-none [&_svg]:size-5"
        >
          {playing ? <Pause aria-hidden className="fill-current" /> : <Play aria-hidden className="ms-0.5 fill-current" />}
        </button>
        <button type="button" data-slot="audio-skip-forward" className={iconBtn} aria-label={t("skipForward", { seconds: skipForward })} onClick={() => seekBy(skipForward)} disabled={error}>
          <RotateCw aria-hidden />
        </button>
        <span data-slot="audio-time" className="ms-auto text-small text-fg-muted tabular">
          <span className="text-fg">{clock(time, locale)}</span>
          <span aria-hidden className="mx-1 text-fg-subtle">
            /
          </span>
          {clock(duration, locale)}
        </span>
      </div>

      {list.length && !hideChapterList ? (
        <nav aria-label={t("chapters")} className="border-t border-line pt-3">
          {current >= 0 ? (
            <p data-slot="audio-current-chapter" className="m-0 mb-2 text-xs font-medium text-fg-muted">
              {t("chapterOf", { index: current + 1, count: list.length })}
            </p>
          ) : null}
          <ol className="m-0 grid list-none gap-0.5 p-0">
            {list.map((c, i) => (
              <li key={`${c.start}-${i}`}>
                <button
                  type="button"
                  data-slot="audio-chapter"
                  aria-current={i === current ? "true" : undefined}
                  onClick={() => seekTo(c.start)}
                  className={cn(
                    "focus-ring grid w-full grid-cols-[4rem_minmax(0,1fr)] gap-3 rounded-ui px-2 py-1.5 text-start text-small transition-colors hover:bg-hover",
                    i === current ? "bg-selected font-semibold text-fg" : "text-fg-muted",
                  )}
                >
                  <span className="text-xs tabular">{clock(c.start, locale)}</span>
                  <span>{c.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {transcriptHref || downloadHref ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {transcriptHref ? (
            <a href={transcriptHref} className={linkCls}>
              <FileText aria-hidden />
              {t("transcript")}
            </a>
          ) : null}
          {downloadHref ? (
            <a href={downloadHref} download className={linkCls}>
              <Download aria-hidden />
              {t("download")}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
