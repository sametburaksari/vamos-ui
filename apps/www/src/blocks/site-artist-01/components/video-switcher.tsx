"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { Container, MediaText } from "@vamos-ui/react/blocks";
import { Play } from "lucide-react";
import { copyFor, photos, videos, type SiteLocale } from "./content";

/**
 * Videos: one facade player (nothing loads from the video host until play is pressed) and a
 * list that swaps which video sits in it.
 */
export function VideoSwitcher({ locale, labels }: { locale: SiteLocale; labels?: Record<string, string> }) {
  const { t, intl } = copyFor(locale);
  const [active, setActive] = React.useState(videos[0]!.id);
  const v = videos.find((x) => x.id === active)!;
  const ph = photos[v.photo];
  return (
    <div>
      <MediaText
        key={v.id}
        locale={intl}
        labels={labels}
        variant="side"
        aspect="3:2"
        headingLevel={3}
        theme={{ rhythm: "tight" }}
        eyebrow={t({ en: "Now showing", tr: "Şimdi" })}
        title={t(v.title)}
        body={t(v.meta)}
        media={{ src: ph.src, width: ph.width, height: ph.height, alt: t(ph.alt) }}
        video={{ provider: "youtube", url: v.url, title: t(v.title) }}
      />
      <Container>
      <ol className="m-0 grid list-none gap-x-6 border-t-2 border-fg p-0 md:grid-cols-3" aria-label={t({ en: "More videos", tr: "Diğer videolar" })}>
        {videos.map((x, i) => (
          <li key={x.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => setActive(x.id)}
              aria-pressed={x.id === active}
              className={cn("flex w-full items-start gap-3 py-4 text-start focus-ring", x.id === active ? "text-fg" : "text-fg-muted hover:text-fg")}
            >
              <span className="font-mono text-xs tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t(x.title)}</span>
                <span className="block text-small text-fg-muted">{t(x.meta)}</span>
              </span>
              <Play aria-hidden className={cn("mt-1 size-4 shrink-0", x.id === active && "fill-accent text-accent-ink")} />
            </button>
          </li>
        ))}
      </ol>
      </Container>
    </div>
  );
}
