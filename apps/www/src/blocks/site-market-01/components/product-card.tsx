"use client";

import * as React from "react";
import { Card, cn, IconButton, Image, toast } from "@vamos-ui/react";
import { Heart, Truck } from "lucide-react";
import { fill, sellerById, type Product } from "./content";
import { useMarket } from "./market-provider";
import { SellerRating } from "./seller-rating";

const copy = {
  save: { en: "Save {name}", tr: "{name} kaydet" },
  unsave: { en: "Remove {name} from saved", tr: "{name} kayıtlılardan çıkar" },
  saved: { en: "Saved — {n} items on your list", tr: "Kaydedildi — listenizde {n} ürün" },
  ships: { en: "Ships in {n} days", tr: "{n} günde kargoda" },
  ships1: { en: "Ships tomorrow", tr: "Yarın kargoda" },
  free: { en: "Free delivery", tr: "Ücretsiz kargo" },
};

/** Product card: photo, save, title, price and dispatch, then the seller chip with its rating. */
export function ProductCard({ product, priority, showSeller = true }: { product: Product; priority?: boolean; showSeller?: boolean }) {
  const { c, saved, toggleSaved } = useMarket();
  const { t, lira } = c;
  const seller = sellerById(product.seller);
  const name = t(product.name);
  const isSaved = saved.has(product.id);
  const titleId = React.useId();

  return (
    <Card as="article" variant="ghost" aria-labelledby={titleId} className="group relative flex flex-col gap-2.5">
      <div className="relative overflow-hidden rounded-ui-lg bg-surface-2">
        <Image
          src={product.photo.src}
          width={product.photo.width}
          height={product.photo.height}
          alt={t(product.alt)}
          aspect="4/5"
          priority={priority}
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 33vw, 50vw"
          className="my-0! transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <IconButton
          variant="secondary"
          size="sm"
          label={fill(t(isSaved ? copy.unsave : copy.save), { name })}
          tooltip={false}
          aria-pressed={isSaved}
          onClick={() => {
            toggleSaved(product.id);
            if (!isSaved) toast(fill(t(copy.saved), { n: saved.size + 1 }));
          }}
          className="absolute end-2.5 top-2.5 z-10 rounded-full! bg-surface"
        >
          <Heart aria-hidden className={cn(isSaved && "fill-current text-accent-ink")} />
        </IconButton>
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <h3 id={titleId} className="line-clamp-2 text-body leading-snug font-medium text-fg">
          {name}
        </h3>
        <p className="tabular flex flex-wrap items-baseline gap-x-2 text-small">
          <span className="text-[1.05rem] font-semibold text-fg">{lira(product.price)}</span>
          <span className="inline-flex items-center gap-1 text-fg-muted">
            {product.freeShipping ? <Truck aria-hidden className="size-3.5" /> : null}
            {product.freeShipping ? t(copy.free) : product.ships === 1 ? t(copy.ships1) : fill(t(copy.ships), { n: product.ships })}
          </span>
        </p>
      </div>
      {showSeller ? (
        <div className="border-t border-line px-0.5 pt-2.5">
          <SellerRating seller={seller} />
        </div>
      ) : null}
    </Card>
  );
}
