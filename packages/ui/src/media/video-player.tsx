"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { Captions, CaptionsOff, Maximize, Minimize, Pause, PictureInPicture2, Play, RotateCcw, Volume1, Volume2, VolumeX, TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { aspectRatioOf, type ImageAspect } from "../components/image";
import { Slider } from "../components/slider";
import { Spinner } from "../components/spinner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { PortalContainer } from "../lib/theme-scope";
import { isMediaAsset } from "./media-provider";
import type { MediaAsset } from "./types";

const videoLabels = {
  player: "Video player",
  play: "Play",
  pause: "Pause",
  replay: "Replay",
  playVideo: "Play video: {title}",
  seek: "Seek",
  time: "{current} of {duration}",
  mute: "Mute",
  unmute: "Unmute",
  volume: "Volume",
  captionsOn: "Turn on captions",
  captionsOff: "Turn off captions",
  speed: "Playback speed",
  speedValue: "{rate}×",
  normal: "Normal",
  pip: "Picture in picture",
  fullscreen: "Full screen",
  exitFullscreen: "Exit full screen",
  error: "This video can't be played.",
  hlsUnsupported: "This stream needs HLS support. Pass the `hls` loader.",
  pauseBackground: "Pause background video",
  playBackground: "Play background video",
};
export type VideoPlayerLabels = typeof videoLabels;

export type VideoSource = string | MediaAsset | { url: string; type: "mp4" | "webm" | "hls" }[];

export interface VideoTrack {
  src: string;
  /** BCP 47, e.g. "en", "tr". */
  lang: string;
  label: string;
  kind?: "subtitles" | "captions";
  default?: boolean;
}

/** Minimal shape of the `hls.js` default export (optional peer, loaded on demand). */
export interface HlsConstructor {
  new (config?: Record<string, unknown>): { loadSource(url: string): void; attachMedia(el: HTMLMediaElement): void; destroy(): void; on?(event: string, cb: (...args: unknown[]) => void): void };
  isSupported(): boolean;
}

