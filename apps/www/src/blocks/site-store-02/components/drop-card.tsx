"use client";

import { cn, Image } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { Bell, BellRing, Lock } from "lucide-react";
import { currencyOf, sizesOf, totalStock, type PreviewItem, type Product } from "./content";
import { useDrop, useDropClock } from "./drop-provider";

/**
 * One cell of the dense grid: photo, style code, name, price, a stock meter against the run,
 * and the sizes as quick-add buttons (sold-out sizes are struck through and disabled).
 */
export function ProductTile({ product, priority, idPrefix = "nb" }: { product: Product; priority?: boolean; idPrefix?: string }) {
  const { t, s, fmt, add, select, locale } = useDrop();
  const titleId = `${idPrefix}-${product.id}-title`;
  const left = totalStock(product);
  const sold = left === 0;
  const name = t(product.name);
  const photo = product.photos[0]!;
  const alt = product.photos[1];

  return (
    <article aria-labelledby={titleId} className="group relative flex flex-col bg-scene">
      <div className="relative overflow-hidden bg-surface-2">
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          focal={photo.focal}
          alt={t(photo.alt)}
          aspect="4/5"
          priority={priority}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
          className={cn("transition-opacity duration-300 motion-reduce:transition-none", alt && "group-hover:opacity-0", sold && "grayscale")}
        />
        {alt ? (
          <Image
            src={alt.src}
            width={alt.width}
            height={alt.height}
            focal={alt.focal}
            alt=""
            aria-hidden
            aspect="4/5"
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
            className="absolute! inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
          />
        ) : null}
        <span className="absolute start-0 top-0 bg-scene px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fg">{product.code}</span>
        {sold ? <span className="absolute end-0 top-0 bg-fg px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-scene">{s("soldOut")}</span> : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5 @3xl:p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 id={titleId} className="min-w-0 font-display text-[0.95rem] uppercase leading-[1.05] tracking-[-0.01em] text-fg @3xl:text-[1.05rem]">
            <a
              href={sitePageHref("product")}
              onClick={() => select(product.id)}
              className="rounded-[2px] focus-ring after:absolute after:inset-0 after:content-[''] hover:text-accent-ink"
            >
              {name}
            </a>
          </h3>
          <p className="tabular shrink-0 font-mono text-small text-fg">{fmt(product.price[currencyOf(locale)])}</p>
        </div>

        <div className="flex items-center gap-2" aria-hidden>
          <span className="h-[3px] flex-1 bg-track">
            <span className="block h-full bg-fg" style={{ width: `${Math.max(2, Math.round((left / product.run) * 100))}%` }} />
          </span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
          {sold ? s("soldOut") : s("ofRun", { left, run: product.run })} · {t(product.colour)}
        </p>

        <div role="group" aria-label={s("sizeOf", { name })} className="relative z-10 mt-auto flex flex-wrap gap-1 pt-1">
          {sizesOf(product).map((size) => {
            const n = product.stock[size] ?? 0;
            return (
              <button
                key={size}
                type="button"
                disabled={n === 0}
                onClick={() => add(product.id, size)}
                aria-label={n === 0 ? `${size} — ${s("soldOut")}` : s("quickAdd", { name, size })}
                title={n === 0 ? s("soldOut") : s("left", { n })}
                className={cn(
                  "h-7 min-w-8 border border-line px-1.5 font-mono text-[11px] uppercase text-fg transition-colors focus-ring",
                  n === 0 ? "cursor-not-allowed text-fg-subtle line-through" : "hover:border-fg hover:bg-fg hover:text-scene",
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

/** A locked Drop-07 piece: desaturated photo, price, run size and a reminder toggle. */
export function LockedTile({ item }: { item: PreviewItem }) {
  const { t, s, fmt, reminders, toggleReminder, locale } = useDrop();
  const { live } = useDropClock();
  const on = reminders.includes(item.id);
  const name = t(item.name);
  const titleId = `nb-${item.id}-title`;

  return (
    <article aria-labelledby={titleId} className="relative flex flex-col bg-scene">
      <div className="relative overflow-hidden bg-surface-2">
        <Image
          src={item.photo.src}
          width={item.photo.width}
          height={item.photo.height}
          focal={item.photo.focal}
          alt={t(item.photo.alt)}
          aspect="4/5"
          sizes="(min-width: 1024px) 25vw, 50vw"
          className={cn("transition-[filter] duration-700 motion-reduce:transition-none", !live && "contrast-125 grayscale")}
        />
        {!live ? (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-scene/85 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg">
            <span className="inline-flex items-center gap-1.5">
              <Lock aria-hidden className="size-3" />
              {s("locked")}
            </span>
            <span>{s("run", { n: item.run })}</span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5 @3xl:p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">{item.code}</p>
        <div className="flex items-start justify-between gap-2">
          <h3 id={titleId} className="font-display text-[0.95rem] uppercase leading-[1.05] text-fg @3xl:text-[1.05rem]">
            {name}
          </h3>
          <p className="tabular shrink-0 font-mono text-small text-fg">{fmt(item.price[currencyOf(locale)])}</p>
        </div>
        {live ? (
          <a href={sitePageHref("archive")} className="mt-auto inline-flex h-8 items-center justify-center bg-accent px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-fg focus-ring">
            {s("liveNow")}
          </a>
        ) : (
          <button
            type="button"
            aria-pressed={on}
            aria-label={s("remindOf", { name })}
            onClick={() => toggleReminder(item.id, name)}
            className={cn(
              "mt-auto inline-flex h-8 items-center justify-center gap-2 border px-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors focus-ring",
              on ? "border-accent bg-accent-soft text-accent-ink" : "border-line text-fg hover:border-fg",
            )}
          >
            {on ? <BellRing aria-hidden className="size-3.5" /> : <Bell aria-hidden className="size-3.5" />}
            {on ? s("reminding") : s("remind")}
          </button>
        )}
      </div>
    </article>
  );
}
