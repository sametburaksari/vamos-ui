"use client";

import * as React from "react";
import { Button, Image } from "@vamos-ui/react";
import { Container, Section, SectionHeader, sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { Stagger } from "@vamos-ui/react/motion";
import { ArrowRight } from "lucide-react";
import { fill, guides, hoods, listings, photosHero, tl } from "./content";
import { matches, useEstate, type Filters } from "./estate-provider";
import { ListingCard } from "./listing-card";
import { MortgageCalculator } from "./mortgage-calculator";
import { SearchFilters } from "./search-filters";


const c = {
  eyebrow: { en: "Harbourline Homes · since 2011", tr: "Harbourline Homes · 2011’den beri" },
  title: { en: "City flats, chosen *by the street*", tr: "Şehir daireleri, *sokağına göre* seçildi" },
  lead: { en: "Eight neighbourhoods on both shores of the Bosphorus. We list fewer homes and know each one.", tr: "Boğaz’ın iki yakasında sekiz semt. Daha az ev listeliyor, her birini tanıyoruz." },
  show: { en: "Show {n} homes", tr: "{n} evi göster" },
  showNone: { en: "No homes yet — widen the range", tr: "Henüz ev yok — aralığı genişletin" },
  featured: { en: "Featured this week", tr: "Bu haftanın öne çıkanları" },
  featuredTitle: { en: "Three homes we would *move into*", tr: "*Taşınmak* isteyeceğimiz üç ev" },
  all: { en: "All listings", tr: "Tüm ilanlar" },
  guides: { en: "Neighbourhood guides", tr: "Semt rehberleri" },
  guidesTitle: { en: "Know the street *before* the flat", tr: "Daireden *önce* sokağı tanıyın" },
  guidesLead: { en: "Average asking prices from our own listings and sales over the last twelve months.", tr: "Son on iki aydaki kendi ilan ve satışlarımızdan ortalama fiyatlar." },
  sqm: { en: "Avg. per m²", tr: "Ort. m²" },
  rent: { en: "2+1 rent", tr: "2+1 kira" },
  homes: { en: "{n} homes listed", tr: "{n} ilan" },
  calcEyebrow: { en: "Mortgage calculator", tr: "Kredi hesaplayıcı" },
  calcTitle: { en: "Run the numbers *first*", tr: "Önce *hesabı* yapın" },
  calcLead: { en: "Change the price, down payment, monthly rate and term; the payment updates as you go.", tr: "Fiyatı, peşinatı, aylık faizi ve vadeyi değiştirin; taksit anında güncellenir." },
};

/** Full-bleed photo hero with a glass search panel; the search presets the listings filters. */
export function SearchHero() {
  const { t, filters, setFilters } = useEstate();
  const { navigate } = useSiteShell();
  const [draft, setDraft] = React.useState<Filters>(filters);
  const count = listings.filter((l) => matches(l, draft)).length;
  return (
    <Section theme={{ surface: "media", background: { src: photosHero.src, width: photosHero.width, height: photosHero.height }, mode: "dark" }} priority aria-labelledby="hl-hero-title" className="min-h-[min(88dvh,52rem)] content-end">
      <Container size="wide">
        <div className="flex flex-col gap-10 pt-24 @4xl:pt-40">
          <div className="flex max-w-4xl flex-col gap-5">
            <p className="vm-enter font-mono text-[11px] uppercase tracking-[0.16em] text-fg">{t(c.eyebrow)}</p>
            <h1 id="hl-hero-title" className="vm-enter vm-enter-title [--vm-i:1] font-display text-display-2xl text-balance text-fg">
              {t(c.title)
                .split("*")
                .map((p, i) => (i === 1 ? <em key={i}>{p}</em> : p))}
            </h1>
            <p className="vm-enter [--vm-i:2] max-w-[52ch] text-lead text-fg">{t(c.lead)}</p>
          </div>
          <form
            role="search"
            aria-label={t(c.all)}
            className="vm-enter [--vm-i:4] surface-popover grid gap-4 rounded-ui-lg p-5 @5xl:grid-cols-[minmax(0,1fr)_auto] @5xl:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setFilters(draft);
              navigate({ page: "listings" });
            }}
          >
            <SearchFilters value={draft} onChange={setDraft} compact />
            <Button type="submit" variant="primary" size="lg" disabled={count === 0} className="vm-press">
              <span key={count} className="hl-count">{count ? fill(t(c.show), { n: count }) : t(c.showNone)}</span>
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </Button>
          </form>
        </div>
      </Container>
    </Section>
  );
}

