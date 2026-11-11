"use client";

import * as React from "react";
import { Badge, Breadcrumb, Button, Image } from "@vamos-ui/react";
import { Container, Section, sitePageHref, waLink } from "@vamos-ui/react/blocks";
import { Lightbox, LightboxTrigger, type MediaSource } from "@vamos-ui/react/media";
import { Bookmark, BookmarkCheck, Check, Images, Phone } from "lucide-react";
import { CityMap } from "./city-map";
import { agentById, fill, hoods, listingById, tl, WHATSAPP } from "./content";
import { useEstate } from "./estate-provider";
import { MortgageCalculator } from "./mortgage-calculator";

const c = {
  home: { en: "Harbourline", tr: "Harbourline" },
  listings: { en: "Listings", tr: "İlanlar" },
  sale: { en: "For sale", tr: "Satılık" },
  rent: { en: "To rent", tr: "Kiralık" },
  perMonth: { en: "per month", tr: "aylık" },
  perSqm: { en: "{price} per m²", tr: "m² başına {price}" },
  photos: { en: "All {n} photos", tr: "{n} fotoğrafın tümü" },
  enlarge: { en: "Enlarge photo {n}: {alt}", tr: "{n}. fotoğrafı büyüt: {alt}" },
  facts: { en: "Key facts", tr: "Temel bilgiler" },
  rooms: { en: "Rooms", tr: "Oda" },
  size: { en: "Net area", tr: "Net alan" },
  floor: { en: "Floor", tr: "Kat" },
  built: { en: "Built", tr: "Yapım yılı" },
  ref: { en: "Reference", tr: "İlan no" },
  listed: { en: "Listed", tr: "Yayın" },
  about: { en: "About this home", tr: "Bu ev hakkında" },
  features: { en: "What you get", tr: "Neler var" },
  where: { en: "Where it is", tr: "Nerede" },
  whereNote: { en: "The exact address is shared after a viewing is booked.", tr: "Tam adres, gezme randevusu alındıktan sonra paylaşılır." },
  calc: { en: "Mortgage", tr: "Konut kredisi" },
  agent: { en: "Your agent for this home", tr: "Bu evin danışmanı" },
  call: { en: "Call {name}", tr: "{name} ile görüş" },
  viewing: { en: "Book a viewing", tr: "Gezme randevusu al" },
  waText: { en: "Hello, I would like to view {ref}.", tr: "Merhaba, {ref} numaralı ilanı görmek istiyorum." },
  save: { en: "Save", tr: "Kaydet" },
  saved: { en: "Saved", tr: "Kaydedildi" },
  speaks: { en: "Speaks {l}", tr: "{l} konuşur" },
};

