"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { BlockImage } from "@vamos-ui/react/blocks";
import { splitNotes, type SiteLocale } from "./content";

export type ResolvedBlock =
  | { type: "p" | "h2" | "quote"; text: string }
  | { type: "figure"; image: { src: string; width: number; height: number; alt: string }; caption: string };

interface ArticleBodyProps {
  locale: SiteLocale;
  blocks: ResolvedBlock[];
  /** Note texts; note `n` is `notes[n - 1]`. */
  notes: string[];
  minutes: number;
  labels: { progress: string; minutesLeft: string; done: string; notes: string; note: string; back: string };
}

const fill = (template: string, n: number | string) => template.replace("{n}", String(n));

/**
 * The essay body with the site's signature: a reading-progress bar pinned to the top of the
 * window (with minutes left), and footnotes that sit beside their paragraph as side notes when
 * the column is wide (≥ 64rem), or collect as endnotes below it otherwise. A note number jumps
 * to the side note when it is visible, else to the endnote; both link back.
 */
export function ArticleBody({ blocks, notes, minutes, labels }: ArticleBodyProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  /** The bar and the pill are portalled to the site root, above the sticky navbar's stacking context. */
  const [host, setHost] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => setHost(bodyRef.current?.closest<HTMLElement>("[data-site-shell]") ?? null), []);

  // Reading progress: how far the reading line (30% down the window) has moved through the body.
  React.useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = bodyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const line = window.innerHeight * 0.3;
      const p = Math.min(1, Math.max(0, (line - rect.top) / Math.max(1, rect.height)));
      setProgress(p);
      setStarted(rect.top < line);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Side notes line up with the line that references them (without overlapping each other).
  React.useLayoutEffect(() => {
    const root = bodyRef.current;
    if (!root) return;
    const place = () => {
      // Absolutely positioned in the margin, so a note never stretches its paragraph; a note
      // that would overlap the previous one moves down below it.
      let lastBottom = -Infinity;
      root.querySelectorAll<HTMLElement>("[data-sidenote]").forEach((note) => {
        if (note.offsetParent === null) return;
        const col = note.parentElement!;
        const ref = root.querySelector<HTMLElement>(`#ref-${note.dataset.sidenote}`);
        if (!ref) return;
        const colTop = col.getBoundingClientRect().top + window.scrollY;
        const want = ref.getBoundingClientRect().top + window.scrollY - 6;
        const top = Math.max(want, lastBottom + 16);
        note.style.top = `${top - colTop}px`;
        lastBottom = top + note.offsetHeight;
      });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(root);
    return () => ro.disconnect();
  }, [blocks]);

  const onRef = (n: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const side = document.getElementById(`side-${n}`);
    setActive(n);
    if (side && side.offsetParent !== null) {
      e.preventDefault();
      side.focus({ preventScroll: true });
      side.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  const left = Math.max(0, Math.ceil(minutes * (1 - progress)));
  const pct = Math.round(progress * 100);
  const valueText = progress >= 1 ? labels.done : `${pct}% · ${fill(labels.minutesLeft, left)}`;

  const renderText = (text: string) =>
    splitNotes(text).map((part, i) =>
      typeof part === "number" ? (
        <sup key={i} className="ms-0.5">
          <a
            id={`ref-${part}`}
            href={`#note-${part}`}
            aria-label={fill(labels.note, part)}
            data-active={active === part ? "" : undefined}
            onClick={onRef(part)}
            onMouseEnter={() => setActive(part)}
            onFocus={() => setActive(part)}
            className="rounded-[2px] px-0.5 font-mono text-[0.7em] font-semibold text-accent-ink no-underline transition-colors hover:bg-accent-soft focus-ring data-[active]:bg-accent-soft"
          >
            {part}
          </a>
        </sup>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );

  const grid = "grid gap-x-16 @5xl:grid-cols-[minmax(0,40rem)_15rem] @5xl:justify-center";

  return (
    <>
      {/* The pinned bar. */}
      {host
        ? createPortal(
            <>
      <div
        role="progressbar"
        aria-label={labels.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={valueText}
        className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
      >
        <div className="h-full bg-accent transition-[width] duration-150 ease-out motion-reduce:transition-none" style={{ width: `${progress * 100}%` }} />
      </div>
      <p
        aria-hidden
        data-shown={started && progress < 1 ? "" : undefined}
        className="surface-popover pointer-events-none fixed bottom-4 end-4 z-40 flex items-center gap-2 rounded-full px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted opacity-0 transition-opacity duration-200 data-[shown]:opacity-100 motion-reduce:transition-none"
      >
        <span className="tabular text-fg">{pct}%</span>
        <span aria-hidden className="h-3 w-px bg-line" />
        <span className="tabular">{fill(labels.minutesLeft, left)}</span>
      </p>

            </>,
            host,
          )
        : null}

      <div ref={bodyRef} className="vb-essay-body flex flex-col gap-7 text-[1.1875rem] leading-[1.7] text-fg @2xl:text-[1.25rem]">
        {blocks.map((block, i) => {
          if (block.type === "figure") {
            return (
              <figure key={i} className={`${grid} my-6 gap-y-3`}>
                <BlockImage src={block.image.src} width={block.image.width} height={block.image.height} alt={block.image.alt} aspect="3:2" sizes="(min-width: 64rem) 40rem, 100vw" className="rounded-ui" />
                <figcaption className="self-end border-s-2 border-accent ps-3 text-small leading-normal text-fg-muted">{block.caption}</figcaption>
              </figure>
            );
          }
          if (block.type === "h2") {
            return (
              <div key={i} className={grid}>
                <h2 className="mt-6 font-display text-display-m text-balance">{block.text}</h2>
              </div>
            );
          }
          if (block.type === "quote") {
            return (
              <div key={i} className={grid}>
                <blockquote className="my-4 border-y border-line py-6 font-display text-[1.9rem] leading-tight text-accent-ink italic text-balance @2xl:text-[2.25rem]">{block.text}</blockquote>
              </div>
            );
          }
          const refs = splitNotes(block.text).filter((p): p is number => typeof p === "number");
          const first = i === 0;
          return (
            <div key={i} className={grid} data-sn-row="">
              <p className={first ? "first-letter:float-start first-letter:me-2 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:text-accent-ink" : undefined}>
                {renderText(block.text)}
              </p>
              {refs.length ? (
                <div className="relative hidden @5xl:block">
                  {refs.map((n) => (
                    <p
                      key={n}
                      id={`side-${n}`}
                      tabIndex={-1}
                      data-sidenote={n}
                      role="note"
                      data-active={active === n ? "" : undefined}
                      onMouseEnter={() => setActive(n)}
                      className="absolute inset-x-0 top-0 border-s-2 border-line ps-3 text-small leading-normal text-fg-muted outline-none transition-colors duration-200 data-[active]:border-accent data-[active]:text-fg focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="me-1.5 font-mono text-[11px] font-semibold text-accent-ink">{n}</span>
                      {notes[n - 1]}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Endnotes: the same notes, for columns too narrow for the margin. */}
        <section aria-labelledby="endnotes-title" className={`${grid} @5xl:hidden`}>
          <div className="mt-6 border-t border-line pt-6">
            <h2 id="endnotes-title" className="mb-4 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">
              {labels.notes}
            </h2>
            <ol className="flex flex-col gap-3 text-small leading-normal text-fg-muted">
              {notes.map((note, i) => (
                <li key={i} id={`note-${i + 1}`} tabIndex={-1} className="grid grid-cols-[1.5rem_1fr] gap-2 outline-none target:text-fg">
                  <span className="font-mono text-[11px] font-semibold text-accent-ink">{i + 1}</span>
                  <span>
                    {note}{" "}
                    <a href={`#ref-${i + 1}`} aria-label={labels.back} className="rounded-[2px] font-mono text-accent-ink focus-ring">
                      ↩
                    </a>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}
