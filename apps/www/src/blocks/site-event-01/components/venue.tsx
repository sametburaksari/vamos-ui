import { Container, Section, SectionHeader } from "@vamos-ui/react/blocks";
import { TrackShape } from "./schedule-board";
import type { Copy } from "./content";

/**
 * Venue: how to get there beside a geometric map drawn from tokens (water, streets, the hall,
 * the pier and the metro as the conference's shapes). Fictional layout, not a real street map.
 */
export function Venue({ c }: { c: Copy }) {
  const { t } = c;
  const facts: [string, string, string][] = [
    [t({ en: "Address", tr: "Adres" }), "Kalafat Hall", t({ en: "Tersane Yolu 12, Hasköy, Beyoğlu, Istanbul", tr: "Tersane Yolu 12, Hasköy, Beyoğlu, İstanbul" })],
    [t({ en: "By ferry", tr: "Vapurla" }), t({ en: "Hasköy pier", tr: "Hasköy iskelesi" }), t({ en: "4 min walk · boats from Eminönü every 30 min", tr: "4 dk yürüme · Eminönü’nden 30 dakikada bir sefer" })],
    [t({ en: "By metro", tr: "Metroyla" }), t({ en: "Haliç station", tr: "Haliç istasyonu" }), t({ en: "15 min walk, or our shuttle every 20 min", tr: "15 dk yürüme ya da 20 dakikada bir servisimiz" })],
    [t({ en: "Stay", tr: "Konaklama" }), t({ en: "Two partner hotels", tr: "İki anlaşmalı otel" }), t({ en: "15% off with code IFD27, until 1 April", tr: "IFD27 koduyla %15 indirim, 1 Nisan’a kadar" })],
  ];
  return (
    <Section anchor="venue" headingId="ifd-venue-title" theme={{ surface: "surface-2" }}>
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeader headingId="ifd-venue-title" eyebrow={t({ en: "Venue", tr: "Mekân" })} title={t({ en: "A shipyard hall on the *Golden Horn*", tr: "*Haliç*’te bir tersane salonu" })} />
            <dl className="m-0 mt-10 border-t-2 border-fg">
              {facts.map(([k, v, d]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4">
                  <dt className="font-mono text-[11px] font-semibold tracking-[0.1em] text-fg-muted uppercase">{k}</dt>
                  <dd className="m-0">
                    <span className="block font-semibold text-fg">{v}</span>
                    <span className="block text-small text-fg-muted">{d}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="m-0">
            <svg viewBox="0 0 700 520" role="img" aria-label={t({ en: "Map: Kalafat Hall on the north shore of the Golden Horn, the Hasköy pier just west of it and Haliç metro station to the south-east, across the water.", tr: "Harita: Kalafat Hall Haliç’in kuzey kıyısında, Hasköy iskelesi hemen batısında, Haliç metro istasyonu güneydoğuda, suyun karşısında." })} className="block h-auto w-full border-2 border-fg bg-scene">
              <g stroke="var(--line)" strokeWidth="1.5" fill="none">
                {[60, 130, 200, 270, 340, 410, 480, 550, 620].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x - 40} y2="520" />)}
                {[50, 110, 170].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="700" y2={y + 30} />)}
                {[390, 450, 500].map((y) => <line key={`s${y}`} x1="0" y1={y} x2="700" y2={y - 40} />)}
              </g>
              <path d="M0 250 C 160 200, 300 300, 460 250 S 640 190, 700 210 L 700 330 C 620 320, 520 380, 420 360 S 160 300, 0 360 Z" fill="var(--surface-2)" stroke="var(--fg)" strokeWidth="2" />
              <text x="470" y="300" fontFamily="var(--font-code)" fontSize="13" letterSpacing="3" fill="var(--fg-muted)">HALİÇ</text>
              <path d="M140 225 L 210 225" stroke="var(--fg)" strokeWidth="6" />
              <polygon points="210,172 236,214 184,214" fill="var(--fg)" />
              <rect x="300" y="150" width="78" height="62" fill="var(--accent)" stroke="var(--fg)" strokeWidth="2" />
              <path d="M236 200 C 260 200, 280 190, 300 185" stroke="var(--fg)" strokeWidth="2" strokeDasharray="5 6" fill="none" />
              <circle cx="560" cy="420" r="16" fill="var(--scene)" stroke="var(--fg)" strokeWidth="4" />
              <text x="300" y="138" fontFamily="var(--font-ui)" fontWeight="700" fontSize="18" fill="var(--fg)">Kalafat Hall</text>
              <text x="150" y="160" fontFamily="var(--font-code)" fontSize="12" fill="var(--fg-muted)">{t({ en: "PIER", tr: "İSKELE" })}</text>
              <text x="586" y="425" fontFamily="var(--font-code)" fontSize="12" fill="var(--fg-muted)">M2</text>
            </svg>
            <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-fg-muted">
              <span className="flex items-center gap-2"><span aria-hidden className="size-2.5 bg-accent ring-1 ring-fg" />Kalafat Hall</span>
              <span className="flex items-center gap-2"><TrackShape shape="triangle" />{t({ en: "Ferry pier", tr: "Vapur iskelesi" })}</span>
              <span className="flex items-center gap-2"><TrackShape />{t({ en: "Metro", tr: "Metro" })}</span>
              <span>{t({ en: "Not to scale", tr: "Ölçekli değildir" })}</span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}