/** Listing detail: lightbox gallery, facts, description, location map, calculator and agent. */
export function ListingPage() {
  const { locale, t, selected, saved, toggleSaved } = useEstate();
  const l = listingById(selected);
  const agent = agentById(l.agent);
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const date = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${l.listed}T00:00:00Z`));
  const isSaved = saved.includes(l.id);
  const items: MediaSource[] = l.photos.map((p, i) => ({ id: `${l.id}-${i}`, src: p.src, width: p.width, height: p.height, alt: t(p.alt), caption: `${t(l.title)} · ${i + 1}/${l.photos.length}` }));
  const facts: [string, string][] = [
    [t(c.rooms), l.rooms],
    [t(c.size), `${l.size} m²`],
    [t(c.floor), t(l.floor)],
    [t(c.built), String(l.built)],
    [t(c.ref), l.ref],
    [t(c.listed), date],
  ];

  return (
    <>
      <Section theme={{ rhythm: "tight" }} aria-labelledby="hl-listing-title">
        <Container size="wide">
          <Breadcrumb
            size="sm"
            className="mb-6"
            items={[{ label: t(c.home), href: sitePageHref("home") }, { label: t(c.listings), href: sitePageHref("listings") }, { label: hoods[l.hood].name }, { label: l.ref }]}
          />
          <div className="mb-8 flex flex-col gap-5 @4xl:flex-row @4xl:items-end @4xl:justify-between">
            <div className="flex max-w-3xl flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{t(c[l.deal])}</Badge>
                <span className="font-mono text-[12px] text-fg-muted">
                  {hoods[l.hood].name} · {t(hoods[l.hood].side)}
                </span>
              </div>
              <h1 id="hl-listing-title" className="font-display text-display-l text-balance text-fg">
                {t(l.title)}
              </h1>
            </div>
            <div className="flex flex-col gap-1 @4xl:items-end">
              <p className="tabular text-display-m font-semibold leading-none text-fg">{tl(l.price, locale)}</p>
              <p className="text-small text-fg-muted">{l.deal === "rent" ? t(c.perMonth) : fill(t(c.perSqm), { price: tl(Math.round(Number(l.price) / l.size), locale) })}</p>
            </div>
          </div>

          <Lightbox items={items}>
            <div className="grid gap-2 @3xl:h-[34rem] @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @3xl:grid-rows-2">
              {l.photos.slice(0, 3).map((p, i) => (
                <LightboxTrigger
                  key={p.src + i}
                  index={i}
                  className={`relative block overflow-hidden ${i === 0 ? "rounded-ui-lg @3xl:row-span-2" : "hidden rounded-ui @3xl:block"}`}
                >
                  <span className="sr-only">{fill(t(c.enlarge), { n: i + 1, alt: t(p.alt) })}</span>
                  <Image src={p.src} width={p.width} height={p.height} alt="" aspect={i === 0 ? "3/2" : "auto"} priority={i === 0} sizes={i === 0 ? "(min-width: 1024px) 60vw, 100vw" : "30vw"} className="size-full @3xl:aspect-auto!" />
                  {i === 2 || (i === 0 && l.photos.length > 1) ? (
                    <span className={`surface-popover absolute end-3 bottom-3 inline-flex items-center gap-2 rounded-ui px-3 py-1.5 text-small text-fg ${i === 0 ? "@3xl:hidden" : ""}`}>
                      <Images aria-hidden className="size-4" />
                      {fill(t(c.photos), { n: l.photos.length })}
                    </span>
                  ) : null}
                </LightboxTrigger>
              ))}
            </div>
          </Lightbox>

          <div className="mt-12 grid gap-12 @5xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] @5xl:gap-16">
            <div className="flex flex-col gap-12">
              <section aria-labelledby="hl-facts">
                <h2 id="hl-facts" className="sr-only">
                  {t(c.facts)}
                </h2>
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-ui-lg border border-line bg-line @2xl:grid-cols-3">
                  {facts.map(([k, v]) => (
                    <div key={k} className="flex flex-col gap-1 bg-surface p-4">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted">{k}</dt>
                      <dd className="text-body font-medium text-fg">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-labelledby="hl-about" className="flex flex-col gap-4">
                <h2 id="hl-about" className="font-display text-display-m text-fg">
                  {t(c.about)}
                </h2>
                <p className="max-w-[64ch] text-lead text-fg-muted">{t(l.description)}</p>
                <h3 className="mt-4 text-small font-semibold text-fg">{t(c.features)}</h3>
                <ul className="grid gap-2.5 @2xl:grid-cols-2">
                  {l.features.map((f) => (
                    <li key={f.en} className="flex items-start gap-3 text-fg">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent-ink" />
                      {t(f)}
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="hl-where" className="flex flex-col gap-4">
                <h2 id="hl-where" className="font-display text-display-m text-fg">
                  {t(c.where)}
                </h2>
                <CityMap items={[l]} single />
                <p className="text-small text-fg-muted">{t(c.whereNote)}</p>
              </section>

              {l.deal === "sale" ? (
                <section aria-labelledby="hl-calc" className="flex flex-col gap-6">
                  <h2 id="hl-calc" className="font-display text-display-m text-fg">
                    {t(c.calc)}
                  </h2>
                  <MortgageCalculator defaultPrice={Number(l.price)} idPrefix="detail" />
                </section>
              ) : null}
            </div>

            <aside aria-labelledby="hl-agent" className="@5xl:sticky @5xl:top-24 @5xl:self-start">
              <div className="surface flex flex-col gap-5 rounded-ui-lg p-6">
                <h2 id="hl-agent" className="text-small font-semibold text-fg-muted">
                  {t(c.agent)}
                </h2>
                <div className="flex items-center gap-4">
                  <Image src={agent.photo.src} width={agent.photo.width} height={agent.photo.height} alt={t(agent.photo.alt)} aspect="1/1" rounded="full" className="size-16 shrink-0" sizes="64px" />
                  <div>
                    <p className="font-display text-[1.35rem] leading-tight text-fg">{agent.name}</p>
                    <p className="text-small text-fg-muted">{t(agent.role)}</p>
                    <p className="text-xs text-fg-muted">{fill(t(c.speaks), { l: t(agent.languages) })}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="primary" size="lg" block>
                    <a href={waLink(WHATSAPP, fill(t(c.waText), { ref: l.ref }))} target="_blank" rel="noreferrer">
                      {t(c.viewing)}
                    </a>
                  </Button>
                  <Button asChild variant="secondary" block>
                    <a href={`tel:${agent.phone}`}>
                      <Phone aria-hidden />
                      {fill(t(c.call), { name: agent.name.split(" ")[0]! })}
                    </a>
                  </Button>
                  <Button variant="ghost" block aria-pressed={isSaved} onClick={() => toggleSaved(l.id)}>
                    {isSaved ? <BookmarkCheck aria-hidden className="text-accent-ink" /> : <Bookmark aria-hidden />}
                    {t(isSaved ? c.saved : c.save)}
                  </Button>
                </div>
                <p className="border-t border-line pt-4 font-mono text-[11px] text-fg-muted">
                  {l.ref} · {date}
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
