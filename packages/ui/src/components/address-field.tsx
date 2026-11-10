"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { useFieldControl, type ControlA11yProps } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { compareText } from "../lib/text";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { controlVariants } from "../lib/variants";
import type { AddressDataSource, AddressProvince } from "../locale-data/core/types";
import { checkTrPostalCode, trAddress } from "../locale-data/tr/address";
import { Field, Fieldset, Input } from "./input";

/* ------------------------------------------------------------------ */
/* Types & data                                                        */
/* ------------------------------------------------------------------ */

/**
 * A structured postal address. Region names are stored as text (official spelling), because
 * invoices (UBL-TR `CityName` / `CitySubdivisionName`) and labels need names, not codes.
 */
export interface Address {
  /** ISO 3166-1 alpha-2. */
  country: string;
  /** Province / state ("İstanbul", "California"). */
  region1?: string;
  /** District / city ("Kadıköy", "San Francisco"). */
  region2?: string;
  /** Neighbourhood (from an app endpoint; not bundled). */
  region3?: string;
  line1?: string;
  line2?: string;
  postalCode?: string;
}

export type AddressPart = keyof Address;

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
  provinceFirst: "Choose a province first",
  loading: "Loading…",
  districtCleared: "District cleared",
  postalMismatch: "Postal codes in {province} start with {prefix}",
};
export type AddressFieldLabels = typeof addressLabels;

const US_LIKE = new Set(["US", "CA", "AU"]);

function displayNames(locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    return null;
  }
}

/**
 * Formats an address as lines in the country's convention.
 *
 * ```ts
 * formatAddress({ country: "TR", region1: "İstanbul", region2: "Kadıköy", line1: "Caferağa Mah. Moda Cad. No: 12", postalCode: "34710" }, { locale: "en-US" });
 * // ["Caferağa Mah. Moda Cad. No: 12", "34710 Kadıköy/İstanbul", "Türkiye"]
 * ```
 */
export function formatAddress(a: Address, opts: { locale?: string; includeCountry?: boolean } = {}): string[] {
  const { locale = "en-US", includeCountry = true } = opts;
  const c = a.country?.toUpperCase();
  const join = (...xs: (string | undefined)[]) => xs.filter(Boolean).join(" ");
  let lines: (string | undefined)[];
  if (c === "TR") lines = [a.line1, a.line2, a.region3, join(a.postalCode, [a.region2, a.region1].filter(Boolean).join("/"))];
  else if (US_LIKE.has(c)) lines = [a.line1, a.line2, [a.region2, join(a.region1, a.postalCode)].filter(Boolean).join(", ")];
  else if (c === "GB" || c === "IE") lines = [a.line1, a.line2, a.region2, a.region1, a.postalCode];
  else lines = [a.line1, a.line2, join(a.postalCode, a.region2), a.region1];
  if (includeCountry && c) lines.push(displayNames(locale)?.of(c) ?? c);
  return lines.map((l) => l?.trim()).filter((l): l is string => !!l);
}

/* ------------------------------------------------------------------ */
/* Native select (internal look shared with RegionSelect)              */
/* ------------------------------------------------------------------ */

interface NativeSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">, ControlA11yProps {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect({ className, size = "md", invalid, children, ...rest }, ref) {
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

function useRegions(source: AddressDataSource | undefined, level: "province" | "district", province: string | undefined) {
  const [state, setState] = React.useState<{ key: string; items: { code: number; name: string }[] | null }>({ key: "", items: null });
  const [provinces, setProvinces] = React.useState<AddressProvince[] | null>(null);
  const key = `${source?.id ?? ""}|${level}|${level === "district" ? province ?? "" : ""}`;
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
    if (level === "province") {
      setState({ key, items: [...provinces].sort((a, b) => cmp(a.name, b.name)) });
    } else {
      const p = provinces.find((x) => x.name === province);
      if (!p) setState({ key, items: [] });
      else
        source.districts(p.code).then((d) => {
          if (alive) setState({ key, items: d });
        });
    }
    return () => {
      alive = false;
    };
  }, [source, provinces, level, province, key, cmp]);

  return { items: state.key === key ? state.items : null, provinces };
}

export interface RegionSelectProps extends Omit<NativeSelectProps, "value" | "defaultValue" | "onChange"> {
  /** Region data (e.g. `trAddress` from `@vamos-cms/ui/locale-data`). */
  source: AddressDataSource;
  level: "province" | "district";
  /** Parent province name, for `level="district"`. */
  province?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (name: string) => void;
  /** First option text. */
  placeholder?: string;
  labels?: Partial<AddressFieldLabels>;
}

/**
 * Province or district picker over an address data source, loaded lazily. Values are official
 * names. Use alone in filter bars ("Branches in İzmir") or inside AddressField.
 *
 * ```tsx
 * <Field label="Province"><RegionSelect source={trAddress} level="province" /></Field>
 * ```
 */
