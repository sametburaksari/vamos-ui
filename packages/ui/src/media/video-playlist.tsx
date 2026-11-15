"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import type { ImageAspect } from "../components/image";
import { formatMediaTime, VideoEmbed, VideoPlayer, type VideoPlayerLabels, type VideoSource, type VideoTrack } from "./video-player";

export const videoPlaylistLabels = {
  /** Name of the list of videos. */
  list: "Videos",
  /** Announced after another video is picked. */
  nowShowing: "Now showing: {title}",
  /** Duration, read after the title: "Length 3:07". */
  duration: "Length {time}",
};
export type VideoPlaylistLabels = typeof videoPlaylistLabels;

interface VideoPlaylistItemBase {
  id: string;
  /** Names the play button, the iframe / player and the list row. */
  title: string;
  /** Second line in the row and under the player (year, place, length…). */
  description?: React.ReactNode;
  /** Length in seconds (shown as 3:07) or ready text. */
  duration?: number | string;
  /** Row thumbnail. Default: the poster (or the YouTube thumbnail). */
  thumbnail?: string;
}

/** A YouTube / Vimeo video behind a click-to-load facade, or a self-hosted file. */
export type VideoPlaylistItem = VideoPlaylistItemBase &
  (
    | { provider: "youtube" | "vimeo"; videoId: string; poster?: string; start?: number; src?: never }
    | { src: VideoSource; poster?: string; tracks?: VideoTrack[]; provider?: never }
  );

export interface VideoPlaylistProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  items: VideoPlaylistItem[];
  /** Selected video id (controlled). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** `"below"` (default): list under the player · `"side"`: list beside it when the container is wide. */
  layout?: "below" | "side";
  aspect?: ImageAspect;
  /** Show the selected video's title and description under the player. Default `true`. */
  showDetails?: boolean;
  /** Number the rows (01, 02 …). Default `true`. */
  numbered?: boolean;
  /** Start a self-hosted video as soon as it is picked from the list (embeds always wait for a click). */
  playOnSelect?: boolean;
  /** Heading level of the details title. Default `3`. */
  headingLevel?: 2 | 3 | 4;
  labels?: Partial<VideoPlaylistLabels>;
  /** Passed to the player / embed. */
  playerLabels?: Partial<VideoPlayerLabels>;
}

const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;

/**
 * One player and a list that swaps which video sits in it — trailers, sessions, a channel's
 * latest uploads. YouTube and Vimeo stay behind the lite embed facade, so nothing loads from the
 * video host until the visitor presses play; self-hosted files use VideoPlayer. Switching
 * announces the new title politely and keeps focus in the list.
 *
 * ```tsx
 * <VideoPlaylist layout="side" items={[
 *   { id: "trailer", title: "Launch trailer", provider: "youtube", videoId: "aqz-KE-bpKQ", duration: 74 },
 *   { id: "walkthrough", title: "Walkthrough", src: "/media/walkthrough.mp4", poster: "/media/walkthrough.jpg" },
 * ]} />
 * ```
 */
export const VideoPlaylist = /*#__PURE__*/ React.forwardRef<HTMLDivElement, VideoPlaylistProps>(function VideoPlaylist(
  {
    items,
    value: valueProp,
    defaultValue,
    onValueChange,
    layout = "below",
    aspect = "16/9",
    showDetails = true,
    numbered = true,
    playOnSelect = false,
    headingLevel = 3,
    labels,
    playerLabels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("videoPlaylist", videoPlaylistLabels, labels);
  const { locale } = useLocale();
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? items[0]?.id ?? "", onChange: onValueChange, name: "VideoPlaylist" });
  const [picked, setPicked] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const current = items.find((v) => v.id === value) ?? items[0];
  const Heading = `h${headingLevel}` as "h3";
  const listId = React.useId();

  const pick = (item: VideoPlaylistItem) => {
    if (item.id === current?.id) return;
    setPicked(true);
    setValue(item.id);
    setAnnounce(t("nowShowing", { title: item.title }));
  };

  const time = (d: number | string | undefined) => (d == null ? undefined : typeof d === "number" ? formatMediaTime(d, locale) : d);

  return (
    <div ref={ref} data-slot="video-playlist" data-layout={layout} className={cn("@container min-w-0", className)} {...props}>
      <div className={cn("grid gap-x-6 gap-y-5", layout === "side" && "@3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @3xl:items-start")}>
        <div className="flex min-w-0 flex-col gap-3">
          {current ? (
            current.provider ? (
              <VideoEmbed key={current.id} provider={current.provider} id={current.videoId} title={current.title} poster={current.poster} start={current.start} aspect={aspect} labels={playerLabels} />
            ) : (
              <VideoPlayer key={current.id} src={current.src} poster={current.poster} tracks={current.tracks} title={current.title} aspect={aspect} autoPlay={picked && playOnSelect} labels={playerLabels} />
            )
          ) : null}
          {showDetails && current ? (
            <div className="min-w-0">
              <Heading className="m-0 text-h3 font-semibold text-fg">{current.title}</Heading>
              {current.description != null ? <div className="mt-1 text-small text-fg-muted">{current.description}</div> : null}
            </div>
          ) : null}
        </div>
        <ol id={listId} aria-label={t("list")} className={cn("m-0 grid list-none gap-0 border-t border-line p-0", layout === "below" && "@xl:grid-cols-2 @xl:gap-x-6 @4xl:grid-cols-3", layout === "side" && "@3xl:border-t-0")}>
          {items.map((v, i) => {
            const on = v.id === current?.id;
            const thumb = v.thumbnail ?? v.poster ?? (v.provider === "youtube" ? youtubeThumb(v.videoId) : undefined);
            const length = time(v.duration);
            return (
              <li key={v.id} className="border-b border-line">
                <button
                  type="button"
                  aria-current={on ? "true" : undefined}
                  data-video={v.id}
                  onClick={() => pick(v)}
                  className={cn("group/vp flex w-full items-start gap-3 py-3 text-start transition-colors focus-ring motion-reduce:transition-none", on ? "text-fg" : "text-fg-muted hover:text-fg")}
                >
                  {numbered ? (
                    <span aria-hidden="true" className={cn("mt-0.5 w-5 shrink-0 font-mono text-xs tabular", on && "text-accent-ink")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                  {thumb ? (
                    <span className="relative hidden aspect-video w-24 shrink-0 overflow-hidden rounded-ui-sm bg-surface-2 sm:block">
                      <img src={thumb} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                      {length ? <span aria-hidden="true" className="absolute end-1 bottom-1 rounded-ui-sm bg-scene px-1 text-[11px] text-fg tabular">{length}</span> : null}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fg">{v.title}</span>
                    {v.description != null ? <span className="mt-0.5 block text-small text-fg-muted">{v.description}</span> : null}
                    {length ? <span className={cn("mt-0.5 block text-xs text-fg-subtle tabular", thumb && "sm:sr-only")}>{t("duration", { time: length })}</span> : null}
                  </span>
                  <Play aria-hidden className={cn("mt-1 size-4 shrink-0", on ? "fill-accent text-accent-ink" : "opacity-0 group-hover/vp:opacity-100")} />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <span role="status" className="sr-only">
        {announce}
      </span>
    </div>
  );
});
