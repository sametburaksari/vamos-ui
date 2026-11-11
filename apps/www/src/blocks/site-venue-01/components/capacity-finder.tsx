"use client";

import * as React from "react";
import { Button, cn, Input, Slider, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BlockImage, useSiteShell } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { layouts, liraOf, numberOf, pick, spaces, type L, type LayoutId, type SiteLocale, type Space, type SpaceId } from "./content";
import { useVenue } from "./venue-provider";

const MIN = 10;
const MAX = 700;

const c = {
  layout: { en: "Layout", tr: "Düzen" },
  guests: { en: "Guests", tr: "Misafir" },
  guestsInput: { en: "Number of guests", tr: "Misafir sayısı" },
  result: { en: "{n} of {total} spaces take {guests} guests {layout}.", tr: "{total} alandan {n} tanesi {layout} {guests} misafir alıyor." },
  resultNone: { en: "No single space takes {guests} guests {layout}.", tr: "Tek başına hiçbir alan {layout} {guests} misafir almıyor." },
  together: { en: "Together", tr: "Birlikte" },
  combo: { en: "{a} + {b} take up to {n}", tr: "{a} + {b} en fazla {n} kişi alır" },
  tooBig: { en: "Over 700 guests? Talk to us about a marquee in the yard.", tr: "700’den fazla misafir mi? Avluya çadır için bizimle konuşun." },
  fits: { en: "Fits", tr: "Sığar" },
  small: { en: "Too small", tr: "Küçük" },
  na: { en: "Not in this layout", tr: "Bu düzende olmaz" },
  upTo: { en: "up to {n}", tr: "en fazla {n}" },
  from: { en: "from {price} a day", tr: "günlük {price}’den" },
  weekday: { en: "Mon–Thu", tr: "Pzt–Per" },
  enquire: { en: "Enquire", tr: "Talep gönder" },
  plan: { en: "Site plan of Old Mill Hall", tr: "Old Mill Hall vaziyet planı" },
  planDesc: { en: "Spaces that take {guests} guests {layout} are filled: {names}.", tr: "{layout} {guests} misafir alan alanlar dolu gösteriliyor: {names}." },
  planNone: { en: "none", tr: "hiçbiri" },
  stream: { en: "ÖMERLİ STREAM", tr: "ÖMERLİ DERESİ" },
  first: { en: "FIRST FLOOR", tr: "BİRİNCİ KAT" },
  yard: { en: "YARD · ENTRANCE", tr: "AVLU · GİRİŞ" },
  legendFit: { en: "Fits", tr: "Sığar" },
  legendNo: { en: "Too small or not in this layout", tr: "Küçük ya da bu düzende olmaz" },
  m2: { en: "m²", tr: "m²" },
} satisfies Record<string, L>;

/** "banquet-style" / "ziyafet düzeninde" */
const layoutPhrase: Record<LayoutId, L> = {
  banquet: { en: "banquet-style", tr: "ziyafet düzeninde" },
  reception: { en: "standing", tr: "ayakta" },
  theatre: { en: "theatre-style", tr: "tiyatro düzeninde" },
  cabaret: { en: "cabaret-style", tr: "kabare düzeninde" },
  classroom: { en: "classroom-style", tr: "sınıf düzeninde" },
  boardroom: { en: "around one table", tr: "tek masa etrafında" },
};

const COMBOS: [SpaceId, SpaceId][] = [
  ["grain", "terrace"],
  ["grain", "millstone"],
];

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");

/**
 * The signature: choose a layout and a head-count; the site plan fills the spaces that fit and
 * the list shows each space's capacity against the number. `detailed` adds photos, notes and
 * every layout's capacity (spaces page).
 */