/** `1:02:05` / `3:07`. */
export function formatMediaTime(seconds: number, locale = "en-US"): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const two = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
  const one = new Intl.NumberFormat(locale, { useGrouping: false });
  return h > 0 ? `${one.format(h)}:${two.format(m)}:${two.format(s)}` : `${one.format(m)}:${two.format(s)}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const videoPlayerVariants = cva("vui-video group/video relative isolate overflow-hidden bg-scene", {
  variants: {
    rounded: { none: "", ui: "rounded-ui", "ui-lg": "rounded-ui-lg" },
    chrome: { overlay: "", bar: "" },
  },
  defaultVariants: { rounded: "ui", chrome: "overlay" },
});

export interface VideoPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onTimeUpdate" | "onEnded"> {
  src: VideoSource;
  poster?: string | MediaAsset;
  /** Box ratio. Default: the asset's ratio, else 16/9. */
  aspect?: ImageAspect;
  tracks?: VideoTrack[];
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  /** `custom` (default) kit controls · `native` browser controls · `none`. */
  controls?: "custom" | "native" | "none";
  /** `overlay` floats over the picture and hides while playing; `bar` stays visible. */
  chrome?: "overlay" | "bar";
  rounded?: "none" | "ui" | "ui-lg";
  /** Accessible name, e.g. the video title. */
  title?: string;
  preload?: "none" | "metadata" | "auto";
  /** Lazy loader for HLS streams in browsers without native HLS: `hls={() => import("hls.js")}`. */
  hls?: () => Promise<{ default: HlsConstructor }>;
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
  /** The `<video>` element. */
  videoRef?: React.Ref<HTMLVideoElement>;
  /** CORS mode, needed when caption tracks come from another origin. */
  crossOrigin?: "anonymous" | "use-credentials";
  labels?: Partial<VideoPlayerLabels>;
}

function sourcesOf(src: VideoSource): { url: string; type: "mp4" | "webm" | "hls" }[] {
  if (Array.isArray(src)) return src;
  const url = isMediaAsset(src) ? src.url : src;
  const type = /\.m3u8(\?|$)/i.test(url) || (isMediaAsset(src) && /mpegurl/i.test(src.mime)) ? "hls" : /\.webm(\?|$)/i.test(url) ? "webm" : "mp4";
  return [{ url, type }];
}

const MIME = { mp4: "video/mp4", webm: "video/webm", hls: "application/vnd.apple.mpegurl" } as const;

/**
 * Consistent controls for self-hosted video: play, seek, time, volume, captions, speed,
 * picture-in-picture and full screen. Keyboard: Space/K play, ←/→ 5 s, ↑/↓ volume, F full screen,
 * M mute, C captions. HLS loads `hls.js` only when needed. The chrome is always dark, because
 * video content is.
 *
 * ```tsx
 * <VideoPlayer src="/media/onboarding.mp4" poster="/media/onboarding.jpg" title="Onboarding: your first week"
 *   tracks={[{ src: "/media/onboarding.en.vtt", lang: "en", label: "English", default: true }]} />
 * ```
 */
export const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(function VideoPlayer(
  {
    src,
    poster: posterProp,
    aspect,
    tracks,
    autoPlay,
    muted: mutedProp = false,
    loop,
    playsInline = true,
    controls = "custom",
    chrome = "overlay",
    rounded,
    title,
    preload = "metadata",
    hls,
    onEnded,
    onTimeUpdate,
    videoRef,
    crossOrigin,
    labels,
    className,
    style,
    onKeyDown,
    ...props
  },
  ref,
) {
  const t = useLabels("videoPlayer", videoLabels, labels);
  const { locale } = useLocale();
  const reduced = useReducedMotion();
  const video = React.useRef<HTMLVideoElement>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const asset = isMediaAsset(src) ? src : undefined;
  const poster = isMediaAsset(posterProp) ? posterProp.url : posterProp ?? asset?.variants?.poster?.url;
  const ratio = aspectRatioOf(aspect ?? "auto", asset?.width, asset?.height) ?? 16 / 9;
  const sources = React.useMemo(() => sourcesOf(src), [src]);
  const isHls = sources.some((s) => s.type === "hls");

  const [playing, setPlaying] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [ended, setEnded] = React.useState(false);
  const [buffering, setBuffering] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(asset?.duration ?? 0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(mutedProp);
  const [rate, setRate] = React.useState(1);
  const [captions, setCaptions] = React.useState(Boolean(tracks?.some((tr) => tr.default)));
  const [fullscreen, setFullscreen] = React.useState(false);
  const [idle, setIdle] = React.useState(false);
  const idleTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useImperativeHandle(videoRef, () => video.current!, []);
  React.useImperativeHandle(ref, () => root.current!, []);
  const [rootEl, setRootEl] = React.useState<HTMLDivElement | null>(null);
  const rootRef = React.useCallback((node: HTMLDivElement | null) => {
    root.current = node;
    setRootEl(node);
  }, []);

  // HLS: native (Safari) or the lazy hls.js loader.
  React.useEffect(() => {
    const el = video.current;
    if (!el || !isHls) return;
    const hlsUrl = sources.find((s) => s.type === "hls")!.url;
    if (el.canPlayType(MIME.hls)) {
      el.src = hlsUrl;
      return;
    }
    if (!hls) {
      setError(t("hlsUnsupported"));
      return;
    }
    let instance: { destroy(): void } | undefined;
    let cancelled = false;
    hls().then(({ default: Hls }) => {
      if (cancelled || !video.current) return;
      if (!Hls.isSupported()) return setError(t("error"));
      const h = new Hls();
      h.loadSource(hlsUrl);
      h.attachMedia(video.current);
      instance = h;
    }, () => setError(t("error")));
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [isHls, sources, hls, t]);

  React.useEffect(() => {
    const el = video.current;
    if (!el || !tracks?.length) return;
    for (let i = 0; i < el.textTracks.length; i++) {
      const tr = el.textTracks[i]!;
      const def = tracks.findIndex((x) => x.default);
      tr.mode = captions && i === (def === -1 ? 0 : def) ? "showing" : "hidden";
    }
  }, [captions, tracks]);

  // Metadata can arrive before hydration attaches the listeners: read it once on mount.
  React.useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (el.readyState >= 1 && Number.isFinite(el.duration)) setDuration(el.duration);
    setMuted(el.muted);
    if (!el.paused) {
      setPlaying(true);
      setStarted(true);
    }
  }, []);

  React.useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const poke = React.useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2600);
  }, []);
  React.useEffect(() => () => clearTimeout(idleTimer.current), []);

  const togglePlay = React.useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.paused || el.ended) void el.play()?.catch?.(() => {});
    else el.pause();
  }, []);
  const seekBy = (d: number) => {
    const el = video.current;
    if (el) el.currentTime = Math.min(Math.max(0, el.currentTime + d), el.duration || Infinity);
  };
  const setVol = (v: number) => {
    const el = video.current;
    if (!el) return;
    el.volume = Math.min(1, Math.max(0, v));
    el.muted = el.volume === 0;
  };
  const toggleMute = () => {
    const el = video.current;
    if (el) el.muted = !el.muted;
  };
  const toggleFullscreen = () => {
    const el = root.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else if (el.requestFullscreen) void el.requestFullscreen();
    else (video.current as unknown as { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  };
  // Feature detection after mount, so server and client render the same controls.
  const [pipSupported, setPipSupported] = React.useState(false);
  React.useEffect(() => setPipSupported(Boolean((document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled)), []);
  const togglePip = () => {
    const el = video.current as (HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> }) | null;
    if (!el) return;
    const d = document as Document & { pictureInPictureElement?: Element | null; exitPictureInPicture?: () => Promise<void> };
    if (d.pictureInPictureElement) void d.exitPictureInPicture?.();
    else void el.requestPictureInPicture?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || controls !== "custom" || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    const onSlider = target.getAttribute("role") === "slider";
    const onButton = target.tagName === "BUTTON";
    const k = e.key.toLowerCase();
    if ((k === " " && !onButton) || k === "k") togglePlay();
    else if (k === "arrowleft" && !onSlider) seekBy(-5);
    else if (k === "arrowright" && !onSlider) seekBy(5);
    else if (k === "arrowup" && !onSlider) setVol((video.current?.volume ?? 1) + 0.1);
    else if (k === "arrowdown" && !onSlider) setVol((video.current?.volume ?? 1) - 0.1);
    else if (k === "f") toggleFullscreen();
    else if (k === "m") toggleMute();
    else if (k === "c" && tracks?.length) setCaptions((c) => !c);
    else return;
    e.preventDefault();
    poke();
  };

  const nf = React.useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }), [locale]);
  const showChrome = controls === "custom" && (chrome === "bar" || !playing || !idle);
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const btn = "vui-video-btn focus-ring inline-flex size-9 shrink-0 items-center justify-center rounded-ui-sm text-fg transition-colors hover:bg-hover [&_svg]:size-[18px]";

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={title ? `${t("player")}: ${title}` : t("player")}
      data-slot="video-player"
      data-state={error ? "error" : ended ? "ended" : playing ? "playing" : started ? "paused" : "poster"}
      data-chrome={chrome}
      data-idle={showChrome ? undefined : ""}
      className={cn(videoPlayerVariants({ rounded, chrome }), "dark", className)}
      style={{ aspectRatio: fullscreen ? undefined : String(ratio), ...style }}
      onKeyDown={handleKeyDown}
      onPointerMove={poke}
      onFocusCapture={poke}
      {...props}
    >
      <video
        ref={video}
        className="absolute inset-0 size-full bg-transparent object-contain"
        poster={poster}
        autoPlay={autoPlay && !reduced}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        controls={controls === "native"}
        crossOrigin={crossOrigin}
        onClick={controls === "custom" ? togglePlay : undefined}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          setEnded(false);
          poke();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          onEnded?.();
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => {
          setTime(e.currentTarget.currentTime);
          onTimeUpdate?.(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
        onError={() => setError(t("error"))}
        aria-label={title}
      >
        {isHls ? null : sources.map((s) => <source key={s.url} src={s.url} type={MIME[s.type]} />)}
        {tracks?.map((tr) => <track key={tr.src} src={tr.src} srcLang={tr.lang} label={tr.label} kind={tr.kind ?? "subtitles"} default={tr.default} />)}
      </video>

      {error ? (
        <div data-slot="video-error" role="alert" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-scene/80 p-6 text-center text-sm text-fg-muted">
          <TriangleAlert aria-hidden className="size-6 text-warning" />
          {error}
        </div>
      ) : null}

      {controls === "custom" && !error && (!started || ended) ? (
        <button
          type="button"
          data-slot="video-big-play"
          aria-label={ended ? t("replay") : title ? t("playVideo", { title }) : t("play")}
          onClick={togglePlay}
          className="vui-video-bigplay focus-ring absolute start-1/2 top-1/2 z-10 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full surface-popover text-fg rtl:translate-x-1/2 [&_svg]:size-6"
        >
          {ended ? <RotateCcw aria-hidden /> : <Play aria-hidden className="ms-0.5 fill-current" />}
        </button>
      ) : null}

      {buffering && playing ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Spinner size="lg" className="text-fg" />
        </div>
      ) : null}

      {controls === "custom" ? (
        <div
          data-slot="video-controls"
          data-visible={showChrome ? "" : undefined}
          className={cn("vui-video-controls absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 px-2 pt-8 pb-1.5", !started && chrome === "overlay" && "invisible")}
        >
          <Slider
            aria-label={t("seek")}
            size="sm"
            min={0}
            max={duration || 1}
            step={0.1}
            value={[Math.min(time, duration || 0)]}
            onValueChange={([v]) => {
              if (video.current && v !== undefined) video.current.currentTime = v;
            }}
            formatValue={(v) => t("time", { current: formatMediaTime(v, locale), duration: formatMediaTime(duration, locale) })}
            showValue="never"
            dir="ltr"
            className="vui-video-seek px-1.5"
          />
          <div className="flex items-center gap-0.5">
            <button type="button" data-slot="video-play" className={btn} aria-label={playing ? t("pause") : t("play")} onClick={togglePlay}>
              {playing ? <Pause aria-hidden className="fill-current" /> : <Play aria-hidden className="fill-current" />}
            </button>
            <div className="group/vol flex items-center">
              <button type="button" data-slot="video-mute" className={btn} aria-label={muted ? t("unmute") : t("mute")} onClick={toggleMute}>
                <VolumeIcon aria-hidden />
              </button>
              <div className="w-0 overflow-hidden opacity-0 transition-[width,opacity] duration-200 group-focus-within/vol:w-20 group-focus-within/vol:opacity-100 group-hover/vol:w-20 group-hover/vol:opacity-100">
                <Slider aria-label={t("volume")} size="sm" min={0} max={1} step={0.05} value={[muted ? 0 : volume]} onValueChange={([v]) => v !== undefined && setVol(v)} formatOptions={{ style: "percent" }} showValue="never" className="w-18 px-1.5" />
              </div>
            </div>
            <span data-slot="video-time" className="tabular ms-1.5 text-[12.5px] text-fg-muted">
              <span className="text-fg">{formatMediaTime(time, locale)}</span>
              <span aria-hidden className="mx-1 text-fg-subtle">/</span>
              {formatMediaTime(duration, locale)}
            </span>
            <div className="ms-auto flex items-center gap-0.5">
              {tracks?.length ? (
                <button type="button" data-slot="video-captions" className={btn} aria-pressed={captions} aria-label={captions ? t("captionsOff") : t("captionsOn")} onClick={() => setCaptions((c) => !c)}>
                  {captions ? <Captions aria-hidden /> : <CaptionsOff aria-hidden />}
                </button>
              ) : null}
              <PortalContainer container={rootEl}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button type="button" data-slot="video-speed" className={cn(btn, "w-auto px-2 text-[12.5px] font-medium tabular")} aria-label={`${t("speed")}: ${t("speedValue", { rate: nf.format(rate) })}`}>
                    {t("speedValue", { rate: nf.format(rate) })}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top">
                  <DropdownMenuLabel>{t("speed")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={String(rate)}
                    onValueChange={(v) => {
                      if (video.current) video.current.playbackRate = Number(v);
                    }}
                  >
                    {SPEEDS.map((s) => (
                      <DropdownMenuRadioItem key={s} value={String(s)}>
                        {s === 1 ? t("normal") : t("speedValue", { rate: nf.format(s) })}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              </PortalContainer>
              {pipSupported ? (
                <button type="button" data-slot="video-pip" className={btn} aria-label={t("pip")} onClick={togglePip}>
                  <PictureInPicture2 aria-hidden />
                </button>
              ) : null}
              <button type="button" data-slot="video-fullscreen" className={btn} aria-label={fullscreen ? t("exitFullscreen") : t("fullscreen")} onClick={toggleFullscreen}>
                {fullscreen ? <Minimize aria-hidden /> : <Maximize aria-hidden />}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Lite embed (YouTube / Vimeo)                                         */
/* ------------------------------------------------------------------ */

export interface VideoEmbedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  provider: "youtube" | "vimeo";
  /** Video id (`dQw4w9WgXcQ`, `76979871`). */
  id: string;
  /** Required: names the play button and the iframe. */
  title: string;
  /** Facade image. YouTube default: the video's own thumbnail. Vimeo needs one. */
  poster?: string;
  aspect?: ImageAspect;
  /** Start at second. */
  start?: number;
  rounded?: "none" | "ui" | "ui-lg";
  labels?: Partial<VideoPlayerLabels>;
}

/**
 * A privacy-friendly embed: a poster and a play button until clicked, then a
 * `youtube-nocookie.com` (or `player.vimeo.com` with `dnt=1`) iframe. No third-party request,
 * cookie or script before the visitor chooses to play.
 */
export const VideoEmbed = React.forwardRef<HTMLDivElement, VideoEmbedProps>(function VideoEmbed(
  { provider, id, title, poster, aspect = "16/9", start, rounded = "ui", labels, className, style, ...props },
  ref,
) {
  const t = useLabels("videoPlayer", videoLabels, labels);
  const [active, setActive] = React.useState(false);
  const ratio = aspectRatioOf(aspect) ?? 16 / 9;
  const image = poster ?? (provider === "youtube" ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : undefined);
  const url =
    provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0${start ? `&start=${start}` : ""}`
      : `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1&dnt=1${start ? `#t=${start}s` : ""}`;
  return (
    <div
      ref={ref}
      data-slot="video-embed"
      data-provider={provider}
      data-state={active ? "active" : "facade"}
      className={cn(videoPlayerVariants({ rounded }), "dark", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    >
      {active ? (
        <iframe
          src={url}
          title={title}
          className="absolute inset-0 size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} aria-label={t("playVideo", { title })} className="vui-video-facade focus-ring group/facade absolute inset-0 size-full">
          {image ? <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/facade:scale-[1.02] motion-reduce:transition-none" /> : null}
          <span aria-hidden className="vui-video-facade-shade absolute inset-0" />
          <span aria-hidden className="absolute start-4 end-4 top-4 line-clamp-2 text-start text-[15px] font-medium text-fg">
            {title}
          </span>
          <span aria-hidden className="absolute start-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full surface-popover text-fg transition-transform group-hover/facade:scale-105 rtl:translate-x-1/2 [&_svg]:size-6">
            <Play className="ms-0.5 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Background video                                                     */
/* ------------------------------------------------------------------ */

export interface BackgroundVideoProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string | { url: string; type: "mp4" | "webm" }[];
  /** Shown before playback and, under reduced motion, instead of the video. */
  poster: string;
  /** Content on top (hero copy). */
  children?: React.ReactNode;
  labels?: Partial<VideoPlayerLabels>;
}

/**
 * Muted, looping, decorative video (hero backgrounds). `aria-hidden`, with a visible pause
 * button (WCAG 2.2.2). Reduced motion shows the poster only.
 */
export const BackgroundVideo = React.forwardRef<HTMLDivElement, BackgroundVideoProps>(function BackgroundVideo({ src, poster, labels, className, children, ...props }, ref) {
  const t = useLabels("videoPlayer", videoLabels, labels);
  const reduced = useReducedMotion();
  const video = React.useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = React.useState(false);
  const list = typeof src === "string" ? sourcesOf(src) : src;
  return (
    <div ref={ref} data-slot="background-video" className={cn("relative isolate overflow-hidden", className)} {...props}>
      {reduced ? (
        <img src={poster} alt="" aria-hidden className="absolute inset-0 -z-10 size-full object-cover" />
      ) : (
        <video ref={video} aria-hidden tabIndex={-1} className="absolute inset-0 -z-10 size-full object-cover" poster={poster} autoPlay muted loop playsInline preload="auto">
          {list.map((s) => <source key={s.url} src={s.url} type={MIME[s.type]} />)}
        </video>
      )}
      {children}
      {reduced ? null : (
        <button
          type="button"
          data-slot="background-video-toggle"
          aria-label={paused ? t("playBackground") : t("pauseBackground")}
          onClick={() => {
            const el = video.current;
            if (!el) return;
            if (el.paused) {
              void el.play()?.catch?.(() => {});
              setPaused(false);
            } else {
              el.pause();
              setPaused(true);
            }
          }}
          className="focus-ring surface-popover absolute end-4 bottom-4 z-10 inline-flex size-9 items-center justify-center rounded-full text-fg [&_svg]:size-4"
        >
          {paused ? <Play aria-hidden className="fill-current" /> : <Pause aria-hidden className="fill-current" />}
        </button>
      )}
    </div>
  );
});