export function FeaturedListings() {
  const { t } = useEstate();
  return (
    <Section headingId="hl-featured-h">
      <Container size="wide">
        <div className="mb-10 flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <SectionHeader eyebrow={t(c.featured)} title={t(c.featuredTitle)} headingId="hl-featured-h" />
          <Button asChild variant="secondary" className="vm-press vm-nudge">
            <a href={sitePageHref("listings")}>
              {t(c.all)}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </a>
          </Button>
        </div>
        <Stagger asChild step={110}>
        <ul className="grid gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {listings
            .filter((l) => l.featured)
            .map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
        </ul>
        </Stagger>
      </Container>
    </Section>
  );
}

/** Guides: one row per neighbourhood with its numbers; selecting one opens the filtered listings. */
export function NeighbourhoodGuides() {
  const { locale, t, setFilters } = useEstate();
  const { navigate } = useSiteShell();
  return (
    <Section theme={{ surface: "surface-2" }} anchor="guides" headingId="hl-guides-h">
      <Container size="wide">
        <SectionHeader eyebrow={t(c.guides)} title={t(c.guidesTitle)} lead={t(c.guidesLead)} align="split" className="mb-12" headingId="hl-guides-h" />
        <Stagger asChild step={80}>
        <ul className="grid gap-5 @3xl:grid-cols-2">
          {guides.map((g, i) => {
            const n = listings.filter((l) => l.hood === g.hood).length;
            return (
              <li key={g.hood}>
                <a
                  href={sitePageHref("listings")}
                  onClick={(e) => {
                    e.preventDefault();
                    setFilters((f) => ({ ...f, hood: g.hood, rooms: "any" }));
                    navigate({ page: "listings" });
                  }}
                  className="vm-lift group grid h-full grid-cols-[7rem_minmax(0,1fr)] overflow-hidden rounded-ui-lg bg-surface focus-ring [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-(--ease-out-quint) motion-reduce:[&_img]:transition-none pointer-fine:hover:[&_img]:scale-[1.05] @md:grid-cols-[11rem_minmax(0,1fr)]"
                >
                  <Image src={g.photo.src} width={g.photo.width} height={g.photo.height} alt={t(g.photo.alt)} aspect="auto" className="h-full" sizes="176px" />
                  <span className="flex flex-col gap-3 p-5">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[1.6rem] leading-none text-fg">{hoods[g.hood].name}</span>
                      <span className="font-mono text-[11px] text-fg-muted">0{i + 1}</span>
                    </span>
                    <span className="text-small text-fg-muted">{t(g.line)}</span>
                    <span className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-3 text-small">
                      <span className="flex flex-col">
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-muted">{t(c.sqm)}</span>
                        <span className="tabular text-fg">{tl(g.sqm, locale)}</span>
                      </span>
                      <span className="flex flex-col">
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-muted">{t(c.rent)}</span>
                        <span className="tabular text-fg">{tl(g.rent, locale)}</span>
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-2 text-small text-fg-muted">
                      {t(g.commute)}
                      <span className="inline-flex items-center gap-1 text-fg">
                        {fill(t(c.homes), { n })}
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                      </span>
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        </Stagger>
      </Container>
    </Section>
  );
}

export function CalculatorSection() {
  const { t } = useEstate();
  return (
    <Section anchor="mortgage" headingId="hl-calc-h">
      <Container size="wide">
        <SectionHeader eyebrow={t(c.calcEyebrow)} title={t(c.calcTitle)} lead={t(c.calcLead)} align="split" className="mb-12" headingId="hl-calc-h" />
        <MortgageCalculator />
      </Container>
    </Section>
  );
}