export function CapacityFinder({ locale, detailed = false }: { locale: SiteLocale; detailed?: boolean }) {
  const t = (v: L) => pick(v, locale);
  const lira = liraOf(locale);
  const num = numberOf(locale);
  const { layout, guests, setLayout, setGuests, setPicked } = useVenue();
  const { navigate } = useSiteShell();
  const [hover, setHover] = React.useState<SpaceId | null>(null);
  const [draft, setDraft] = React.useState(String(guests));
  React.useEffect(() => setDraft(String(guests)), [guests]);

  const status = (s: Space) => {
    const cap = s.caps[layout];
    return cap === null ? "na" : cap >= guests ? "fits" : "small";
  };
  const fitting = spaces.filter((s) => status(s) === "fits");
  const phrase = t(layoutPhrase[layout]);
  const combos = fitting.length
    ? []
    : COMBOS.map(([a, b]) => {
        const sa = spaces.find((s) => s.id === a)!;
        const sb = spaces.find((s) => s.id === b)!;
        const ca = sa.caps[layout];
        const cb = sb.caps[layout];
        return ca !== null && cb !== null && ca + cb >= guests ? { a: sa, b: sb, n: ca + cb } : null;
      }).filter((x): x is { a: Space; b: Space; n: number } => !!x);

  const enquire = (ids: SpaceId[]) => {
    setPicked(ids);
    navigate({ page: "enquiry" });
  };

  const commitDraft = () => {
    const n = Math.round(Number(draft.replace(/\D/g, "")));
    if (Number.isFinite(n) && n > 0) setGuests(Math.min(MAX, Math.max(MIN, n)));
    else setDraft(String(guests));
  };

  return (
    <div>
      {/* Controls ---------------------------------------------------- */}
      <div className="grid gap-6 border-y-2 border-fg py-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end lg:gap-10">
        <div className="min-w-0">
          <p id="om-layout" className="m-0 mb-2 font-mono text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">
            {t(c.layout)}
          </p>
          <ToggleGroup aria-labelledby="om-layout" value={layout} onValueChange={(v) => v && setLayout(v as LayoutId)} className="max-w-full flex-wrap">
            {layouts.map((l) => (
              <ToggleGroupItem key={l.id} value={l.id} title={t(l.hint)}>
                {t(l.name)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_6.5rem] items-end gap-4">
          <div className="min-w-0">
            <p className="m-0 mb-3 font-mono text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">{t(c.guests)}</p>
            <Slider value={[guests]} onValueChange={(v) => setGuests(v[0] ?? guests)} min={MIN} max={MAX} step={10} thumbLabels={[t(c.guestsInput)]} />
          </div>
          <Input
            aria-label={t(c.guestsInput)}
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitDraft())}
            className="text-end font-mono tabular"
          />
        </div>
      </div>

      <p className="m-0 mt-5 font-display text-h3 text-fg" aria-live="polite">
        {fitting.length ? fill(t(c.result), { n: String(fitting.length), total: String(spaces.length), guests: num(guests), layout: phrase }) : fill(t(c.resultNone), { guests: num(guests), layout: phrase })}
      </p>
      {combos.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-accent-ink uppercase">{t(c.together)}</span>
          {combos.map((x) => (
            <Button key={x.a.id + x.b.id} size="sm" variant="secondary" onClick={() => enquire([x.a.id, x.b.id])}>
              {fill(t(c.combo), { a: t(x.a.name), b: t(x.b.name), n: num(x.n) })}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </Button>
          ))}
        </div>
      ) : !fitting.length ? (
        <p className="m-0 mt-2 text-fg-muted">{t(c.tooBig)}</p>
      ) : null}

      <div className={cn("mt-8 grid gap-8", detailed ? "" : "lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-12")}>
        {/* Plan -------------------------------------------------------- */}
        <figure className={cn("m-0", detailed && "lg:mx-auto lg:w-4/5")}>
          <svg viewBox="0 0 800 520" role="img" aria-label={`${t(c.plan)}. ${fill(t(c.planDesc), { guests: num(guests), layout: phrase, names: fitting.map((s) => t(s.name)).join(", ") || t(c.planNone) })}`} className="block h-auto w-full rounded-ui border border-line bg-surface">
            <defs>
              <pattern id="om-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="var(--line)" strokeWidth="2" />
              </pattern>
              <pattern id="om-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="var(--line)" strokeWidth="0.5" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="800" height="520" fill="url(#om-grid)" />
            {/* Stream + race */}
            <path d="M0 455 C 140 440, 260 470, 400 458 S 660 440, 800 452 L 800 520 L 0 520 Z" fill="var(--surface-2)" stroke="var(--fg-subtle)" strokeWidth="1" />
            <text x="560" y="495" fontFamily="var(--font-code)" fontSize="11" letterSpacing="3" fill="var(--fg-muted)">{t(c.stream)}</text>
            <text x="300" y="30" fontFamily="var(--font-code)" fontSize="11" letterSpacing="3" fill="var(--fg-muted)">{t(c.yard)}</text>
            <text x="630" y="58" fontFamily="var(--font-code)" fontSize="10" letterSpacing="2" fill="var(--fg-muted)">{t(c.first)}</text>
            {/* Outer wall of the mill */}
            <rect x="60" y="80" width="560" height="270" fill="none" stroke="var(--fg)" strokeWidth="4" />
            {spaces.map((s) => {
              const st = status(s);
              const p = s.plan;
              const on = st === "fits";
              const hi = hover === s.id;
              const cap = s.caps[layout];
              return (
                <g key={s.id} className="transition-opacity motion-reduce:transition-none">
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    fill={on ? "var(--accent)" : "url(#om-hatch)"}
                    fillOpacity={on ? (hi ? 1 : 0.88) : 1}
                    stroke="var(--fg)"
                    strokeWidth={hi ? 3.5 : p.outdoor || p.upper ? 1.5 : 2}
                    strokeDasharray={p.outdoor || p.upper ? "6 5" : undefined}
                  />
                  <text x={p.x + 12} y={p.y + 24} fontFamily="var(--font-heading)" fontSize={p.w < 150 ? 13 : p.w < 200 ? 16 : 19} fill={on ? "var(--accent-fg)" : "var(--fg)"}>
                    {t(s.name)}
                  </text>
                  <text x={p.x + 12} y={p.y + (p.h < 80 ? 46 : 44)} fontFamily="var(--font-code)" fontSize="12" fill={on ? "var(--accent-fg)" : "var(--fg-muted)"}>
                    {cap === null ? "—" : `${cap} · ${s.area} m²`}
                  </text>
                </g>
              );
            })}
          </svg>
          <figcaption className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-fg-muted">
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-3 bg-accent ring-1 ring-fg" />
              {t(c.legendFit)}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden className="size-3 ring-1 ring-fg [background:repeating-linear-gradient(45deg,var(--line)_0_2px,transparent_2px_5px)]" />
              {t(c.legendNo)}
            </span>
          </figcaption>
        </figure>

        {/* List -------------------------------------------------------- */}
        <ul className={cn("m-0 grid list-none gap-0 p-0", detailed && "md:grid-cols-2 md:gap-x-10")}>
          {spaces.map((s) => {
            const st = status(s);
            const cap = s.caps[layout];
            const pct = cap ? Math.min(100, (guests / cap) * 100) : 0;
            return (
              <li
                key={s.id}
                id={`space-${s.id}`}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(s.id)}
                onBlur={() => setHover(null)}
                className={cn("grid gap-3 border-t border-line py-5", detailed && "py-8")}
              >
                {detailed ? (
                  <BlockImage src={s.photo.src} width={s.photo.width} height={s.photo.height} alt={t(s.photo.alt)} aspect="3:2" sizes="(min-width: 48rem) 45vw, 100vw" className={cn("overflow-hidden rounded-ui transition-[filter,opacity]", st !== "fits" && "opacity-60 grayscale")} />
                ) : null}
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="m-0 font-display text-h3 text-fg">{t(s.name)}</h3>
                  <span className="font-mono text-xs text-fg-muted">
                    {t(s.floor)} · {s.area} {t(c.m2)}
                  </span>
                </div>
                {detailed ? <p className="m-0 text-fg-muted">{t(s.line)}</p> : null}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-track" aria-hidden>
                    <div className={cn("h-full rounded-full", st === "fits" ? "bg-accent" : "bg-fg-subtle")} style={{ width: `${cap ? pct : 0}%` }} />
                  </div>
                  <span className={cn("font-mono text-xs tabular", st === "fits" ? "text-accent-ink" : "text-fg-muted")}>
                    {st === "na" ? t(c.na) : `${t(st === "fits" ? c.fits : c.small)} · ${fill(t(c.upTo), { n: num(cap!) })}`}
                  </span>
                </div>
                {detailed ? (
                  <dl className="m-0 grid grid-cols-3 gap-px overflow-hidden rounded-ui-sm border border-line bg-line text-center sm:grid-cols-6">
                    {layouts.map((l) => (
                      <div key={l.id} className={cn("bg-surface px-1 py-2", l.id === layout && "bg-accent-soft")}>
                        <dt className="truncate text-[11px] text-fg">{t(l.name)}</dt>
                        <dd className="m-0 font-mono text-sm text-fg tabular">{s.caps[l.id] ?? "—"}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {detailed ? (
                  <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-small text-fg-muted">
                    <li>{t(s.ceiling)}</li>
                    {s.features.map((f) => (
                      <li key={t(f)}>· {t(f)}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-small text-fg-muted">
                    {fill(t(c.from), { price: lira(s.weekday) })} <span>({t(c.weekday)})</span>
                  </span>
                  <Button size="sm" variant={st === "fits" ? "primary" : "secondary"} className="rounded-none" onClick={() => enquire([s.id])} aria-label={`${t(c.enquire)}: ${t(s.name)}`}>
                    {t(c.enquire)}
                    <ArrowRight aria-hidden className="rtl:rotate-180" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
