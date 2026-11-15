"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { useFieldControl, type ControlA11yProps } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { compareText, foldText } from "../lib/text";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { controlVariants } from "../lib/variants";
import type { Address, AddressDataSource, AddressNeighbourhood, AddressPart, AddressProvince } from "../locale-data/core/types";
import { checkTrPostalCode, trAddress } from "../locale-data/tr/address";
import {
  addressFormatFallback,
  checkPostalCode,
  loadAddressFormats,
  peekAddressFormat,
  subscribeAddressFormats,
  type AddressFormat,
  type CityKind,
  type PostalCodeKind,
  type RegionKind,
  type SublocalityKind,
} from "../locale-data/world/formats";
import { formatAddress } from "../locale-data/world/format-address";
import { findSubdivision, parseSubdivisions, type Subdivision, type SubdivisionLoader } from "../locale-data/world/subdivisions";
import { bundledSubdivisions, SUBDIVISION_COUNTRIES } from "../locale-data/world/subdivisions-bundled";
import { Field, Fieldset, Input } from "./input";

export { formatAddress };
export type { Address, AddressPart };

/* ------------------------------------------------------------------ */
/* Types & data                                                        */
/* ------------------------------------------------------------------ */

/** ISO 3166-1 alpha-2 codes (names come from `Intl.DisplayNames`). */
const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW".split(
    " ",
  );

const addressLabels = {
  country: "Country",
  province: "Province",
  district: "District",
  state: "State / Province",
  city: "City",
  line1: "Street address",
  line2: "Apartment, suite, building",
  postalCode: "Postal code",
  zip: "ZIP code",
  select: "Select…",
  selectProvince: "Select a province",
  selectDistrict: "Select a district",
  neighbourhood: "Neighbourhood",
  selectNeighbourhood: "Select a neighbourhood",
  provinceFirst: "Choose a province first",
  districtFirst: "Choose a district first",
  loading: "Loading…",
  loadFailed: "Couldn't load the list",
  districtCleared: "District cleared",
  neighbourhoodCleared: "Neighbourhood cleared",
  postalMismatch: "Postal codes in {province} start with {prefix}",
  postalFormat: "Expected a code like {example}",
  stateName: "State",
  area: "Area",
  county: "County",
  department: "Department",
  doSi: "Province / city",
  emirate: "Emirate",
  island: "Island",
  oblast: "Region",
  parish: "Parish",
  prefecture: "Prefecture",
  postTown: "Post town",
  suburb: "Suburb",
  townland: "Townland",
  villageTownship: "Village / township",
  pin: "PIN code",
  eircode: "Eircode",
};
export type AddressFieldLabels = typeof addressLabels;

const REGION_LABEL: Record<RegionKind, keyof AddressFieldLabels> = {
  area: "area",
  county: "county",
  department: "department",
  district: "district",
  do_si: "doSi",
  emirate: "emirate",
  island: "island",
  oblast: "oblast",
  parish: "parish",
  prefecture: "prefecture",
  province: "province",
  state: "stateName",
};
const CITY_LABEL: Record<CityKind, keyof AddressFieldLabels> = { city: "city", district: "district", post_town: "postTown", suburb: "suburb" };
const SUBLOCALITY_LABEL: Record<SublocalityKind, keyof AddressFieldLabels> = {
  district: "district",
  neighborhood: "neighbourhood",
  suburb: "suburb",
  townland: "townland",
  village_township: "villageTownship",
};
const POSTAL_LABEL: Record<PostalCodeKind, keyof AddressFieldLabels> = { postal: "postalCode", zip: "zip", pin: "pin", eircode: "eircode" };

function displayNames(locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    return null;
  }
}

/**
 * The country's address format: the built-in rules on the first render (and on the server), the
 * full data once `address-formats.json` has loaded (one lazy chunk shared by every field).
 */
function useAddressFormat(country: string): AddressFormat {
  const cc = country.toUpperCase();
  const loaded = React.useSyncExternalStore(
    subscribeAddressFormats,
    () => peekAddressFormat(cc),
    () => undefined,
  );
  React.useEffect(() => {
    loadAddressFormats().catch(() => {});
  }, []);
  const fallback = React.useMemo(() => addressFormatFallback(cc), [cc]);
  return loaded ?? fallback;
}

