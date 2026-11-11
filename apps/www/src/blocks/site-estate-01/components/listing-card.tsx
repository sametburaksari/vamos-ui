"use client";

import * as React from "react";
import { Badge, Card, cn, IconButton, Image } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { hoods, tl, type Listing } from "./content";
import { useEstate } from "./estate-provider";

const s = {
  sale: { en: "For sale", tr: "Satılık" },
  rent: { en: "To rent", tr: "Kiralık" },
  perMonth: { en: "/ month", tr: "/ ay" },
  save: { en: "Save {title}", tr: "{title} ilanını kaydet" },
  saved: { en: "Saved — remove {title}", tr: "Kaydedildi — {title} ilanını çıkar" },
  built: { en: "Built {year}", tr: "{year} yapımı" },
};

/**
 * A listing: photo, price, rooms · m² · floor. Pointer or focus marks it `active`, which lights
 * up its pin on the map (and the pin lights up the card).
 */
export function ListingCard({ listing, layout = "stack", priority }: { listing: Listing; layout?: "stack" | "row"; priority?: boolean }) {
  const { locale, t, active, setActive, open, saved, toggleSaved } = useEstate();
  const on = active === listing.id;
  const isSaved = saved.includes(listing.id);
  const title = t(listing.title);
  const id = React.useId();
  const photo = listing.photos[0]!;

  return (
    <Card
      as="article"
      variant="surface"
      aria-labelledby={id}
      onMouseEnter={() => setActive(listing.id)}
      onMouseLeave={() => setActive(null)}
      onFocusCapture={() => setActive(listing.id)}
      onBlurCapture={() => setActive(null)}
      data-active={on ? "" : undefined}
      className={cn(
        "group overflow-hidden transition-[box-shadow,border-color] duration-150",
        on && "ring-2 ring-accent-ink",
        layout === "row" ? "grid grid-cols-1 @md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : "flex flex-col",
      )}
    >
      <div className="relative">
        <Image src={photo.src} width={photo.width} height={photo.height} alt={t(photo.alt)} aspect={layout === "row" ? "4/3" : "3/2"} priority={priority} sizes="(min-width: 1024px) 30vw, 100vw" className={layout === "row" ? "h-full" : undefined} />
        <Badge tone="neutral" className="surface-popover absolute start-3 top-3 text-fg">
          {t(s[listing.deal])}
        </Badge>
        <IconButton
          label={(isSaved ? s.saved : s.save)[locale].replace("{title}", title)}
          tooltip={false}
          aria-pressed={isSaved}
          variant="secondary"
          size="sm"
          onClick={() => toggleSaved(listing.id)}
          className="surface-popover absolute end-3 top-3 z-10 rounded-full!"
        >
          {isSaved ? <BookmarkCheck className="text-accent-ink" /> : <Bookmark />}
        </IconButton>
      </div>
      <div className="relative flex flex-col gap-2 p-5">
        <p className="tabular text-h3 font-semibold text-fg">
          {tl(listing.price, locale)}
          {listing.deal === "rent" ? <span className="ms-1 text-small font-normal text-fg-muted">{t(s.perMonth)}</span> : null}
        </p>
        <h3 id={id} className="font-display text-[1.3rem] leading-snug text-fg">
          <a
            href={sitePageHref("listing")}
            onClick={(e) => {
              e.preventDefault();
              open(listing.id);
            }}
            className="rounded-[2px] focus-ring after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-4"
          >
            {title}
          </a>
        </h3>
        <p className="text-small text-fg-muted">
          {hoods[listing.hood].name} · {t(hoods[listing.hood].side)}
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-[12px] text-fg-muted">
          <li>{listing.rooms}</li>
          <li>{listing.size} m²</li>
          <li>{t(listing.floor)}</li>
          <li>{t(s.built).replace("{year}", String(listing.built))}</li>
        </ul>
      </div>
    </Card>
  );
}
