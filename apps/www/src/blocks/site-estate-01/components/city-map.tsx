"use client";

import * as React from "react";
import { cn } from "@vamos-ui/react";
import { hoods, tl, type Listing } from "./content";
import { useEstate } from "./estate-provider";

/**
 * A neutral, hand-drawn map of the Bosphorus (not to scale) in theme tokens, so it follows
 * light and dark. Pins are real buttons placed by percentage over the 1000 × 700 drawing.
 */
function MapArt({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 1000 700" role="img" aria-label={title} className="absolute inset-0 size-full">
      <rect width="1000" height="700" fill="var(--color-surface)" />
      {/* blocks */}
      <g fill="var(--color-surface-2)">
        {Array.from({ length: 70 }, (_, i) => {
          const x = (i * 137) % 1000;
          const y = ((i * 89) % 700) + ((i * 7) % 13);
          return <rect key={i} x={x} y={y} width={36 + (i % 4) * 14} height={24 + (i % 3) * 12} rx="3" />;
        })}
      </g>
      {/* roads */}
      <g fill="none" stroke="var(--color-line)" strokeLinecap="round">
        <path d="M0 260 C200 250 300 300 470 300" strokeWidth="10" />
        <path d="M340 0 C360 160 380 300 420 420" strokeWidth="8" />
        <path d="M600 330 C700 380 820 420 1000 430" strokeWidth="10" />
        <path d="M640 520 C720 540 860 520 1000 560" strokeWidth="8" />
        <path d="M720 700 C740 600 760 520 780 300 C790 200 820 120 860 0" strokeWidth="6" />
        <path d="M60 470 C160 470 300 500 420 480" strokeWidth="6" />
      </g>
      {/* water */}
      <path
        d="M640 0 C600 120 520 200 540 300 C552 360 500 400 470 450 C380 470 200 500 0 520 L0 700 L640 700 C606 650 586 590 566 520 C600 440 640 380 642 300 C648 200 716 110 760 0 Z"
        fill="var(--color-accent-soft)"
        stroke="var(--color-line)"
        strokeWidth="2"
      />
      <path d="M476 436 C400 404 300 384 160 330 L156 346 C300 404 400 430 466 456 Z" fill="var(--color-accent-soft)" stroke="var(--color-line)" strokeWidth="2" />
      {/* labels */}
      <g fill="var(--color-fg-subtle)" fontFamily="var(--font-code)" fontSize="15" letterSpacing="3">
        <text x="120" y="170">BEYOĞLU · ŞİŞLİ</text>
        <text x="380" y="120">BEŞİKTAŞ</text>
        <text x="790" y="330">ÜSKÜDAR</text>
        <text x="800" y="620">KADIKÖY</text>
        <text x="160" y="620">MARMARA</text>
      </g>
      <text x="578" y="250" fill="var(--color-fg-subtle)" fontFamily="var(--font-heading)" fontStyle="italic" fontSize="26" transform="rotate(-68 578 250)">
        Bosphorus · Boğaz
      </text>
    </svg>
  );
}

/** Read after the visible price, so the button's name starts with what it shows. */
const pinLabel = (l: Listing, locale: "en" | "tr", t: (v: { en: string; tr: string }) => string) => `${hoods[l.hood].name}, ${l.rooms} — ${t(l.title)}`;

/** Map with one pin per listing; pins and list cards share the `active` listing. */
export function CityMap({ items, className, single }: { items: Listing[]; className?: string; single?: boolean }) {
  const { locale, t, active, setActive, open } = useEstate();
  const title = locale === "tr" ? "İstanbul haritası, ilanlar işaretli (ölçeksiz)" : "Map of Istanbul with the listings marked (not to scale)";
  return (
    <div className={cn("flex items-center overflow-hidden rounded-ui-lg border border-line bg-surface", className)}>
      <div className="relative aspect-[10/7] w-full">
        <MapArt title={title} />
        <ul aria-label={locale === "tr" ? "Haritadaki ilanlar" : "Listings on the map"} className="contents">
          {items.map((l) => {
            const on = active === l.id || single;
            return (
              <li key={l.id} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${l.at.x / 10}%`, top: `${l.at.y / 7}%`, zIndex: on ? 3 : 1 }}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(l.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(l.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => !single && open(l.id)}
                  data-active={on ? "" : undefined}
                  className={cn(
                    "group/pin relative flex flex-col items-center focus-ring rounded-ui-sm",
                    "transition-transform duration-150 motion-reduce:transition-none data-[active]:-translate-y-1",
                  )}
                >
                  <span
                    className={cn(
                      "tabular whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[11.5px] font-medium shadow-sm transition-colors",
                      on ? "border-transparent bg-accent text-accent-fg" : "border-line bg-surface text-fg",
                    )}
                  >
                    {tl(l.price, locale, true)}
                    {l.deal === "rent" ? (locale === "tr" ? "/ay" : "/mo") : ""}
                  </span>
                  <span className="sr-only">, {pinLabel(l, locale, t)}</span>
                  <span aria-hidden className={cn("h-2 w-px", on ? "bg-accent" : "bg-fg-muted")} />
                  <span aria-hidden className={cn("size-2 rounded-full ring-2 ring-surface", on ? "bg-accent" : "bg-fg")} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
