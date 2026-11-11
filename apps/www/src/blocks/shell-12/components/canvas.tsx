"use client";

import * as React from "react";
import { EyeOff, Menu } from "lucide-react";
import { cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { productPhoto, products, productsById } from "../../_shared/products";
import type { Section } from "./data";

export type Device = "desktop" | "tablet" | "mobile";
export const deviceWidth: Record<Device, number> = { desktop: 1120, tablet: 768, mobile: 375 };

const toneClass: Record<Section["tone"], string> = {
  plain: "bg-surface text-fg",
  inset: "bg-surface-2 text-fg",
  inverse: "bg-fg text-scene",
};

/**
 * The page preview. Sections lay out by the frame's own width (container queries), so the
 * device switch shows the real phone / tablet layout. Click or Enter selects a section.
 */
export function Canvas({ sections, selectedId, onSelect, device }: { sections: Section[]; selectedId: string | null; onSelect: (id: string) => void; device: Device }) {
  const { t, c } = useBlockFormat();
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-surface-2 px-3 py-6 md:px-8 md:py-10" onClick={(e) => e.target === e.currentTarget && onSelect("")}>
      <div
        className="@container mx-auto overflow-hidden rounded-ui border border-line bg-surface shadow-xl transition-[max-width] duration-300 ease-out motion-reduce:transition-none"
        style={{ maxWidth: deviceWidth[device] }}
      >
        <div className="flex h-7 items-center gap-1.5 border-b border-line bg-surface-2 px-3" aria-hidden>
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="mx-auto truncate font-mono text-[10.5px] text-fg-subtle">kilnlinen.example.com</span>
        </div>
        {sections.map((s) => {
          const selected = s.id === selectedId;
          return (
            <div
              key={s.id}
              data-section={s.id}
              className={cn(
                "group/section relative",
                "after:pointer-events-none after:absolute after:inset-0 after:z-20 after:border-2 after:transition-colors",
                selected ? "after:border-accent-ink" : "after:border-transparent hover:after:border-[color-mix(in_srgb,var(--accent-ink)_45%,transparent)] has-[button:focus-visible]:after:border-accent-ink",
                s.hidden && "opacity-35",
              )}
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(s.id)}
                className="absolute inset-0 z-10 cursor-default outline-none"
              >
                <span className="sr-only">{c(`Select section: ${t(s.name)}`, `Bölümü seç: ${t(s.name)}`)}</span>
              </button>
              <span
                className={cn(
                  "absolute start-0 top-0 z-30 flex items-center gap-1 rounded-ee-ui-sm bg-accent-ink px-2 py-0.5 text-[10.5px] font-medium text-scene transition-opacity",
                  selected ? "opacity-100" : "opacity-0 group-hover/section:opacity-100",
                )}
                aria-hidden
              >
                {s.hidden && <EyeOff className="size-3" />}
                {t(s.name)}
              </span>
              <SectionPreview s={s} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FakeButton({ children, tone }: { children: React.ReactNode; tone: Section["tone"] }) {
  return <span className={cn("inline-flex h-10 items-center rounded-ui px-5 text-[13px] font-semibold", tone === "inverse" ? "bg-scene text-fg" : "bg-fg text-scene")}>{children}</span>;
}

function SectionPreview({ s }: { s: Section }) {
  const { t, c, f } = useBlockFormat();
  const center = s.align === "center";
  const pad = { paddingBlock: s.space };
  const items = t(s.body).split(" · ");

  if (s.type === "nav") {
    return (
      <div className={cn("flex items-center gap-6 px-6", toneClass[s.tone])} style={pad}>
        <span className="font-display text-[20px] leading-none tracking-tight">{t(s.heading)}</span>
        <span className="ms-auto hidden gap-5 text-[13px] text-current/70 @md:flex">
          {items.map((x) => <span key={x}>{x}</span>)}
        </span>
        <Menu className="ms-auto size-4 @md:hidden" aria-hidden />
      </div>
    );
  }
  if (s.type === "footer") {
    return (
      <div className={cn("flex flex-col gap-2 border-t border-line px-6 text-[12.5px] @md:flex-row @md:items-center", toneClass[s.tone])} style={pad}>
        <span className="font-display text-[15px]">{t(s.heading)}</span>
        <span className="text-current/60 @md:ms-auto">{t(s.body)}</span>
      </div>
    );
  }
  if (s.type === "features") {
    return (
      <div className={cn("px-6", toneClass[s.tone])} style={pad}>
        <h2 className={cn("font-display text-2xl tracking-tight @lg:text-3xl", center && "text-center")}>{t(s.heading)}</h2>
        <ul className="mt-6 grid gap-3 @md:grid-cols-3">
          {items.map((x, i) => (
            <li key={x} className={cn("border-t border-current/15 pt-3 text-[13.5px]", center && "@md:text-center")}>
              <span className="block font-mono text-[11px] text-current/50">0{i + 1}</span>
              {x}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (s.type === "products") {
    return (
      <div className={cn("px-6", toneClass[s.tone])} style={pad}>
        <div className={cn("flex items-end gap-4", center && "justify-center text-center")}>
          <h2 className="font-display text-2xl tracking-tight @lg:text-3xl">{t(s.heading)}</h2>
          {s.button && !center && <span className="ms-auto text-[13px] underline underline-offset-4">{t(s.button)}</span>}
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 @lg:grid-cols-4">
          {items.map((x, i) => {
            // Names typed into the inspector that match a catalogue product show its photo and price.
            const p = products.find((pr) => pr.name.en === x || pr.name.tr === x);
            return (
              <li key={x}>
                {p ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={productPhoto(p, 320)} alt="" loading="lazy" className="block aspect-[4/5] w-full rounded-ui-sm border border-line bg-surface-2 object-cover" />
                ) : (
                  <span className="block aspect-[4/5] rounded-ui-sm border border-line bg-surface-2" style={{ backgroundImage: `repeating-linear-gradient(${35 + i * 30}deg, transparent 0 14px, color-mix(in srgb, var(--fg) 4%, transparent) 14px 15px)` }} />
                )}
                <span className="mt-2 block truncate text-[13px]">{x}</span>
                <span className="block text-[12px] text-current/60 tabular">{f.currency(p ? Number(p.price.amount) : [1890, 2450, 3200, 1650][i % 4]!, "TRY", { maximumFractionDigits: 0 })}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  if (s.type === "quote") {
    return (
      <figure className={cn("px-6", toneClass[s.tone], center && "text-center")} style={pad}>
        <blockquote className="mx-auto max-w-2xl font-display text-2xl leading-snug tracking-tight text-balance @lg:text-[30px]">{t(s.heading)}</blockquote>
        <figcaption className="mt-4 text-[13px] text-current/60">{t(s.body)}</figcaption>
      </figure>
    );
  }
  // hero + cta. A start-aligned hero gets the season's photo beside the copy on wide frames.
  const photo = s.type === "hero" && !center;
  return (
    <div className={cn("px-6 @lg:px-12", toneClass[s.tone], center && "text-center", photo && "@lg:grid @lg:grid-cols-[1.15fr_1fr] @lg:items-center @lg:gap-10")} style={pad}>
      <div className={cn("max-w-xl", center && "mx-auto")}>
        <h2 className={cn("font-display tracking-tight text-balance", s.type === "hero" ? "text-[40px] leading-[1.02] @lg:text-6xl" : "text-3xl @lg:text-4xl")}>{t(s.heading)}</h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-pretty text-current/70">{t(s.body)}</p>
        {s.button && (
          <div className="mt-6">
            <FakeButton tone={s.tone}>{t(s.button)}</FakeButton>
          </div>
        )}
      </div>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={productPhoto(productsById["pr-13"]!, 720)}
          alt={c("A lit beeswax candle on a soft wool throw", "Yumuşak yün battaniye üzerinde yanan balmumu mum")}
          loading="lazy"
          className="hidden aspect-[4/5] w-full rounded-ui object-cover @lg:block"
        />
      )}
    </div>
  );
}
