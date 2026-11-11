"use client";

import * as React from "react";
import { Badge, Button, Card, cn, Image } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { Plus } from "lucide-react";
import type { Product } from "./content";
import { useStore } from "./store-provider";

/**
 * The signature product card: glaze swatches under the photo. Hovering or focusing a swatch
 * previews that glaze's photo; clicking keeps it, and the card's link and quick-add follow the
 * chosen glaze. Photos are stacked and cross-fade (instant with reduced motion).
 */
export function ProductCard({ product, priority, size = "md" }: { product: Product; priority?: boolean; size?: "md" | "lg" }) {
  const { t, s, fmt, currency, add, select } = useStore();
  const [chosen, setChosen] = React.useState(0);
  const [preview, setPreview] = React.useState<number | null>(null);
  const shown = preview ?? chosen;
  const glaze = product.glazes[chosen]!;
  const soldOut = glaze.stock === 0;
  const name = t(product.name);
  const titleId = React.useId();

  return (
    <Card as="article" variant="ghost" aria-labelledby={titleId} className="group flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-ui-lg bg-surface-2">
        {product.glazes.map((g, i) => (
          <Image
            key={g.id}
            src={g.photo.src}
            width={g.photo.width}
            height={g.photo.height}
            focal={g.photo.focal}
            alt={i === shown ? t(g.alt) : ""}
            aspect="4/5"
            priority={priority && i === 0}
            sizes={size === "lg" ? "(min-width: 1024px) 40vw, 90vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"}
            aria-hidden={i === shown ? undefined : true}
            className={cn(
              "transition-[opacity,scale] duration-500 ease-out motion-reduce:transition-none",
              i === 0 ? "relative" : "absolute! inset-0",
              i === shown ? "opacity-100" : "opacity-0",
              "group-hover:scale-[1.02] motion-reduce:group-hover:scale-100",
            )}
          />
        ))}
        {product.isNew ? (
          <Badge tone="neutral" className="absolute start-3 top-3 bg-surface text-fg">
            {s("newBadge")}
          </Badge>
        ) : null}
        <Button
          variant="secondary"
          size="icon"
          disabled={soldOut}
          aria-label={s("quickAdd", { name, glaze: t(glaze.name) })}
          title={soldOut ? s("soldOut") : s("addToCart")}
          onClick={() => add(product.id, glaze.id, 1)}
          className="absolute end-3 bottom-3 z-10 rounded-full! bg-surface opacity-100 shadow-sm @3xl:opacity-0 @3xl:group-hover:opacity-100 @3xl:focus-visible:opacity-100"
        >
          <Plus aria-hidden />
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 px-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 id={titleId} className={cn("min-w-0 font-display leading-tight text-fg", size === "lg" ? "text-[1.6rem]" : "text-[1.25rem]")}>
            <a
              href={sitePageHref("product")}
              onClick={() => select(product.id, glaze.id)}
              className="rounded-[2px] focus-ring after:absolute after:inset-0 after:content-[''] hover:underline hover:decoration-line hover:underline-offset-4"
            >
              {name}
            </a>
          </h3>
          <p className="tabular shrink-0 text-fg">{fmt(product.price[currency])}</p>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div role="radiogroup" aria-label={s("glazeOf", { name })} className="flex items-center gap-1.5" onMouseLeave={() => setPreview(null)}>
            {product.glazes.map((g, i) => (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={i === chosen}
                aria-label={t(g.name)}
                title={t(g.name)}
                tabIndex={i === chosen ? 0 : -1}
                onMouseEnter={() => setPreview(i)}
                onFocus={() => setPreview(i)}
                onBlur={() => setPreview(null)}
                onClick={() => setChosen(i)}
                onKeyDown={(e) => {
                  const n = product.glazes.length;
                  const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % n : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i - 1 + n) % n : -1;
                  if (next < 0) return;
                  e.preventDefault();
                  setChosen(next);
                  (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                }}
                className={cn(
                  "grid size-7 place-items-center rounded-full transition-shadow focus-ring",
                  i === chosen ? "ring-[1.5px] ring-fg" : "ring-1 ring-transparent hover:ring-line",
                )}
              >
                <span aria-hidden className="size-[1.125rem] rounded-full shadow-[inset_0_0_0_1px_var(--color-line)]" style={{ background: g.swatch }} />
              </button>
            ))}
          </div>
          <p className="truncate text-small text-fg-muted" aria-live="polite">
            {t(product.glazes[shown]!.name)}
            {product.glazes[shown]!.stock === 0 ? ` · ${s("soldOut").toLowerCase()}` : ""}
          </p>
        </div>
      </div>
    </Card>
  );
}
