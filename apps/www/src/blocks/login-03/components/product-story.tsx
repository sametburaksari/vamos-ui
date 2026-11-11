"use client";

import * as React from "react";
import { Sparkline, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { KilnMark } from "../../auth-2fa-setup-01/components/kiln-brand";
import { chapters } from "./data";

/**
 * Left half of login-03: the product told as three short chapters (orders, stock, support) with a
 * counted-up number, a trend line and an overnight log. Chapters switch on click or arrow keys; no
 * autoplay, so nothing moves while someone types a password.
 */
export function ProductStory() {
  const { c, t, f, lang } = useBlockFormat();
  const [active, setActive] = React.useState(0);
  const tabs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const ch = chapters[active]!;

  const onKey = (e: React.KeyboardEvent) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + chapters.length) % chapters.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section aria-label={c("About Kiln & Linen", "Kiln & Linen hakkında")} className="surface-nav relative flex flex-col gap-10 overflow-hidden p-6 sm:p-10 lg:min-h-dvh lg:p-12">
      {/* faint ruled lines, like a ledger page */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(to_bottom,var(--nav-fg)_0,var(--nav-fg)_1px,transparent_1px,transparent_44px)]" />

      <div className="relative flex items-center justify-between gap-4 text-nav-fg-strong [&_span]:text-nav-fg-strong">
        <KilnMark />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-nav-fg/60!">{c("Back office", "Arka ofis")}</span>
      </div>

      <div className="relative grid max-w-[34rem] gap-8 lg:my-auto">
        <div role="tablist" aria-label={c("Product story", "Ürün hikâyesi")} onKeyDown={onKey} className="flex gap-1 border-b border-nav-line">
          {chapters.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`story-tab-${x.id}`}
              aria-selected={i === active}
              aria-controls="story-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "-mb-px flex items-baseline gap-2 rounded-t-ui-sm border-b-2 px-2 pb-2.5 pt-1 text-[13px] transition-colors focus-ring",
                i === active ? "border-accent text-nav-fg-strong" : "border-transparent text-nav-fg/65 hover:text-nav-fg-strong",
              )}
            >
              <span className="font-mono text-[10.5px] opacity-70">0{i + 1}</span>
              {t(x.tab)}
            </button>
          ))}
        </div>

        <div key={ch.id} id="story-panel" role="tabpanel" aria-labelledby={`story-tab-${ch.id}`} className="ui-rise grid gap-7">
          <div className="grid gap-3">
            <h2 className="font-display text-[length:calc(clamp(30px,3.2vw,44px)*var(--display-scale))] leading-[1.06] text-nav-fg-strong text-balance">{t(ch.headline)}</h2>
            <p className="max-w-[30rem] text-[14.5px] leading-relaxed text-nav-fg/80 text-pretty">{t(ch.body)}</p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="font-display text-[length:calc(52px*var(--display-scale))] leading-none text-nav-fg-strong tabular">
                <CountUp value={ch.kpi.value} locale={lang === "tr" ? "tr-TR" : "en-US"} duration={1100} />
                {ch.kpi.suffix}
              </p>
              <p className="mt-2 text-[12.5px] text-nav-fg/70">{t(ch.kpi.label)}</p>
            </div>
            <Sparkline values={ch.spark} variant="area" width={168} height={44} color="var(--accent)" label={c("Trend", "Eğilim")} />
          </div>

          <ol className="grid gap-0 rounded-ui border border-nav-line bg-nav-sub/40 text-[13px]">
            {ch.log.map((l, i) => (
              <li key={i} className={cn("grid grid-cols-[3.25rem_minmax(0,1fr)] gap-3 px-4 py-2.5", i > 0 && "border-t border-nav-line")}>
                <time className="font-mono text-[12px] text-nav-fg/60 tabular">{l.time}</time>
                <span className="text-nav-fg-strong/90">{t(l.text)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="relative hidden text-[12px] text-nav-fg/55 lg:block">
        {c("Overnight log for", "Gece kaydı:")} {f.date("2026-11-18", "long")}
      </p>
    </section>
  );
}
