import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import type { BlockBaseProps } from "../types";
import type { AddressValue, OpeningHours } from "../schema/types";
import { labelTemplates, site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { addressLines, fieldAttr, prettyPhone, telHref, useBlockIds2, type SiteImage2 } from "./shared/kit-2";
import { openingHoursJsonLd, weekRows, summarizeHours } from "./shared/opening-hours";
import { OpenNow } from "./shared/open-now";
import { ConsentGate } from "./shared/consent-gate";
import { openNowLabelKeys, type OpenNowLabels } from "./shared/island-keys";
import { BrandIcon, BRAND_NAMES, type BrandName } from "./shared/brand-icons";

export type MapHoursVariant = "map-split" | "info" | "branches";
export type DirectionsProvider = "google" | "apple" | "yandex" | "waze";
export type BusinessType = "LocalBusiness" | "Restaurant" | "DaySpa" | "BeautySalon" | "MedicalClinic" | "ProfessionalService" | "EventVenue";
/** How the weekly hours show: every day (`week`), only days with hours or a note (`open-days`), or not at all (`none`). */
export type HoursDisplay = "week" | "open-days" | "none";

export interface Branch {
  name: string;
  address: AddressValue;
  /** E.164. */
  phone?: string;
  email?: string;
  hours: OpeningHours;
  /** Static map picture for the facade (greyscale, an accent pin on top). */
  mapImage?: SiteImage2;
  /** Google Business Profile / place link. */
  placeUrl?: string;
  /** Custom embed URL; default: a keyless Google Maps or OpenStreetMap embed built from the address. */
  mapEmbedUrl?: string;
  /** "Parking on level −2 of Piazza." */
  notes?: React.ReactNode;
}

export interface MapHoursProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * map-split: map facade on the start side, address, hours and directions on the end side.
   * info: no map — Address / Hours / Contact in three typographic columns. branches: a location
   * picker beside the selected location's details and map (radios + `:has()`, 0 JS).
   */
  variant?: MapHoursVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  branches: Branch[];
  businessType?: BusinessType;
  /** Embed provider loaded by the facade. Default `"google"`. */
  mapProvider?: "google" | "osm" | "none";
  /** Direction links. Default google · apple (Yandex is common in Turkey, Waze elsewhere). */
  directions?: DirectionsProvider[];
  /** "Open now · closes at 22:00" island. Default true. */
  showOpenNow?: boolean;
  /**
   * Weekly hours: `week` (default) lists all seven days, `open-days` hides closed days (a venue
   * open only on event weekends), `none` drops the hours table — JSON-LD still carries the hours.
   */
  hoursDisplay?: HoursDisplay;
  /** Fixed "now" (ISO) for previews and tests; marks today in the hours table. Default the render time. */
  now?: string;
  labels?: Site2BlockLabels;
}

const DIRECTION_BRAND: Record<DirectionsProvider, BrandName> = { google: "google-maps", apple: "apple-maps", yandex: "yandex-maps", waze: "waze" };

const query = (b: Branch) => (b.address.geo ? `${b.address.geo.lat},${b.address.geo.lng}` : [b.name, ...addressLines(b.address, { withCountry: true })].join(", "));

/** Direction URL for a provider (no API keys). */
export function directionsUrl(provider: DirectionsProvider, b: Branch): string {
  const q = encodeURIComponent(query(b));
  const geo = b.address.geo;
  switch (provider) {
    case "google":
      return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
    case "apple":
      return `https://maps.apple.com/?daddr=${q}`;
    case "yandex":
      return geo ? `https://yandex.com/maps/?rtext=~${geo.lat}%2C${geo.lng}` : `https://yandex.com/maps/?text=${q}`;
    case "waze":
      return geo ? `https://waze.com/ul?ll=${geo.lat}%2C${geo.lng}&navigate=yes` : `https://waze.com/ul?q=${q}&navigate=yes`;
  }
}