/* ------------------------------------------------------------------ */
/* Native select (internal look shared with RegionSelect)              */
/* ------------------------------------------------------------------ */

interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">, ControlA11yProps {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

const NativeSelect = /*#__PURE__*/ React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect({ className, size = "md", invalid, children, ...rest }, ref) {
  const props = useFieldControl({ ...rest, "aria-invalid": invalid ? true : rest["aria-invalid"] });
  return (
    <div data-slot="address-select" className={cn(controlVariants({ size }), "px-0", className)}>
      <select
        ref={ref}
        {...props}
        className={cn(
          "h-full w-full min-w-0 cursor-pointer appearance-none rounded-[inherit] bg-transparent ps-3 pe-9 text-[length:inherit] text-fg outline-none disabled:cursor-not-allowed",
          props.value === "" && "text-fg-subtle",
        )}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute end-3 size-4 text-fg-subtle" />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* RegionSelect                                                        */
/* ------------------------------------------------------------------ */

/** One option of a RegionSelect: the stored text, plus the neighbourhood when it is one. */
export interface RegionOption {
  value: string;
  /** Shown text when it differs from the value ("California" for "CA"). */
  label?: string;
  neighbourhood?: AddressNeighbourhood;
  /** For a country's subdivisions: ISO 3166-2 code and names. */
  subdivision?: Subdivision;
}

type RegionLevel = "province" | "district" | "neighbourhood";

function useRegions(source: AddressDataSource | undefined, level: RegionLevel, province: string | undefined, district?: string) {
  const [state, setState] = React.useState<{ key: string; items: RegionOption[] | null; failed?: boolean }>({ key: "", items: null });
  const [provinces, setProvinces] = React.useState<AddressProvince[] | null>(null);
  const key = `${source?.id ?? ""}|${level}|${level !== "province" ? province ?? "" : ""}|${level === "neighbourhood" ? district ?? "" : ""}`;
  const cmp = React.useMemo(() => compareText(source?.id ?? "en"), [source?.id]);

  React.useEffect(() => {
    if (!source) return;
    let alive = true;
    source.provinces().then((p) => {
      if (alive) setProvinces(p);
    });
    return () => {
      alive = false;
    };
  }, [source]);

  React.useEffect(() => {
    if (!source || !provinces) return;
    let alive = true;
    const done = (items: RegionOption[]) => alive && setState({ key, items });
    const fail = () => alive && setState({ key, items: [], failed: true });
    if (level === "province") {
      done([...provinces].sort((a, b) => cmp(a.name, b.name)).map((p) => ({ value: p.name })));
    } else {
      const p = provinces.find((x) => x.name === province);
      if (!p) done([]);
      else if (level === "district") source.districts(p.code).then((d) => done(d.map((x) => ({ value: x.name }))), fail);
      else if (!district || !source.neighbourhoods) done([]);
      else
        source
          .districts(p.code)
          .then((ds) => {
            const d = ds.find((x) => x.name === district);
            return d ? source.neighbourhoods!(p.code, d.code) : [];
          })
          .then((ns) => done(ns.map((n) => ({ value: n.label, neighbourhood: n }))), fail);
    }
    return () => {
      alive = false;
    };
  }, [source, provinces, level, province, district, key, cmp]);

  const current = state.key === key ? state : null;
  return { items: current?.items ?? null, failed: !!current?.failed, provinces };
}

/** A country's subdivisions for `locale`, loaded lazily (`null` while loading). */
function useSubdivisions(loader: SubdivisionLoader | undefined, country: string | undefined, locale: string) {
  const key = `${country ?? ""}|${locale}`;
  const [state, setState] = React.useState<{ key: string; items: Subdivision[] | null; failed?: boolean }>({ key: "", items: null });
  React.useEffect(() => {
    if (!loader || !country) return;
    let alive = true;
    loader(country).then(
      (file) => alive && setState({ key, items: file ? parseSubdivisions(file, locale) : [] }),
      () => alive && setState({ key, items: [], failed: true }),
    );
    return () => {
      alive = false;
    };
  }, [loader, country, locale, key]);
  const current = state.key === key ? state : null;
  // The bundled loader knows synchronously which countries have a file: no select flashes in
  // for a country without subdivisions.
  const none = loader === bundledSubdivisions && !!country && !SUBDIVISION_COUNTRIES.includes(country.toUpperCase());
  return { items: none ? [] : (current?.items ?? null), failed: !!current?.failed };
}

export interface RegionSelectProps extends Omit<NativeSelectProps, "value" | "defaultValue" | "onChange"> {
  /** Cascading region data (e.g. `trAddress` from `@vamos-ui/react/locale-data`). Without it, `country` lists that country's subdivisions. */
  source?: AddressDataSource;
  /** ISO 3166-1 alpha-2: lists its states / provinces / prefectures (when there is no `source`). */
  country?: string;
  /** Where subdivision files come from. Default: the files in the package, one lazy chunk per country. */
  subdivisions?: SubdivisionLoader;
  /** With a `source`: which list. `"neighbourhood"` needs a source with a `neighbourhoods` level (`trAddressWithNeighbourhoods`). Default `"province"`. */
  level?: RegionLevel;
  /** Parent province name, for `level="district"` and `"neighbourhood"`. */
  province?: string;
  /** Parent district name, for `level="neighbourhood"`. */
  district?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (name: string) => void;
  /** Like `onValueChange`, with the picked option (a neighbourhood carries its postal code, a subdivision its ISO code). */
  onOptionChange?: (option: RegionOption | null) => void;
  /** First option text. */
  placeholder?: string;
  labels?: Partial<AddressFieldLabels>;
}

/**
 * Region picker, loaded lazily: a country's subdivisions (`country="US"` → states, values as
 * the post writes them: "CA"), or province / district / neighbourhood over a cascading source
 * (`trAddress`). Use alone in filter bars ("Branches in İzmir") or inside AddressField.
 *
 * ```tsx
 * <Field label="State"><RegionSelect country="US" /></Field>
 * <Field label="Province"><RegionSelect source={trAddress} level="province" /></Field>
 * ```
 */
export const RegionSelect = /*#__PURE__*/ React.forwardRef<HTMLSelectElement, RegionSelectProps>(function RegionSelect(
  { source, country, subdivisions = bundledSubdivisions, level = "province", province, district, value, defaultValue, onValueChange, onOptionChange, placeholder, labels, disabled, ...rest },
  ref,
) {
  const t = useLabels("address", addressLabels, labels);
  const { locale } = useLocale();
  const [current, setCurrent] = useControllableState<string>({ value, defaultValue: defaultValue ?? "", onChange: onValueChange, name: "RegionSelect" });
  const regions = useRegions(source, level, province, district);
  const subs = useSubdivisions(source ? undefined : subdivisions, source ? undefined : country, locale);
  const world = !source;
  const items: RegionOption[] | null = world
    ? (subs.items?.map((x) => ({ value: x.value, label: x.label, subdivision: x })) ?? null)
    : regions.items;
  const failed = world ? subs.failed : regions.failed;
  const needsProvince = !world && level !== "province" && !province;
  const needsDistrict = !world && level === "neighbourhood" && !!province && !district;
  const needsParent = needsProvince || needsDistrict;
  const loading = !needsParent && items === null && (!world || !!country);
  let shown = current;
  const known = items?.some((x) => x.value === current);
  // A stored name or code of a known subdivision ("California" or "US-CA" for "CA") selects it.
  if (world && current && !known && subs.items) shown = findSubdivision(subs.items, current)?.value ?? current;
  const matched = shown !== current || known;
  const first = loading
    ? t("loading")
    : needsProvince
      ? t("provinceFirst")
      : needsDistrict
        ? t("districtFirst")
        : failed
          ? t("loadFailed")
          : placeholder ?? (world ? t("select") : level === "province" ? t("selectProvince") : level === "district" ? t("selectDistrict") : t("selectNeighbourhood"));
  return (
    <NativeSelect
      ref={ref}
      {...rest}
      value={shown}
      disabled={disabled || needsParent || loading}
      aria-busy={loading || undefined}
      data-level={world ? "subdivision" : level}
      onChange={(e) => {
        const v = e.currentTarget.value;
        setCurrent(v);
        onOptionChange?.(v ? (items?.find((x) => x.value === v) ?? { value: v }) : null);
      }}
    >
      <option value="">{first}</option>
      {current && !matched && !loading ? <option value={current}>{current}</option> : null}
      {items?.map((x) => (
        <option key={x.value} value={x.value}>
          {x.label ?? x.value}
        </option>
      ))}
    </NativeSelect>
  );
});

/* ------------------------------------------------------------------ */
/* AddressField                                                        */
/* ------------------------------------------------------------------ */

export interface AddressFieldProps extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, "defaultValue" | "onChange" | "required"> {
  value?: Address | null;
  defaultValue?: Address | null;
  onValueChange?: (address: Address) => void;
  /**
   * Cascading region data per country. Default `{ TR: trAddress }` (81 provinces, 973 districts,
   * lazy). A source with a `neighbourhoods` level (`trAddressWithNeighbourhoods`) adds a
   * neighbourhood picker. Other countries follow their address format.
   */
  sources?: Record<string, AddressDataSource>;
  /**
   * Subdivision lists (states, provinces, prefectures, emirates) for countries without a cascading
   * source. Default: the files in the package, one lazy chunk per country (202 countries). `false`
   * keeps a text field.
   */
  subdivisions?: SubdivisionLoader | false;
  /** Country list. Default: every country. */
  countries?: string[];
  /** Initial country when there is no value. Default `"TR"` for Turkish locales, else the locale's region. */
  defaultCountry?: string;
  /**
   * Parts to show. Default: the parts the country's addresses use, in the country's order (a
   * country without postal codes gets none; Germany gets no state); for a country with a
   * cascading source, all parts (`region3` only when the source has neighbourhoods).
   */
  fields?: AddressPart[];
  /** Required parts, or `"auto"` for the country's own rules (e.g. US: street, city, state, ZIP). */
  required?: AddressPart[] | "auto";
  /** `"grid"` (rows as the country writes them, side by side from `sm`, default) or `"stack"`. */
  layout?: "grid" | "stack";
  /** Prefix for form names: `billing` → `billing[country]`, `billing[region1]`… */
  name?: string;
  legend?: React.ReactNode;
  hint?: React.ReactNode;
  /** Per-part errors from your validation. */
  errors?: Partial<Record<AddressPart, React.ReactNode>>;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  labels?: Partial<AddressFieldLabels>;
}

const DEFAULT_FIELDS: AddressPart[] = ["country", "region1", "region2", "line1", "line2", "postalCode"];
const DEFAULT_FIELDS_WITH_NEIGHBOURHOOD: AddressPart[] = ["country", "region1", "region2", "region3", "line1", "line2", "postalCode"];
/** Order of the parts for countries with a cascading source (pickers top-down) and for leftovers. */
const CASCADE_ORDER: AddressPart[] = ["country", "postalCode", "region1", "region2", "region3", "line1", "line2"];
const ROW_COLS = ["", "", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"];

const sameLanguage = (locale: string, lang: string | undefined) => !!lang && locale.toLowerCase().split(/[-_]/)[0] === lang.toLowerCase().split(/[-_]/)[0];

/** Rows of parts as the country writes them: one row per format line, street lines on their own. */
function formatRows(format: AddressFormat, latin: boolean): AddressPart[][] {
  const rows: AddressPart[][] = [["country"]];
  for (const line of latin && format.latinLines ? format.latinLines : format.lines) {
    let row: AddressPart[] = [];
    for (const t of line) {
      if (!("part" in t)) continue;
      if (t.part === "street") {
        if (row.length) rows.push(row);
        rows.push(["line1"], ["line2"]);
        row = [];
      } else if (!row.includes(t.part)) row.push(t.part);
    }
    if (row.length) rows.push(row);
  }
  return rows;
}

/**
 * Structured postal address in a fieldset, laid out the way each country writes addresses: Germany
 * gets street, PLZ and city; the US street, city, state and ZIP code; Japan postal code,
 * prefecture and street; the Emirates no postal code at all. Field names follow the country
 * ("Prefecture", "Emirate", "PIN code", "Eircode"), postal codes are checked against the country's
 * pattern. Türkiye gets cascading province → district pickers (built in, loaded lazily).
 * Changing a parent clears its children (and says so to screen readers). Read-only shows the
 * address formatted the way the country writes it.
 *
 * ```tsx
 * <AddressField legend="Billing address" name="billing" defaultValue={{ country: "TR" }} required={["line1", "region1", "region2"]} />
 * ```
 */
export const AddressField = /*#__PURE__*/ React.forwardRef<HTMLFieldSetElement, AddressFieldProps>(function AddressField(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    sources = { TR: trAddress },
    subdivisions = bundledSubdivisions,
    countries,
    defaultCountry,
    fields: fieldsProp,
    required: requiredProp = [],
    layout = "grid",
    name,
    legend,
    hint,
    errors,
    readOnly,
    disabled,
    size,
    labels,
    className,
    ...rest
  } = props;
  const { locale } = useLocale();
  const t = useLabels("address", addressLabels, labels);
  const fallbackCountry = (defaultCountry ?? (locale.toLowerCase().startsWith("tr") ? "TR" : regionOfLocale(locale)) ?? "US").toUpperCase();
  const [address, setAddress] = useControllableState<Address | null>({
    value,
    defaultValue: defaultValue ?? { country: fallbackCountry },
    onChange: (a) => a && onValueChange?.(a),
    name: "AddressField",
  });
  const a: Address = { ...address, country: (address?.country || fallbackCountry).toUpperCase() };
  const source = sources[a.country];
  const format = useAddressFormat(a.country);
  const latin = !!format.latinLines && !sameLanguage(locale, format.language);
  const formatFields = latin && format.latinFields ? format.latinFields : format.fields;
  const fields = fieldsProp ?? (source ? (source.neighbourhoods ? DEFAULT_FIELDS_WITH_NEIGHBOURHOOD : DEFAULT_FIELDS) : ["country", ...formatFields]);
  const required = requiredProp === "auto" ? ["country", ...format.required] : requiredProp;
  const autoPostal = React.useRef<string | undefined>(undefined);
  const [announce, setAnnounce] = React.useState("");
  const [postalWarning, setPostalWarning] = React.useState<string | null>(null);
  const { provinces } = useRegions(source, "province", undefined);
  const subs = useSubdivisions(!source && subdivisions ? subdivisions : undefined, a.country, locale);
  // A picker once the country has a list; a text field for countries without one (and while a
  // custom loader answers).
  const subdivisionPicker =
    !source && !!subdivisions && (subs.items ? subs.items.length > 0 : subdivisions === bundledSubdivisions && SUBDIVISION_COUNTRIES.includes(a.country));
  const latest = useLatest(a);

  const set = (patch: Partial<Address>) => setAddress({ ...latest.current!, ...patch });
  const names = React.useMemo(() => displayNames(locale), [locale]);
  const countryList = React.useMemo(() => {
    const cmp = compareText(locale);
    const list = (countries ?? COUNTRY_CODES).map((c) => c.toUpperCase());
    if (!list.includes(a.country)) list.push(a.country);
    return list.map((code) => ({ code, name: names?.of(code) ?? code })).sort((x, y) => cmp(x.name, y.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, locale, names]);

  const show = (p: AddressPart) => fields.includes(p);
  const req = (p: AddressPart) => required.includes(p);
  const fname = (p: AddressPart) => (name ? `${name}[${p}]` : undefined);

  if (readOnly) {
    const lines = formatAddress(a, { locale, format });
    return (
      <fieldset ref={ref} {...rest} data-slot="address-field" data-readonly="" className={cn("grid min-w-0 gap-1.5 border-0 p-0", className)}>
        {legend ? <legend className="mb-1.5 p-0 text-sm font-semibold text-fg">{legend}</legend> : null}
        <address className="text-sm leading-relaxed text-fg not-italic">
          {lines.map((l, i) => (
            <span key={i} className={cn("block", i === lines.length - 1 && lines.length > 1 && "text-fg-muted")}>
              {l}
            </span>
          ))}
        </address>
        {name ? (Object.keys(a) as AddressPart[]).map((k) => (a[k] ? <input key={k} type="hidden" name={fname(k)} value={a[k]} /> : null)) : null}
      </fieldset>
    );
  }

  const checkPostal = (raw: string) => {
    const code = raw.trim();
    if (!code) return setPostalWarning(null);
    const r = checkPostalCode(code, format);
    const example = format.postalCode?.examples[0];
    if (r.status === "format") return setPostalWarning(example ? t("postalFormat", { example }) : null);
    // Normalise what the pattern accepts once upper-cased ("ec1y 8sy" → "EC1Y 8SY").
    if (r.status === "ok" && r.value !== code) set({ postalCode: r.value });
    if (a.country === "TR") {
      const plate = provinces?.find((p) => p.name === a.region1)?.code;
      const tr = checkTrPostalCode(r.value, plate);
      return setPostalWarning(tr === "province" && plate ? t("postalMismatch", { province: a.region1, prefix: String(plate).padStart(2, "0") }) : null);
    }
    setPostalWarning(null);
  };

  const region1Label = source ? t("province") : t(REGION_LABEL[format.kinds.region1]);
  const region2Label = source ? t("district") : t(CITY_LABEL[format.kinds.region2]);
  const region3Label = source || a.country === "TR" ? t("neighbourhood") : t(SUBLOCALITY_LABEL[format.kinds.region3]);
  const pc = format.postalCode;
  const wide = (p: AddressPart) => source && layout === "grid" && (p === "line1" || p === "line2") ? "sm:col-span-2" : undefined;

  const parts: Record<AddressPart, React.ReactNode> = {
    country: show("country") ? (
      <Field key="country" label={t("country")} name={fname("country")} required={req("country")} error={errors?.country}>
        <NativeSelect
          size={size}
          value={a.country}
          autoComplete="country"
          onChange={(e) => {
            const country = e.currentTarget.value;
            setPostalWarning(null);
            set({ country, region1: undefined, region2: undefined, region3: undefined });
          }}
        >
          {countryList.map((c) => (
            // Country names come from Intl.DisplayNames, whose data differs between the server's
            // and the browser's ICU ("Falkland Islands" vs "Falkland Islands (Islas Malvinas)").
            <option key={c.code} value={c.code} suppressHydrationWarning>
              {c.name}
            </option>
          ))}
        </NativeSelect>
      </Field>
    ) : null,
    region1: show("region1") ? (
      <Field key="region1" label={region1Label} name={fname("region1")} required={req("region1")} error={errors?.region1}>
        {source ? (
          <RegionSelect
            size={size}
            source={source}
            level="province"
            value={a.region1 ?? ""}
            labels={labels}
            autoComplete="address-level1"
            onValueChange={(region1) => {
              const hadChild = !!latest.current!.region2;
              set({ region1: region1 || undefined, region2: undefined, region3: undefined });
              if (hadChild) setAnnounce(t("districtCleared"));
            }}
          />
        ) : subdivisionPicker ? (
          <RegionSelect
            size={size}
            country={a.country}
            subdivisions={subdivisions || undefined}
            value={a.region1 ?? ""}
            labels={labels}
            autoComplete="address-level1"
            onValueChange={(region1) => set({ region1: region1 || undefined })}
          />
        ) : (
          <Input size={size} value={a.region1 ?? ""} autoComplete="address-level1" onChange={(e) => set({ region1: e.currentTarget.value || undefined })} />
        )}
      </Field>
    ) : null,
    region2: show("region2") ? (
      <Field key="region2" label={region2Label} name={fname("region2")} required={req("region2")} error={errors?.region2}>
        {source ? (
          <RegionSelect
            size={size}
            source={source}
            level="district"
            province={a.region1}
            value={a.region2 ?? ""}
            labels={labels}
            autoComplete="address-level2"
            onValueChange={(region2) => {
              const hadChild = !!source.neighbourhoods && !!latest.current!.region3;
              set({ region2: region2 || undefined, region3: undefined });
              setAnnounce(hadChild ? t("neighbourhoodCleared") : "");
            }}
          />
        ) : (
          <Input size={size} value={a.region2 ?? ""} autoComplete="address-level2" onChange={(e) => set({ region2: e.currentTarget.value || undefined })} />
        )}
      </Field>
    ) : null,
    region3: show("region3") ? (
      <Field key="region3" label={region3Label} name={fname("region3")} required={req("region3")} error={errors?.region3}>
        {source?.neighbourhoods ? (
          <RegionSelect
            size={size}
            source={source}
            level="neighbourhood"
            province={a.region1}
            district={a.region2}
            value={a.region3 ?? ""}
            labels={labels}
            autoComplete="address-level3"
            onOptionChange={(option) => {
              const cur = latest.current!;
              const code = option?.neighbourhood?.postalCode;
              // Fill the postal code from the neighbourhood unless the visitor typed their own.
              const fill = code && (!cur.postalCode || cur.postalCode === autoPostal.current);
              if (fill) autoPostal.current = code;
              set({ region3: option?.value || undefined, ...(fill ? { postalCode: code } : null) });
              if (fill) setPostalWarning(null);
              setAnnounce("");
            }}
          />
        ) : (
          <Input size={size} value={a.region3 ?? ""} autoComplete="address-level3" onChange={(e) => set({ region3: e.currentTarget.value || undefined })} />
        )}
      </Field>
    ) : null,
    line1: show("line1") ? (
      <Field key="line1" label={t("line1")} name={fname("line1")} required={req("line1")} error={errors?.line1} className={wide("line1")}>
        <Input size={size} value={a.line1 ?? ""} autoComplete="address-line1" onChange={(e) => set({ line1: e.currentTarget.value || undefined })} />
      </Field>
    ) : null,
    line2: show("line2") ? (
      <Field key="line2" label={t("line2")} optional={!req("line2")} name={fname("line2")} required={req("line2")} error={errors?.line2} className={wide("line2")}>
        <Input size={size} value={a.line2 ?? ""} autoComplete="address-line2" onChange={(e) => set({ line2: e.currentTarget.value || undefined })} />
      </Field>
    ) : null,
    postalCode: show("postalCode") ? (
      <Field key="postalCode" label={t(POSTAL_LABEL[format.kinds.postalCode])} name={fname("postalCode")} required={req("postalCode")} error={errors?.postalCode} hint={postalWarning ?? undefined}>
        <Input
          size={size}
          value={a.postalCode ?? ""}
          autoComplete="postal-code"
          inputMode={pc?.numeric ? "numeric" : undefined}
          placeholder={pc?.examples[0]}
          dir="ltr"
          className="tabular"
          onChange={(e) => set({ postalCode: e.currentTarget.value || undefined })}
          onBlur={(e) => checkPostal(e.currentTarget.value)}
        />
      </Field>
    ) : null,
  };

  const live = (
    <span className="sr-only" aria-live="polite">
      {announce}
    </span>
  );

  if (source) {
    // Cascading pickers: province before district before neighbourhood, two columns.
    return (
      <Fieldset ref={ref} {...rest} legend={legend} hint={hint} disabled={disabled} data-slot="address-field" data-country={a.country} className={className}>
        <div className={cn("grid min-w-0 gap-x-4 gap-y-3.5", layout === "grid" && "sm:grid-cols-2")}>{CASCADE_ORDER.map((p) => parts[p])}</div>
        {live}
      </Fieldset>
    );
  }

  const rows = formatRows(format, latin);
  const placed = new Set(rows.flat());
  const extra = CASCADE_ORDER.filter((p) => !placed.has(p) && show(p));
  if (extra.length) rows.push(extra);
  const visible = rows.map((r) => r.filter(show)).filter((r) => r.length);
  return (
    <Fieldset ref={ref} {...rest} legend={legend} hint={hint} disabled={disabled} data-slot="address-field" data-country={a.country} className={className}>
      <div className="grid min-w-0 gap-y-3.5">
        {visible.map((row) => (
          <div key={row.join()} className={cn("grid min-w-0 gap-x-4 gap-y-3.5", layout === "grid" && ROW_COLS[row[0] === "country" ? 2 : Math.min(row.length, 4)])}>
            {row.map((p) => parts[p])}
          </div>
        ))}
      </div>
      {live}
    </Fieldset>
  );
});

function regionOfLocale(locale: string): string | undefined {
  try {
    return new Intl.Locale(locale).maximize().region;
  } catch {
    return undefined;
  }
}