export const RegionSelect = React.forwardRef<HTMLSelectElement, RegionSelectProps>(function RegionSelect(
  { source, level, province, value, defaultValue, onValueChange, placeholder, labels, disabled, ...rest },
  ref,
) {
  const t = useLabels("address", addressLabels, labels);
  const [current, setCurrent] = useControllableState<string>({ value, defaultValue: defaultValue ?? "", onChange: onValueChange, name: "RegionSelect" });
  const { items } = useRegions(source, level, province);
  const needsParent = level === "district" && !province;
  const loading = !needsParent && items === null;
  const known = items?.some((x) => x.name === current);
  return (
    <NativeSelect
      ref={ref}
      {...rest}
      value={current}
      disabled={disabled || needsParent || loading}
      aria-busy={loading || undefined}
      data-level={level}
      onChange={(e) => setCurrent(e.currentTarget.value)}
    >
      <option value="">{loading ? t("loading") : needsParent ? t("provinceFirst") : placeholder ?? (level === "province" ? t("selectProvince") : t("selectDistrict"))}</option>
      {current && !known && !loading ? <option value={current}>{current}</option> : null}
      {items?.map((x) => (
        <option key={x.code} value={x.name}>
          {x.name}
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
  /** Region data per country. Default `{ TR: trAddress }` (81 provinces, 973 districts, lazy). */
  sources?: Record<string, AddressDataSource>;
  /** Country list. Default: every country. */
  countries?: string[];
  /** Initial country when there is no value. Default `"TR"` for Turkish locales, else the locale's region. */
  defaultCountry?: string;
  /** Parts to show, in any order of preference. Default: all except `region3`. */
  fields?: AddressPart[];
  /** Parts that are required. */
  required?: AddressPart[];
  /** `"grid"` (two columns from `sm`, default) or `"stack"`. */
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

/**
 * Structured postal address in a fieldset: country → province → district cascading pickers for
 * countries with a data source (Türkiye ships built in, loaded lazily), free text elsewhere.
 * Changing a parent clears its children (and says so to screen readers). Read-only shows the
 * address formatted the way the country writes it.
 *
 * ```tsx
 * <AddressField legend="Billing address" name="billing" defaultValue={{ country: "TR" }} required={["line1", "region1", "region2"]} />
 * ```
 */
export const AddressField = React.forwardRef<HTMLFieldSetElement, AddressFieldProps>(function AddressField(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    sources = { TR: trAddress },
    countries,
    defaultCountry,
    fields = DEFAULT_FIELDS,
    required = [],
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
  const [announce, setAnnounce] = React.useState("");
  const [postalWarning, setPostalWarning] = React.useState<string | null>(null);
  const { provinces } = useRegions(source, "province", undefined);
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
  const usLike = US_LIKE.has(a.country);

  if (readOnly) {
    const lines = formatAddress(a, { locale });
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

  const checkPostal = (code: string) => {
    if (a.country !== "TR" || !code) return setPostalWarning(null);
    const plate = provinces?.find((p) => p.name === a.region1)?.code;
    const r = checkTrPostalCode(code, plate);
    setPostalWarning(r === "province" && plate ? t("postalMismatch", { province: a.region1, prefix: String(plate).padStart(2, "0") }) : null);
  };

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
      <Field key="region1" label={source ? t("province") : usLike ? t("state") : t("state")} name={fname("region1")} required={req("region1")} error={errors?.region1}>
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
        ) : (
          <Input size={size} value={a.region1 ?? ""} autoComplete="address-level1" onChange={(e) => set({ region1: e.currentTarget.value || undefined })} />
        )}
      </Field>
    ) : null,
    region2: show("region2") ? (
      <Field key="region2" label={source ? t("district") : t("city")} name={fname("region2")} required={req("region2")} error={errors?.region2}>
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
              set({ region2: region2 || undefined, region3: undefined });
              setAnnounce("");
            }}
          />
        ) : (
          <Input size={size} value={a.region2 ?? ""} autoComplete="address-level2" onChange={(e) => set({ region2: e.currentTarget.value || undefined })} />
        )}
      </Field>
    ) : null,
    region3: show("region3") ? (
      <Field key="region3" label={t("city")} name={fname("region3")} required={req("region3")} error={errors?.region3}>
        <Input size={size} value={a.region3 ?? ""} autoComplete="address-level3" onChange={(e) => set({ region3: e.currentTarget.value || undefined })} />
      </Field>
    ) : null,
    line1: show("line1") ? (
      <Field key="line1" label={t("line1")} name={fname("line1")} required={req("line1")} error={errors?.line1} className={layout === "grid" ? "sm:col-span-2" : undefined}>
        <Input size={size} value={a.line1 ?? ""} autoComplete="address-line1" onChange={(e) => set({ line1: e.currentTarget.value || undefined })} />
      </Field>
    ) : null,
    line2: show("line2") ? (
      <Field key="line2" label={t("line2")} optional={!req("line2")} name={fname("line2")} required={req("line2")} error={errors?.line2} className={layout === "grid" ? "sm:col-span-2" : undefined}>
        <Input size={size} value={a.line2 ?? ""} autoComplete="address-line2" onChange={(e) => set({ line2: e.currentTarget.value || undefined })} />
      </Field>
    ) : null,
    postalCode: show("postalCode") ? (
      <Field key="postalCode" label={usLike && a.country === "US" ? t("zip") : t("postalCode")} name={fname("postalCode")} required={req("postalCode")} error={errors?.postalCode} hint={postalWarning ?? undefined}>
        <Input
          size={size}
          value={a.postalCode ?? ""}
          autoComplete="postal-code"
          inputMode={a.country === "TR" || a.country === "US" || a.country === "DE" ? "numeric" : undefined}
          dir="ltr"
          className="tabular"
          onChange={(e) => set({ postalCode: e.currentTarget.value || undefined })}
          onBlur={(e) => checkPostal(e.currentTarget.value.trim())}
        />
      </Field>
    ) : null,
  };

  const order: AddressPart[] = ["country", "postalCode", "region1", "region2", "region3", "line1", "line2"];

  return (
    <Fieldset ref={ref} {...rest} legend={legend} hint={hint} disabled={disabled} data-slot="address-field" data-country={a.country} className={className}>
      <div className={cn("grid min-w-0 gap-x-4 gap-y-3.5", layout === "grid" && "sm:grid-cols-2")}>{order.map((p) => parts[p])}</div>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
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
