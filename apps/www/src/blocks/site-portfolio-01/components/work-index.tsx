"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@vamos-ui/react";

export interface WorkIndexRow {
  id: string;
  no: string;
  title: string;
  clientType: string;
  discipline: string;
  year: number;
  href: string;
  image: { src: string; alt: string; width: number; height: number };
}

export interface WorkIndexProps {
  rows: WorkIndexRow[];
  /** Column headings, in order: number, project, client, discipline, year. */
  columns: [string, string, string, string, string];
  /** Accessible name of the list. */
  label: string;
}

const PREVIEW_W = 288;

/**
 * The project index (signature element): one hairline row per project. On a pointer device the
 * hovered row's cover follows the cursor in a small floating frame; keyboard focus shows the
 * same frame beside the focused row. On touch / narrow screens a thumbnail sits in the row.
 * The other rows dim while one is active. Reduced motion: the frame jumps instead of gliding.
 */
export function WorkIndex({ rows, columns, label }: WorkIndexProps) {
  const [active, setActive] = React.useState<number | null>(null);
  const [visible, setVisible] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLOListElement>(null);
  const pos = React.useRef({ x: 0, y: 0 });
  const raf = React.useRef(0);

  const place = React.useCallback((x: number, y: number) => {
    pos.current = { x, y };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = frameRef.current;
      if (!el) return;
      const h = el.offsetHeight || PREVIEW_W * 1.25;
      const maxX = window.innerWidth - PREVIEW_W - 16;
      const left = Math.max(16, Math.min(pos.current.x + 28, maxX));
      const top = Math.max(16, Math.min(pos.current.y - h / 2, window.innerHeight - h - 16));
      el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    });
  }, []);

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Hide the frame when the page scrolls under a still cursor (it would float over the wrong row).
  React.useEffect(() => {
    if (!visible) return;
    const hide = () => {
      const list = listRef.current;
      if (list && !list.matches(":hover") && !list.contains(document.activeElement)) setVisible(false);
    };
    window.addEventListener("scroll", hide, { passive: true });
    return () => window.removeEventListener("scroll", hide);
  }, [visible]);

  const onFocusRow = (i: number, e: React.FocusEvent<HTMLAnchorElement>) => {
    if (!e.currentTarget.matches(":focus-visible")) return;
    const r = e.currentTarget.getBoundingClientRect();
    setActive(i);
    setVisible(true);
    place(r.left + r.width * 0.58, r.top + r.height / 2);
  };

  return (
    <div className="relative">
      <div aria-hidden className="hidden grid-cols-[3.5rem_minmax(0,1fr)_12rem_9rem_4rem] gap-4 border-b border-fg pb-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted @3xl:grid">
        {columns.map((c, i) => (
          <span key={c} className={i === 4 ? "text-end" : undefined}>
            {c}
          </span>
        ))}
      </div>
      <ol
        ref={listRef}
        aria-label={label}
        data-active={active !== null && visible ? "" : undefined}
        className="group/index"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          place(e.clientX, e.clientY);
        }}
        onPointerLeave={() => setVisible(false)}
      >
        {rows.map((row, i) => (
          <li
            key={row.id}
            data-on={active === i && visible ? "" : undefined}
            className="border-b border-line transition-opacity duration-200 motion-reduce:transition-none group-data-[active]/index:opacity-35 data-[on]:!opacity-100"
          >
            <a
              href={row.href}
              data-index-row=""
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setActive(i);
                setVisible(true);
                place(e.clientX, e.clientY);
              }}
              onFocus={(e) => onFocusRow(i, e)}
              onBlur={() => setVisible(false)}
              className="group/row grid grid-cols-[2.5rem_minmax(0,1fr)_4rem] items-center gap-x-4 gap-y-1 py-4 outline-none focus-ring @3xl:grid-cols-[3.5rem_minmax(0,1fr)_12rem_9rem_4rem] @3xl:py-5"
            >
              <span className="font-mono text-small tabular-nums text-fg-muted transition-colors group-hover/row:text-accent-ink group-focus-visible/row:text-accent-ink">{row.no}</span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 text-balance font-display text-[clamp(1.5rem,1rem+2.4cqi,2.75rem)] @3xl:truncate leading-[1.05] transition-transform duration-300 ease-out motion-reduce:transition-none @3xl:group-hover/row:translate-x-2">
                  {row.title}
                </span>
                <ArrowUpRight aria-hidden className="size-5 shrink-0 -translate-x-1 opacity-0 transition duration-300 group-hover/row:translate-x-0 group-hover/row:opacity-100 group-focus-visible/row:opacity-100 motion-reduce:transition-none" />
              </span>
              {/* Touch and narrow screens: the cover sits in the row instead of following a cursor. */}
              <span aria-hidden className="row-span-2 justify-self-end @3xl:hidden">
                <img src={row.image.src.replace(/w=\d+&h=\d+/, "w=160&h=200")} alt="" width={64} height={80} loading="lazy" className="h-20 w-16 rounded-[2px] object-cover" />
              </span>
              <span className="col-start-2 text-small text-fg-muted @3xl:col-start-auto @3xl:text-body @3xl:text-fg">
                {row.clientType}
                <span className="@3xl:hidden">
                  {" · "}
                  {row.discipline} · {row.year}
                </span>
              </span>
              <span className="hidden text-fg-muted @3xl:block">{row.discipline}</span>
              <span className="hidden text-end font-mono tabular-nums text-fg-muted @3xl:block">{row.year}</span>
            </a>
          </li>
        ))}
      </ol>

      {/* The floating preview. Decorative: every row's link already names the project. */}
      <div
        ref={frameRef}
        aria-hidden
        data-visible={visible ? "" : undefined}
        style={{ width: PREVIEW_W }}
        className="pointer-events-none fixed start-0 top-0 z-30 hidden opacity-0 transition-[opacity,transform] duration-200 ease-out will-change-transform data-[visible]:opacity-100 motion-reduce:transition-none [@media(hover:hover)_and_(min-width:48rem)]:block"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-surface-2 shadow-[var(--popover-shadow)]">
          {rows.map((row, i) => (
            <img
              key={row.id}
              src={row.image.src.replace(/w=\d+&h=\d+/, "w=600&h=750")}
              alt=""
              width={600}
              height={750}
              className={cn("absolute inset-0 size-full scale-[1.04] object-cover opacity-0 transition duration-300 motion-reduce:transition-none", active === i && "scale-100 opacity-100")}
            />
          ))}
        </div>
        {active !== null ? (
          <p className="mt-2 flex justify-between gap-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg">
            <span className="truncate">{rows[active]?.title}</span>
            <span className="text-accent-ink">{rows[active]?.no}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
