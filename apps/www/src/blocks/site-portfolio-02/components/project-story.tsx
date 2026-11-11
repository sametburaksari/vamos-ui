"use client";

import * as React from "react";
import { cn, Image } from "@vamos-ui/react";
import { copyFor, type Project, type SiteLocale } from "./content";
import { PlanDrawing } from "./plan-drawing";

const figNo = (i: number) => String(i + 1).padStart(2, "0");

/**
 * The other half of the signature: editorial captions in the margin. Text and figures run in
 * the main columns; the margin holds every caption as a numbered list. The caption of the
 * figure in view is highlighted as you scroll, and choosing a caption brings its figure up and
 * marks it. Hovering a figure lights its caption, and the other way round.
 */
export function ProjectStory({ project, locale }: { project: Project; locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [current, setCurrent] = React.useState(0);
  const [hover, setHover] = React.useState<number | null>(null);
  const refs = React.useRef<(HTMLElement | null)[]>([]);
  const lit = hover ?? current;
  const figId = (i: number) => `fig-${project.id}-${figNo(i)}`;

  React.useEffect(() => {
    const els = refs.current.filter(Boolean) as HTMLElement[];
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrent(Number((visible.target as HTMLElement).dataset.fig));
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [project.id]);

  const go = (i: number) => {
    const el = refs.current[i];
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.focus({ preventScroll: true });
    setCurrent(i);
  };

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-10 @3xl:grid-cols-12">
      {/* Margin: the caption index (first on phones, sticky beside the story on wide screens). */}
      <aside aria-labelledby={`${project.id}-captions`} className="@3xl:order-2 @3xl:col-span-4 @3xl:col-start-9">
        <div className="@3xl:sticky @3xl:top-24">
          <h2 id={`${project.id}-captions`} className="border-b border-fg pb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
            {t({ en: "Figures", tr: "Şekiller" })} · {project.figures.length}
          </h2>
          <ol className="divide-y divide-line">
            {project.figures.map((f, i) => (
              <li key={i}>
                <a
                  href={`#${figId(i)}`}
                  aria-current={i === current ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    go(i);
                  }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  className={cn(
                    "grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2 py-3 text-small transition-colors focus-ring",
                    i === lit ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <span className={cn("font-mono text-[11px] tracking-[0.08em]", i === lit ? "text-accent-ink" : "")}>
                    <span aria-hidden className={cn("me-1 inline-block h-px w-2 align-middle transition-all", i === lit ? "w-3 bg-accent" : "bg-line")} />
                    {figNo(i)}
                  </span>
                  <span className="text-pretty">
                    {t(f.caption)}
                    {f.credit ? <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle">{t({ en: "Photo", tr: "Fotoğraf" })}: {f.credit}</span> : null}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      {/* Story */}
      <div className="flex min-w-0 flex-col gap-12 @3xl:order-1 @3xl:col-span-8">
        {(project.story ?? []).map((block, k) => {
          if (block.kind === "text") {
            return (
              <section key={k} className="grid gap-3 @3xl:grid-cols-8 @3xl:gap-x-5">
                <h3 className="font-display text-h3 @3xl:col-span-3">{t(block.title)}</h3>
                <p className="max-w-[60ch] text-pretty text-fg-muted @3xl:col-span-5">{t(block.body)}</p>
              </section>
            );
          }
          const i = block.fig;
          const f = project.figures[i]!;
          return (
            <figure
              key={k}
              id={figId(i)}
              data-fig={i}
              tabIndex={-1}
              ref={(el) => {
                refs.current[i] = el;
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              aria-labelledby={`${figId(i)}-cap`}
              className={cn("scroll-mt-24 outline-none ring-offset-4 ring-offset-scene transition-shadow", i === lit ? "ring-1 ring-accent" : "ring-1 ring-transparent")}
            >
              {f.kind === "plan" && project.plan ? (
                <div className="border border-line">
                  <PlanDrawing rooms={project.plan} label={t(f.alt)} pick={t} />
                </div>
              ) : (
                <Image src={f.src!} width={f.width} height={f.height} focal={f.focal} alt={t(f.alt)} aspect={f.width! > f.height! ? "3/2" : "4/5"} sizes="(min-width: 1024px) 60vw, 100vw" priority={k === 0} />
              )}
              <figcaption id={`${figId(i)}-cap`} className="mt-2 flex gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">
                <span className={cn("shrink-0 whitespace-nowrap", i === lit ? "text-accent-ink" : "text-fg")}>
                  {t({ en: "Fig.", tr: "Şek." })} {figNo(i)}
                </span>
                <span className="sr-only">{t(f.caption)}</span>
                <span aria-hidden className="truncate normal-case tracking-normal">
                  {t(f.caption)}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
