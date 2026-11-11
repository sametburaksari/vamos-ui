"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { PhoneFrame } from "./phone";

export interface ScrollPhoneChapter {
  id: string;
  kicker: string;
  title: string;
  text: string;
  points: string[];
  /** The phone screen for this chapter (plain JSX). */
  screen: React.ReactNode;
}

/**
 * The signature of the Tempo Run site: a sticky phone whose screen swaps as the feature chapters
 * scroll past (IntersectionObserver on the chapter that crosses the middle of the viewport).
 * The numbered rail beside the phone jumps to a chapter. Under 64rem the phone is repeated inside
 * each chapter instead of sticking. Reduced motion: screens swap without the slide.
 */
export function ScrollPhone({ chapters, navLabel, screenLabel }: { chapters: ScrollPhoneChapter[]; navLabel: string; screenLabel: string }) {
  const [active, setActive] = React.useState(0);
  const refs = React.useRef<(HTMLElement | null)[]>([]);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [chapters.length]);

  const go = (i: number) => {
    const el = refs.current[i];
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    setActive(i);
  };

  const current = chapters[active] ?? chapters[0]!;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="grid gap-x-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" data-scroll-phone="" data-active-screen={current.id}>
      {/* Sticky phone + rail (wide screens) */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--topbar-h)+1.5rem)] flex h-[calc(100dvh-var(--topbar-h)-3rem)] max-h-[46rem] min-h-[38rem] items-center justify-end gap-10">
          <nav aria-label={navLabel} className="flex flex-col items-end gap-1 self-center">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => go(i)}
                aria-current={i === active ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-ui-sm py-1.5 ps-2 pe-1 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors focus-ring",
                  i === active ? "text-fg" : "text-fg-subtle hover:text-fg-muted",
                )}
              >
                <span className="max-w-[9rem] truncate text-end">{c.kicker}</span>
                <span className="tabular">{pad(i + 1)}</span>
                <span aria-hidden className={cn("h-px transition-[width,background-color] duration-300 motion-reduce:transition-none", i === active ? "w-10 bg-accent" : "w-4 bg-line")} />
              </button>
            ))}
          </nav>
          <div role="img" aria-label={`${screenLabel}: ${current.title}`} className="relative">
            <PhoneFrame>
              <div className="relative flex-1" aria-hidden>
                {chapters.map((c, i) => (
                  <div
                    key={c.id}
                    data-screen={c.id}
                    data-active={i === active ? "" : undefined}
                    className={cn(
                      "absolute inset-0 flex flex-col transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
                      i === active ? "translate-y-0 opacity-100" : i < active ? "-translate-y-6 opacity-0" : "translate-y-6 opacity-0",
                    )}
                  >
                    {c.screen}
                  </div>
                ))}
              </div>
            </PhoneFrame>
            <span aria-hidden className="absolute -end-3 -bottom-3 -z-10 h-2/3 w-2/3 rounded-[3rem] border border-line" />
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div>
        {chapters.map((c, i) => (
          <article
            key={c.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            data-chapter={c.id}
            aria-labelledby={`tr-ch-${c.id}`}
            className="flex flex-col justify-center border-t border-line py-14 first:border-t-0 lg:min-h-[82vh] lg:py-0"
          >
            <div className="flex items-baseline gap-4 font-mono text-xs tracking-[0.1em] uppercase">
              <span className={cn("tabular transition-colors", i === active ? "text-accent-ink" : "text-fg-subtle")}>
                {pad(i + 1)} / {pad(chapters.length)}
              </span>
              <span className="text-fg-muted">{c.kicker}</span>
            </div>
            <h3 id={`tr-ch-${c.id}`} className="mt-5 max-w-[16ch] font-display text-display-m text-fg">
              {c.title}
            </h3>
            <p className="mt-5 max-w-[46ch] text-lead text-fg-muted">{c.text}</p>
            <ul className="m-0 mt-8 grid max-w-[46ch] list-none gap-0 p-0">
              {c.points.map((p) => (
                <li key={p} className="flex gap-3 border-t border-line py-3 text-small text-fg">
                  <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex justify-center lg:hidden" aria-hidden>
              <PhoneFrame size="sm">
                <div className="flex flex-1 flex-col">{c.screen}</div>
              </PhoneFrame>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
