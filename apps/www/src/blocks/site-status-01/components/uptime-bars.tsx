"use client";

import * as React from "react";
import { cn, TooltipContent, TooltipRoot, TooltipTrigger } from "@vamos-ui/react";
import { copyFor, healthLabel, healthTone, historyFor, uptimeOf, type DayCell, type SiteLocale, type StatusComponent } from "./content";
import { useStatus } from "./status-provider";
import { CountUp, Reveal } from "@vamos-ui/react/motion";

/**
 * The signature: 90 daily bars per component. Hover or focus a day for a tooltip with its date,
 * uptime and incidents; one tab stop per row, arrows / Home / End move between days, and Enter
 * on a day with an incident opens it.
 */
export function UptimeBars({ component, locale }: { component: StatusComponent; locale: SiteLocale }) {
  const { t, f, day, intl } = copyFor(locale);
  const { open } = useStatus();
  const cells = React.useMemo(() => historyFor(component), [component]);
  const total = uptimeOf(cells);
  const last = cells.length - 1;
  const [focusIndex, setFocusIndex] = React.useState(last);
  const [active, setActive] = React.useState<number | null>(null);
  const barRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const rowRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);

  // Place the (row-anchored) tooltip over the active bar.
  React.useLayoutEffect(() => {
    if (active === null) return;
    const bar = barRefs.current[active];
    const row = rowRef.current;
    if (!bar || !row) return;
    const b = bar.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === "rtl";
    setOffset(rtl ? r.right - b.right : b.left - r.left + b.width / 2);
  }, [active]);

  const describe = (c: DayCell) => {
    if (c.health === "none") return t({ en: "No data — not launched yet", tr: "Veri yok — henüz yayında değildi" });
    const parts = [t(healthLabel[c.health === "operational" ? "operational" : c.health])];
    if (c.health !== "maintenance") parts.push(t({ en: `${f.number(c.uptime, { maximumFractionDigits: 2 })}% uptime`, tr: `%${f.number(c.uptime, { maximumFractionDigits: 2 })} erişilebilir` }));
    return parts.join(" · ");
  };

  const move = (to: number) => {
    const i = Math.max(0, Math.min(last, to));
    setFocusIndex(i);
    setActive(i);
    barRefs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = rtl ? -1 : 1;
    if (e.key === "ArrowRight") move(i + next);
    else if (e.key === "ArrowLeft") move(i - next);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(last);
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  };

  const cell = active !== null ? cells[active] : undefined;
  // Fixed decimals while counting, so the figure never changes width.
  const totalDigits = Math.min(3, (String(total).split(".")[1] ?? "").length);
  const id = `st-up-${component.id}`;

  return (
    <Reveal effect="fade" duration={700} className="st-up min-w-0">
      <TooltipRoot open={cell !== undefined} onOpenChange={() => {}}>
        <TooltipTrigger asChild>
          <div
            ref={rowRef}
            role="group"
            aria-label={t({ en: `${t(component.name)}, last 90 days`, tr: `${t(component.name)}, son 90 gün` })}
            aria-describedby={`${id}-sum`}
            onPointerLeave={() => setActive(null)}
            className="flex h-9 items-stretch gap-px sm:gap-[3px]"
          >
            {cells.map((c, i) => (
              <button
                key={c.date}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                type="button"
                tabIndex={i === focusIndex ? 0 : -1}
                aria-label={`${day(c.date)}: ${describe(c)}${c.incidents.length ? ` · ${c.incidents.map((x) => t(x.title)).join(", ")}` : ""}`}
                aria-disabled={c.incidents.length ? undefined : true}
                onPointerEnter={() => setActive(i)}
                onFocus={() => {
                  setFocusIndex(i);
                  setActive(i);
                }}
                onBlur={() => setActive((a) => (a === i ? null : a))}
                onKeyDown={(e) => onKeyDown(e, i)}
                onClick={() => {
                  const first = c.incidents[0];
                  if (first) open(first.id);
                }}
                style={{ "--st-i": i } as React.CSSProperties}
                className={cn(
                  "st-bar min-w-0 flex-1 rounded-[2px] outline-none transition-[transform,opacity] duration-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
                  c.health === "none" ? "bg-track" : healthTone[c.health].fill,
                  c.health === "operational" && "opacity-80",
                  c.incidents.length ? "cursor-pointer" : "cursor-default",
                  active === i && "scale-y-[1.12] opacity-100",
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" alignOffset={offset - 128} sideOffset={8} avoidCollisions collisionPadding={12} className="w-64 max-w-[calc(100vw-2rem)] p-0">
          {cell ? (
            <div className="grid gap-1.5 px-3 py-2.5 text-start">
              <span className="text-[12px] font-semibold text-fg">{day(cell.date)}</span>
              <span className="flex items-center gap-2 text-[12px] text-fg-muted">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", cell.health === "none" ? "bg-track" : healthTone[cell.health].fill)} />
                {describe(cell)}
              </span>
              {cell.incidents.map((x) => (
                <span key={x.id} className="border-t border-line pt-1.5 text-[12px] text-fg">
                  {t(x.title)}
                  <span className="block text-[11px] text-fg-muted">{t({ en: "Click or press Enter for the timeline", tr: "Zaman çizelgesi için tıklayın ya da Enter’a basın" })}</span>
                </span>
              ))}
            </div>
          ) : null}
        </TooltipContent>
      </TooltipRoot>
      <div id={`${id}-sum`} className="mt-1.5 flex items-center justify-between gap-3 text-[11px] text-fg-subtle">
        <span>{t({ en: "90 days ago", tr: "90 gün önce" })}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
        <span className="text-fg-muted tabular">
          {locale === "tr" ? "%" : null}
          <CountUp value={total} from={99} duration={900} locale={intl} format={{ minimumFractionDigits: totalDigits, maximumFractionDigits: totalDigits }} />
          {locale === "tr" ? " erişilebilirlik" : "% uptime"}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line" />
        <span>{t({ en: "Today", tr: "Bugün" })}</span>
      </div>
    </Reveal>
  );
}
