"use client";

import * as React from "react";
import { Avatar, Badge, Button, cn, Popover, PopoverContent, PopoverTrigger } from "@vamos-ui/react";
import { RatingStars, sitePageHref } from "@vamos-ui/react/blocks";
import { BadgeCheck, Star } from "lucide-react";
import { fill, isTopMaker, type Seller } from "./content";
import { useMarket } from "./market-provider";

export const ratingCopy = {
  outOf: { en: "{rating} out of 5", tr: "5 üzerinden {rating}" },
  reviews: { en: "{n} reviews", tr: "{n} değerlendirme" },
  stars: { en: "{n} stars", tr: "{n} yıldız" },
  onTime: { en: "Ships on time", tr: "Zamanında kargo" },
  reply: { en: "Replies within", tr: "Yanıt süresi" },
  hours: { en: "{n} h", tr: "{n} sa" },
  sales: { en: "Sales", tr: "Satış" },
  top: { en: "Top maker", tr: "Öne çıkan üretici" },
  topWhy: { en: "4.8+ rating and 95%+ on-time dispatch over 12 months.", tr: "12 ayda 4,8+ puan ve %95+ zamanında kargo." },
  visit: { en: "Visit shop", tr: "Dükkâna git" },
  details: { en: "Rating details for {name}: {rating} from {n} reviews", tr: "{name} puan ayrıntıları: {n} değerlendirmeden {rating}" },
};

/** Five bars, 5★ to 1★, each the share of reviews. Bars can be buttons (seller page filter). */
export function RatingBars({ seller, active, onPick, className }: { seller: Seller; active?: number | null; onPick?: (stars: number) => void; className?: string }) {
  const { c } = useMarket();
  const { t, f } = c;
  return (
    <ul role="list" className={cn("flex flex-col gap-1", className)}>
      {seller.dist.map((n, i) => {
        const stars = 5 - i;
        const pct = seller.reviews ? n / seller.reviews : 0;
        const label = `${fill(t(ratingCopy.stars), { n: stars })}: ${f.number(n)}`;
        const row = (
          <>
            <span className="tabular flex w-7 shrink-0 items-center gap-0.5 text-[12px] text-fg-muted">
              {stars}
              <Star aria-hidden className="size-3 fill-current" />
              <span className="sr-only">{fill(t(ratingCopy.stars), { n: "" }).trim()}:</span>
            </span>
            <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
              <span className={cn("block h-full rounded-full", active === stars ? "bg-accent" : "bg-fg-muted")} style={{ width: `${Math.max(pct * 100, n ? 1.5 : 0)}%` }} />
            </span>
            <span className="tabular w-9 shrink-0 text-end text-[12px] text-fg-muted">{f.number(n)}</span>
          </>
        );
        return (
          <li key={stars}>
            {onPick ? (
              <button type="button" aria-pressed={active === stars} onClick={() => onPick(stars)} className={cn("flex w-full items-center gap-2 rounded-ui-sm px-1 py-1 focus-ring hover:bg-hover", active === stars && "bg-selected")}>
                {row}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-1 py-0.5" aria-label={label} role="group">
                {row}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The signature seller chip: avatar, shop name and a rating button. The button opens the rating
 * card — distribution, on-time share, reply time, the Top maker rule — with a link to the shop.
 */
export function SellerRating({ seller, size = "sm" }: { seller: Seller; size?: "sm" | "md" }) {
  const { c, openSeller } = useMarket();
  const { t, f, rating } = c;
  const top = isTopMaker(seller);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
      <Avatar src={seller.avatar} name={seller.maker} size={size === "md" ? "md" : "xs"} />
      <a
        href={sitePageHref("seller")}
        onClick={() => openSeller(seller.id)}
        className={cn("relative z-10 max-w-[calc(100%-2rem)] truncate rounded-[2px] text-fg hover:underline focus-ring", size === "md" ? "text-body font-medium" : "text-small")}
      >
        {seller.name}
      </a>
      {top ? <BadgeCheck aria-label={t(ratingCopy.top)} className="size-4 shrink-0 text-accent-ink" /> : null}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="tabular relative z-10 ms-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5 text-[12px] font-semibold text-fg focus-ring hover:border-fg-subtle"
          >
            <Star aria-hidden className="size-3 fill-current text-accent-ink" />
            {rating(seller.rating)}
            <span className="font-normal text-fg-muted">· {f.compact(seller.reviews)}</span>
            <span className="sr-only"> — {fill(t(ratingCopy.details), { name: seller.name, rating: rating(seller.rating), n: f.number(seller.reviews) })}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="flex items-start gap-3">
            <Avatar src={seller.avatar} name={seller.maker} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-fg">{seller.name}</p>
              <p className="text-small text-fg-muted">
                {seller.maker} · {t(seller.city)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="tabular text-[2.25rem] leading-none font-semibold tracking-[-0.03em] text-fg">{rating(seller.rating)}</span>
            <span className="flex flex-col gap-1 pb-0.5">
              <RatingStars rating={seller.rating} label={fill(t(ratingCopy.outOf), { rating: rating(seller.rating) })} size="sm" />
              <span className="text-[12px] text-fg-muted">{fill(t(ratingCopy.reviews), { n: f.number(seller.reviews) })}</span>
            </span>
          </div>
          <RatingBars seller={seller} className="mt-3" />
          <dl className="tabular mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
            <div>
              <dt className="text-[11px] text-fg-muted">{t(ratingCopy.onTime)}</dt>
              <dd className="font-semibold text-fg">{f.percent(seller.onTime)}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-fg-muted">{t(ratingCopy.reply)}</dt>
              <dd className="font-semibold text-fg">{fill(t(ratingCopy.hours), { n: seller.replyHours })}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-fg-muted">{t(ratingCopy.sales)}</dt>
              <dd className="font-semibold text-fg">{f.number(seller.sales)}</dd>
            </div>
          </dl>
          {top ? (
            <p className="mt-3 flex gap-2 rounded-ui bg-accent-soft p-2.5 text-[12px] text-fg">
              <BadgeCheck aria-hidden className="size-4 shrink-0 text-accent-ink" />
              <span>
                <strong className="font-semibold">{t(ratingCopy.top)}.</strong> {t(ratingCopy.topWhy)}
              </span>
            </p>
          ) : null}
          <Button asChild variant="secondary" size="sm" block className="mt-3">
            <a href={sitePageHref("seller")} onClick={() => openSeller(seller.id)}>
              {t(ratingCopy.visit)}
            </a>
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Small "Top maker" badge for headers. */
export function TopMakerBadge() {
  const { c } = useMarket();
  return (
    <Badge tone="accent">
      <BadgeCheck aria-hidden className="size-3.5" />
      {c.t(ratingCopy.top)}
    </Badge>
  );
}