/** Keyless embed URL (Google `output=embed` or an OpenStreetMap export frame). */
export function mapEmbedUrl(b: Branch, provider: "google" | "osm" = "google"): string | undefined {
  if (b.mapEmbedUrl) return b.mapEmbedUrl;
  if (provider === "osm") {
    const g = b.address.geo;
    if (!g) return undefined;
    const d = 0.004;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${g.lng - d}%2C${g.lat - d}%2C${g.lng + d}%2C${g.lat + d}&layer=mapnik&marker=${g.lat}%2C${g.lng}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(query(b))}&z=16&output=embed`;
}

/** schema.org LocalBusiness (or a subtype) per branch — usable without the renderer. */
export function localBusinessJsonLd(props: Pick<MapHoursProps, "branches" | "businessType">): Record<string, unknown>[] {
  return props.branches.map((b) => ({
    "@type": props.businessType ?? "LocalBusiness",
    name: b.name,
    telephone: b.phone,
    email: b.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address.line,
      addressLocality: b.address.district ?? b.address.city,
      addressRegion: b.address.region ?? b.address.city,
      postalCode: b.address.postalCode,
      addressCountry: b.address.country,
    },
    geo: b.address.geo ? { "@type": "GeoCoordinates", latitude: b.address.geo.lat, longitude: b.address.geo.lng } : undefined,
    hasMap: b.placeUrl,
    openingHoursSpecification: openingHoursJsonLd(b.hours),
  }));
}

/**
 * Address, map, opening hours and directions for a local business — the most visited section of
 * restaurant, spa and clinic sites, and the source of LocalBusiness SEO. The map is a facade (no
 * Maps JS API, no key); the iframe loads after a click or functional consent. "Open now" is a
 * client island computed in the business's time zone. Server component.
 *
 * ```tsx
 * <MapHours title="Find *us*" branches={[{ name: "Meyhane Rasimpaşa", address, phone: "+902160000000", hours, mapImage }]} directions={["google", "apple", "yandex"]} />
 * ```
 */
export function MapHours({
  variant: variantProp = "map-split",
  eyebrow,
  title,
  lead,
  branches,
  businessType,
  mapProvider = "google",
  directions = ["google", "apple"],
  showOpenNow = true,
  hoursDisplay = "week",
  now,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: MapHoursProps) {
  const t = site2Text(labels, locale);
  const { base, headingId } = useBlockIds2(id, "location");
  const first = branches[0];
  let variant = variantProp;
  if (variant === "branches" && branches.length < 2) variant = "map-split";
  if (variant === "map-split" && (!first?.mapImage?.src || mapProvider === "none")) variant = "info";
  const ctx: BranchCtx = { t, locale, components, labels, editMode, now, showOpenNow, hoursDisplay, directions, mapProvider, openNow: labelTemplates(labels, openNowLabelKeys) };
  const header = title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} /> : null;
  if (!first) return null;

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="location" editMode={editMode} className={cn("vb-location", className)} data-variant={variant} data-business={businessType}>
      <Container className="flex flex-col gap-12 @4xl:gap-16">
        {variant === "map-split" ? (
          <div className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
            <div className="@4xl:col-span-7">
              <MapFacade branch={first} ctx={ctx} />
            </div>
            <div className="flex flex-col gap-8 @4xl:col-span-5">
              {header}
              <BranchDetails branch={first} ctx={ctx} index={0} />
            </div>
          </div>
        ) : variant === "info" ? (
          <>
            {header}
            <InfoColumns branch={first} ctx={ctx} />
          </>
        ) : (
          <>
            {header}
            <BranchPicker branches={branches} ctx={ctx} name={`${base}-branch`} />
          </>
        )}
      </Container>
    </Section>
  );
}

interface BranchCtx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
  now?: string;
  showOpenNow: boolean;
  hoursDisplay: HoursDisplay;
  directions: DirectionsProvider[];
  mapProvider: "google" | "osm" | "none";
  openNow: OpenNowLabels;
}

function MapFacade({ branch, ctx }: { branch: Branch; ctx: BranchCtx }) {
  const src = ctx.mapProvider !== "none" ? mapEmbedUrl(branch, ctx.mapProvider) : undefined;
  const preview = branch.mapImage?.src ? (
    <>
      <BlockImage {...branch.mapImage} decorative aspect="4:3" sizes="(min-width: 56rem) 58vw, 100vw" className="size-full" imgClassName="vb-map-img" components={ctx.components} />
      <span aria-hidden className="vb-map-pin absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-accent rtl:translate-x-1/2">
        <svg viewBox="0 0 32 40" className="h-10 w-8 drop-shadow-sm">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 11.2 14.4 23.2 15.04 23.72a1.5 1.5 0 0 0 1.92 0C17.6 39.2 32 27.2 32 16 32 7.16 24.84 0 16 0Z" fill="currentColor" />
          <circle cx="16" cy="16" r="6" fill="var(--accent-fg)" />
        </svg>
      </span>
    </>
  ) : null;
  if (!src) return preview ? <div className="vb-gate relative aspect-[4/3] overflow-hidden rounded-ui bg-surface-2">{preview}</div> : null;
  return (
    <ConsentGate
      src={src}
      title={ctx.t("mapOf", { name: branch.name })}
      loadLabel={ctx.t("loadMap")}
      notice={ctx.t("mapNotice", { provider: ctx.mapProvider === "osm" ? "OpenStreetMap" : "Google Maps" })}
      rememberLabel={ctx.t("rememberChoice")}
      category="functional"
    >
      {preview}
    </ConsentGate>
  );
}

/**
 * Weekly hours as a table; today is bold with `aria-current="date"`, special days show their note.
 * `openDaysOnly` leaves out closed days that carry no note.
 */
export function HoursTable({ hours, caption, t, locale, now, openDaysOnly, className }: { hours: OpeningHours; caption: string; t: Site2Text; locale: string; now?: string; openDaysOnly?: boolean; className?: string }) {
  const all = weekRows(hours, { locale, at: now ?? Date.now() });
  const rows = openDaysOnly ? all.filter((r) => !r.closed || r.note) : all;
  if (!rows.length) return null;
  return (
    <table className={cn("vb-hours w-full border-collapse text-small", className)}>
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.weekday} aria-current={r.today ? "date" : undefined} className={cn("border-b border-line last:border-b-0", r.today && "font-medium text-fg")}>
            <th scope="row" className={cn("py-2.5 pe-4 text-start font-normal", r.today ? "font-medium text-fg" : "text-fg-muted")}>
              {r.label}
              {r.today ? <span className="ms-2 font-mono text-eyebrow uppercase tracking-[0.06em] text-accent-ink">{t("today")}</span> : null}
            </th>
            <td className={cn("py-2.5 text-end tabular", r.closed ? "text-fg-subtle" : "text-fg")}>
              {r.closed ? t("closedDay") : r.allDay ? t("open24h") : r.text}
              {r.note ? <span className="block text-xs text-fg-muted">{r.note}</span> : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Directions({ branch, ctx }: { branch: Branch; ctx: BranchCtx }) {
  if (!ctx.directions.length) return null;
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("directions")}</p>
      <ul className="flex flex-wrap gap-2">
        {ctx.directions.map((p) => (
          <li key={p}>
            <a
              href={directionsUrl(p, branch)}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`directions:${p}`}
              className="inline-flex h-11 items-center gap-2 rounded-ui border border-line px-3.5 text-sm text-fg transition-colors hover:border-fg focus-ring"
            >
              <BrandIcon name={DIRECTION_BRAND[p]} className="size-4 text-fg-muted" />
              {BRAND_NAMES[DIRECTION_BRAND[p]]}
              <span className="sr-only">
                {" "}
                {ctx.t("opensInNewTab")}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddressBlock({ branch, ctx, large }: { branch: Branch; ctx: BranchCtx; large?: boolean }) {
  return (
    <address className={cn("not-italic text-fg", large ? "text-lead" : "text-body")}>
      {addressLines(branch.address, { locale: ctx.locale }).map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </address>
  );
}

function BranchDetails({ branch, ctx, index }: { branch: Branch; ctx: BranchCtx; index: number }) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3" {...fieldAttr(ctx.editMode, `branches.${index}.address`)}>
        <AddressBlock branch={branch} ctx={ctx} large />
        {branch.notes ? <p className="text-small text-fg-muted">{branch.notes}</p> : null}
        {branch.phone ? (
          <a href={telHref(branch.phone)} className="self-start text-body font-medium tabular text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]" data-track="call">
            {prettyPhone(branch.phone)}
          </a>
        ) : null}
      </div>
      {ctx.hoursDisplay !== "none" || ctx.showOpenNow ? (
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("openingHours")}</p>
            {ctx.showOpenNow ? <OpenNow hours={branch.hours} labels={ctx.openNow} locale={ctx.locale} now={ctx.now} /> : null}
          </div>
          {ctx.hoursDisplay !== "none" ? (
            <HoursTable hours={branch.hours} caption={ctx.t("openingHoursOf", { name: branch.name })} t={ctx.t} locale={ctx.locale} now={ctx.now} openDaysOnly={ctx.hoursDisplay === "open-days"} />
          ) : null}
        </div>
      ) : null}
      <Directions branch={branch} ctx={ctx} />
    </div>
  );
}

function InfoColumns({ branch, ctx }: { branch: Branch; ctx: BranchCtx }) {
  const summary = summarizeHours(branch.hours, ctx.locale).filter((s) => ctx.hoursDisplay !== "open-days" || !s.closed);
  const showHours = ctx.hoursDisplay !== "none" || ctx.showOpenNow;
  return (
    <div className={cn("grid gap-x-(--gutter) gap-y-10 border-t border-line pt-8", showHours ? "@2xl:grid-cols-3" : "@2xl:grid-cols-2")}>
      <div className="flex flex-col gap-3">
        <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("address")}</p>
        <AddressBlock branch={branch} ctx={ctx} large />
        {branch.notes ? <p className="text-small text-fg-muted">{branch.notes}</p> : null}
        {ctx.directions[0] ? (
          <a href={directionsUrl(ctx.directions[0], branch)} target="_blank" rel="noopener noreferrer" className="mt-1 self-start text-small font-medium text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]" data-track={`directions:${ctx.directions[0]}`}>
            {ctx.t("directionsVia", { provider: BRAND_NAMES[DIRECTION_BRAND[ctx.directions[0]]] })}
            <span className="sr-only"> {ctx.t("opensInNewTab")}</span>
          </a>
        ) : null}
      </div>
      {showHours ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("hours")}</p>
          </div>
          {ctx.hoursDisplay !== "none" ? (
            <ul className="flex flex-col gap-1.5 text-lead">
              {summary.map((s, i) => (
                <li key={i} className="flex justify-between gap-6 tabular">
                  <span className="text-fg-muted">{s.days}</span>
                  <span className={s.closed ? "text-fg-subtle" : "text-fg"}>{s.closed ? ctx.t("closedDay") : s.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {ctx.showOpenNow ? <OpenNow hours={branch.hours} labels={ctx.openNow} locale={ctx.locale} now={ctx.now} className="mt-2" /> : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("contactDetails")}</p>
        {branch.phone ? (
          <a href={telHref(branch.phone)} className="self-start text-lead font-medium tabular text-fg hover:text-accent-ink focus-ring rounded-[2px]" data-track="call">
            {prettyPhone(branch.phone)}
          </a>
        ) : null}
        {branch.email ? (
          <a href={`mailto:${branch.email}`} className="self-start text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]" data-track="email">
            {branch.email}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function BranchPicker({ branches, ctx, name }: { branches: Branch[]; ctx: BranchCtx; name: string }) {
  const list = branches.slice(0, 12);
  return (
    <div className="vb-branches grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
      <fieldset className="flex flex-col @4xl:col-span-4">
        <legend className="mb-3 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{ctx.t("chooseBranch")}</legend>
        <div className="flex flex-col border-t border-line">
          {list.map((b, i) => (
            <label key={i} className="vb-branch-option relative flex cursor-pointer flex-col gap-1 border-b border-line py-4 ps-4">
              <input type="radio" name={name} value={i} data-i={i} defaultChecked={i === 0} className="vb-branch-input sr-only" />
              <span className="text-h3 font-semibold tracking-[-0.012em] text-fg">{b.name}</span>
              <span className="text-small text-fg-muted">{b.address.district ?? b.address.city}</span>
              {ctx.showOpenNow ? <OpenNow hours={b.hours} labels={ctx.openNow} locale={ctx.locale} now={ctx.now} className="text-xs" /> : null}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="@4xl:col-span-8">
        {list.map((b, i) => (
          <div key={i} data-i={i} className="vb-branch-panel gap-x-(--gutter) gap-y-8 @2xl:grid-cols-2">
            <div className="@2xl:col-span-2">
              {b.mapImage?.src && ctx.mapProvider !== "none" ? <MapFacade branch={b} ctx={ctx} /> : null}
            </div>
            <h3 className="sr-only">{b.name}</h3>
            <div className="flex flex-col gap-3">
              <AddressBlock branch={b} ctx={ctx} large />
              {b.notes ? <p className="text-small text-fg-muted">{b.notes}</p> : null}
              {b.phone ? (
                <a href={telHref(b.phone)} className="self-start font-medium tabular text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]" data-track="call">
                  {prettyPhone(b.phone)}
                </a>
              ) : null}
              <div className="mt-3">
                <Directions branch={b} ctx={ctx} />
              </div>
            </div>
            {ctx.hoursDisplay !== "none" ? (
              <HoursTable hours={b.hours} caption={ctx.t("openingHoursOf", { name: b.name })} t={ctx.t} locale={ctx.locale} now={ctx.now} openDaysOnly={ctx.hoursDisplay === "open-days"} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
