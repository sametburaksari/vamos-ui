"use client";

import { Field, Select, Slider, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { hoods, type Deal, type Hood, type Listing } from "./content";
import { defaultFilters, PRICE_RANGE, useEstate, type Filters } from "./estate-provider";

export const fc = {
  deal: { en: "Buy or rent", tr: "Satılık / kiralık" },
  buy: { en: "Buy", tr: "Satılık" },
  rent: { en: "Rent", tr: "Kiralık" },
  rooms: { en: "Rooms", tr: "Oda" },
  any: { en: "Any", tr: "Hepsi" },
  hood: { en: "Neighbourhood", tr: "Semt" },
  anywhere: { en: "Anywhere", tr: "Her yer" },
  price: { en: "Price", tr: "Fiyat" },
  rentPrice: { en: "Monthly rent", tr: "Aylık kira" },
};

const ROOMS: Listing["rooms"][] = ["1+1", "2+1", "3+1", "4+1"];

/** Deal, rooms, neighbourhood and a price range — used by the hero search and the listings page. */
export function SearchFilters({ value, onChange, compact }: { value: Filters; onChange: (f: Filters) => void; compact?: boolean }) {
  const { locale, t } = useEstate();
  const range = PRICE_RANGE[value.deal];
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  return (
    <div className={compact ? "grid gap-4 @3xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.6fr)] @3xl:items-end" : "grid gap-5"}>
      <Field label={t(fc.deal)}>
        <ToggleGroup
          type="single"
          variant="segmented"
          value={value.deal}
          onValueChange={(v) => v && onChange({ ...defaultFilters(v as Deal), rooms: value.rooms, hood: value.hood })}
        >
          <ToggleGroupItem value="sale">{t(fc.buy)}</ToggleGroupItem>
          <ToggleGroupItem value="rent">{t(fc.rent)}</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <Field label={t(fc.rooms)}>
        <Select value={value.rooms} onValueChange={(v) => v && onChange({ ...value, rooms: v as Filters["rooms"] })} items={[{ value: "any", label: t(fc.any) }, ...ROOMS.map((r) => ({ value: r, label: r }))]} />
      </Field>
      <Field label={t(fc.hood)}>
        <Select
          value={value.hood}
          onValueChange={(v) => v && onChange({ ...value, hood: v as Filters["hood"] })}
          items={[{ value: "any", label: t(fc.anywhere) }, ...(Object.keys(hoods) as Hood[]).map((h) => ({ value: h, label: hoods[h].name }))]}
        />
      </Field>
      <Field label={t(value.deal === "rent" ? fc.rentPrice : fc.price)}>
        <Slider
          value={value.price}
          onValueChange={(v) => onChange({ ...value, price: [v[0] ?? range.min, v[1] ?? range.max] })}
          min={range.min}
          max={range.max}
          step={range.step}
          showValue="always"
          formatValue={(n) => new Intl.NumberFormat(intl, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(n)}
          thumbLabels={locale === "tr" ? ["En düşük fiyat", "En yüksek fiyat"] : ["Minimum price", "Maximum price"]}
        />
      </Field>
    </div>
  );
}
