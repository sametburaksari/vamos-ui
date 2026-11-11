"use client";

import * as React from "react";
import { Button, cn, Select, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Columns2, LayoutGrid, Map as MapIcon } from "lucide-react";
import { CityMap } from "./city-map";
import { copyFor, fill, listings } from "./content";
import { defaultFilters, useEstate } from "./estate-provider";
import { ListingCard } from "./listing-card";
import { SearchFilters } from "./search-filters";

type View = "split" | "list" | "map";
type Sort = "new" | "price-asc" | "price-desc" | "size";

const c = {
  home: { en: "Harbourline", tr: "Harbourline" },
  crumb: { en: "Listings", tr: "İlanlar" },
  title: { en: "Homes on *both* shores", tr: "*İki* yakada evler" },
  lead: { en: "Every listing has been visited by one of us, measured and photographed in daylight. Hover a home to find it on the map — or a pin to find the home.", tr: "Her ilanı birimiz gezdi, ölçtü ve gün ışığında fotoğrafladı. Bir eve gelin, haritada bulun — ya da bir iğneye gelin, evi bulun." },
  view: { en: "View", tr: "Görünüm" },
  split: { en: "List and map", tr: "Liste ve harita" },
  list: { en: "List", tr: "Liste" },
  map: { en: "Map", tr: "Harita" },
  sort: { en: "Sort", tr: "Sırala" },
  new: { en: "Newest", tr: "En yeni" },
  asc: { en: "Price, lowest first", tr: "Fiyat, artan" },
  desc: { en: "Price, highest first", tr: "Fiyat, azalan" },
  size: { en: "Largest first", tr: "En büyük" },
  count: { en: "{n} of {total} homes", tr: "{total} evden {n} tanesi" },
  none: { en: "No homes match all of these. Widen the price range or pick “Anywhere”.", tr: "Bunların hepsine uyan ev yok. Fiyat aralığını genişletin ya da “Her yer”i seçin." },
  reset: { en: "Reset filters", tr: "Filtreleri sıfırla" },
  live: { en: "Listings", tr: "İlanlar" },
  updated: { en: "Updated", tr: "Güncelleme" },
  today: { en: "Today, 09:00", tr: "Bugün, 09:00" },
  visited: { en: "Visited by us", tr: "Yerinde görülen" },
  all: { en: "All of them", tr: "Hepsi" },
};

/** Listings: filters, sort and a list / split / map view whose cards and pins highlight each other. */
export function ListingsPage() {
  const { locale, t, filters, setFilters, results } = useEstate();
  const { intl, labels } = copyFor(locale);
  const [view, setView] = React.useState<View>("split");
  const [sort, setSort] = React.useState<Sort>("new");

  const sorted = React.useMemo(() => {
    const out = [...results];
    if (sort === "new") out.sort((a, b) => b.listed.localeCompare(a.listed));
    if (sort === "price-asc") out.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") out.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "size") out.sort((a, b) => b.size - a.size);
    return out;
  }, [results, sort]);

  const total = listings.filter((l) => l.deal === filters.deal).length;
  const empty = sorted.length === 0 ? (
    <div className="flex flex-col items-start gap-4 rounded-ui-lg border border-dashed border-line p-8">
      <p className="text-fg-muted">{t(c.none)}</p>
      <Button variant="secondary" onClick={() => setFilters(defaultFilters(filters.deal))}>
        {t(c.reset)}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="simple"
        breadcrumb={[{ label: t(c.home), href: sitePageHref("home") }, { label: t(c.crumb) }]}
        title={t(c.title)}
        lead={t(c.lead)}
        meta={[
          { label: t(c.live), value: String(listings.length) },
          { label: t(c.visited), value: t(c.all) },
          { label: t(c.updated), value: t(c.today) },
        ]}
      />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)}>
        <Container size="wide">
          <div className="surface mb-6 rounded-ui-lg p-5">
            <SearchFilters value={filters} onChange={setFilters} compact />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[12px] text-fg-muted" aria-live="polite">
              {fill(t(c.count), { n: sorted.length, total })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                aria-label={t(c.sort)}
                size="sm"
                value={sort}
                onValueChange={(v) => v && setSort(v as Sort)}
                items={[
                  { value: "new", label: t(c.new) },
                  { value: "price-asc", label: t(c.asc) },
                  { value: "price-desc", label: t(c.desc) },
                  { value: "size", label: t(c.size) },
                ]}
              />
              <ToggleGroup type="single" variant="segmented" size="sm" aria-label={t(c.view)} value={view} onValueChange={(v) => v && setView(v as View)}>
                <ToggleGroupItem value="split" className="hidden @5xl:inline-flex">
                  <Columns2 aria-hidden />
                  {t(c.split)}
                </ToggleGroupItem>
                <ToggleGroupItem value="list">
                  <LayoutGrid aria-hidden />
                  {t(c.list)}
                </ToggleGroupItem>
                <ToggleGroupItem value="map">
                  <MapIcon aria-hidden />
                  {t(c.map)}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {view === "map" ? (
            <div className="flex flex-col gap-6">
              <CityMap items={sorted} />
              <ul className="grid gap-5 @2xl:grid-cols-2 @5xl:grid-cols-4">
                {sorted.map((l) => (
                  <li key={l.id}>
                    <ListingCard listing={l} />
                  </li>
                ))}
              </ul>
              {empty}
            </div>
          ) : (
            <div className={cn("grid gap-8", view === "split" && "@5xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]")}>
              <div>
                <ul className={cn("grid gap-5", view === "split" ? "@2xl:grid-cols-2 @5xl:grid-cols-1" : "@2xl:grid-cols-2 @5xl:grid-cols-3")}>
                  {sorted.map((l, i) => (
                    <li key={l.id}>
                      <ListingCard listing={l} layout={view === "split" ? "row" : "stack"} priority={i < 2} />
                    </li>
                  ))}
                </ul>
                {empty}
              </div>
              {view === "split" ? (
                <div className="hidden @5xl:block">
                  <div className="sticky top-24">
                    <CityMap items={sorted} />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
