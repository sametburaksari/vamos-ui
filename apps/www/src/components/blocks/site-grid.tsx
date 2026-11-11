"use client";

import * as React from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button, Skeleton } from "@vamos-ui/react";
import { BlockViewer } from "./block-viewer";
import type { BrowserBlock } from "./blocks-browser";

/** Width the sites are rendered at inside a thumbnail (a common laptop viewport). */
const SHOT_W = 1440;
const SHOT_H = 900;

/**
 * A live, scaled-down preview of /view/<name>: mounts when it nears the viewport and unmounts
 * again when far away, so a grid of fifty sites never keeps fifty apps alive. Inert: the
 * thumbnail is a picture, the card's title is the control.
 */
function SiteThumb({ name }: { name: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [near, setNear] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return () => ro.disconnect();
    }
    const io = new IntersectionObserver(([e]) => {
      setNear(e!.isIntersecting);
      if (!e!.isIntersecting) setLoaded(false);
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const scale = width / SHOT_W;
  return (
    <div ref={ref} inert aria-hidden className="relative aspect-[16/10] overflow-hidden bg-scene">
      {!loaded ? (
        <div className="absolute inset-0 grid content-start gap-3 p-[6%]">
          <Skeleton className="h-3 w-1/3 rounded-ui-sm" />
          <Skeleton className="h-10 w-3/4 rounded-ui-sm" />
          <Skeleton className="h-3 w-1/2 rounded-ui-sm" />
          <Skeleton className="mt-4 h-24 rounded-ui" />
        </div>
      ) : null}
      {near && width ? (
        <iframe
          src={`/view/${name}`}
          title=""
          tabIndex={-1}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="pointer-events-none absolute start-0 top-0 origin-top-left border-0 bg-scene transition-opacity duration-300 motion-reduce:transition-none rtl:origin-top-right"
          style={{ width: SHOT_W, height: SHOT_H, transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
}

function SiteCard({ block, onSelect, heading: Heading }: { block: BrowserBlock; onSelect: () => void; heading: "h2" | "h3" }) {
  return (
    <li
      data-site-card={block.name}
      className="relative flex flex-col overflow-hidden rounded-ui-lg border border-line bg-surface outline-offset-2 transition-colors hover:border-fg-subtle has-[[data-site-open]:focus-visible]:outline-2 has-[[data-site-open]:focus-visible]:outline-[var(--ring)] has-[[data-site-open]:focus-visible]:outline-solid"
    >
      <SiteThumb name={block.name} />
      <div className="flex items-start justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0">
          <Heading className="text-[14px] font-semibold tracking-[-0.01em]">
            {/* Stretched over the card: the whole card opens the full preview. */}
            <button type="button" data-site-open="" onClick={onSelect} className="text-start after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {block.title}
            </button>
          </Heading>
          <p className="mt-0.5 font-mono text-[11.5px] text-fg-subtle">{block.name}</p>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-fg-muted">{block.description}</p>
        </div>
        <a
          href={`/view/${block.name}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${block.title} in a new tab`}
          className="relative z-[1] inline-flex size-8 shrink-0 items-center justify-center rounded-ui-sm border border-line text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring"
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
    </li>
  );
}

/**
 * /websites: a thumbnail grid of whole sites. Selecting a card shows its full
 * preview and code above the grid (`?block=<name>`, shareable); "All sites" goes back.
 */
export function SiteGrid({ blocks, selected, onSelect, cardHeading = "h2" }: { blocks: BrowserBlock[]; selected: string | null; onSelect: (name: string | null) => void; cardHeading?: "h2" | "h3" }) {
  const current = selected ? blocks.find((b) => b.name === selected) : undefined;
  const detail = React.useRef<HTMLDivElement>(null);
  const lastCard = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!current) return;
    const el = detail.current;
    el?.scrollIntoView({ block: "start" });
    const heading = el?.querySelector<HTMLElement>("h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, [current]);

  const back = () => {
    onSelect(null);
    const name = lastCard.current;
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-site-card="${name}"] [data-site-open]`)?.focus());
  };

  return (
    <div className="mt-10 grid gap-10">
      {current ? (
        <div ref={detail} className="grid scroll-mt-20 gap-4">
          <Button size="sm" variant="ghost" className="justify-self-start" onClick={back}>
            <ArrowLeft aria-hidden className="rtl:-scale-x-100" /> All sites
          </Button>
          <BlockViewer key={current.name} name={current.name} title={current.title} description={current.description} files={current.files} />
        </div>
      ) : null}
      <ul aria-label="Websites" className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {blocks.map((b) => (
          <SiteCard
            key={b.name}
            block={b}
            heading={cardHeading}
            onSelect={() => {
              lastCard.current = b.name;
              onSelect(b.name);
            }}
          />
        ))}
      </ul>
    </div>
  );
}
