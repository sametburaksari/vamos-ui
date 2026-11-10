"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { CountryCode } from "libphonenumber-js/min";
import { cn } from "../lib/cn";
import { useComposedRefs } from "../lib/compose-refs";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { compareText } from "../lib/text";
import { useControllableState } from "../lib/use-controllable-state";
import { useFormattedInput } from "../lib/use-formatted-input";
import { Input } from "./input";
import { WithoutFieldName, useFormattedValidity, useSubmitName, type BaseFormattedProps, type FormattedValidity } from "./formatted-input";

type PhoneLib = typeof import("libphonenumber-js/min");

let libPromise: Promise<PhoneLib> | undefined;
let libLoaded: PhoneLib | null = null;

/**
 * Loads the phone metadata (`libphonenumber-js/min`, ~80 kB) once. PhoneInput calls it on mount;
 * call it earlier (e.g. on hover of "Add contact") to have formatting ready on first keystroke.
 */
export function preloadPhoneInput(): Promise<PhoneLib> {
  libPromise ??= import("libphonenumber-js/min").then((m) => {
    const lib = ((m as unknown as { default?: PhoneLib }).default?.AsYouType ? (m as unknown as { default: PhoneLib }).default : m) as PhoneLib;
    libLoaded = lib;
    return lib;
  });
  return libPromise;
}

const phoneInputLabels = {
  country: "Country",
  suggested: "Suggested",
  allCountries: "All countries",
  invalid: "Enter a valid phone number",
  invalidFor: "Enter a valid phone number for {country}",
  tooShort: "This number is too short",
  tooLong: "This number is too long",
};
export type PhoneInputLabels = typeof phoneInputLabels;

export interface PhoneInputProps extends BaseFormattedProps<string | null> {
  /** Selected country (ISO 3166-1 alpha-2), controlled. */
  country?: string;
  /** Initial country. Default `"TR"` for Turkish locales, else the locale's region, else `"US"`. */
  defaultCountry?: string;
  onCountryChange?: (country: string) => void;
  /** Limit the country list. */
  countries?: string[];
  /** Shown first, under "Suggested". */
  preferredCountries?: string[];
  /**
   * How a complete number is shown after blur: `"national"` ("0532 123 45 67") when it belongs to
   * the selected country, or `"international"` ("+90 532 123 45 67"). Default `"national"`.
   */
  display?: "national" | "international";
  /** Hide the country picker (single-country forms). */
  hideCountry?: boolean;
  labels?: Partial<PhoneInputLabels>;
}

function regionOfLocale(locale: string): string | undefined {
  try {
    return new Intl.Locale(locale).maximize().region;
  } catch {
    return undefined;
  }
}

const accept = (ch: string) => (ch >= "0" && ch <= "9") || ch === "+";

/**
 * Phone number entry with a country picker. Formats as you type for the selected country,
 * accepts what people actually type ("0532…", "532…", "90532…", "+90 (532)…", "0090…") and
 * emits **E.164** (`"+905321234567"`). Typing `+` and a calling code switches the country.
 * Parsing uses `libphonenumber-js` (min metadata), loaded lazily.
 *
 * ```tsx
 * <Field label="Mobile"><PhoneInput defaultCountry="TR" onValueChange={(e164) => save(e164)} /></Field>
 * ```
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(props, forwardedRef) {
  const {
    country: countryProp,
    defaultCountry,
    onCountryChange,
    countries,
    preferredCountries,
    display: displayMode = "national",
    hideCountry,
    value,
    defaultValue,
    onValueChange,
    validateOn = "blur",
    onValidate,
    mono,
    labels,
    name,
    invalid,
    inputClassName,
    onBlur,
    onKeyDown,
    disabled,
    readOnly,
    size,
    ...rest
  } = props;
  const { locale } = useLocale();
  const t = useLabels("phoneInput", phoneInputLabels, labels);
  const [lib, setLib] = React.useState<PhoneLib | null>(libLoaded);
  const libRef = React.useRef(lib);
  libRef.current = lib;

  const fallbackCountry = (defaultCountry ?? (locale.toLowerCase().startsWith("tr") ? "TR" : regionOfLocale(locale)) ?? "US").toUpperCase();
  const [country, setCountry] = useControllableState<string>({ value: countryProp?.toUpperCase(), defaultValue: fallbackCountry, onChange: onCountryChange, name: "PhoneInput" });
  const countryRef = React.useRef(country);
  countryRef.current = country;
  const v = useFormattedValidity(validateOn, onValidate);

  const regionNames = React.useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const countryName = (c: string) => regionNames?.of(c) ?? c;

  /* ---------------- parsing (pure helpers over the loaded lib) ---------------- */

  const digitsOf = (s: string) => {
    let plus = /^\s*\+/.test(s);
    let d = s.replace(/\D/g, "");
    if (!plus && d.startsWith("00")) {
      plus = true;
      d = d.slice(2);
    }
    return { plus, d };
  };

  const parseNumber = (text: string) => {
    const l = libRef.current;
    if (!l) return undefined;
    const { plus, d } = digitsOf(text);
    if (!d) return undefined;
    const c = countryRef.current as CountryCode;
    const primary = plus ? l.parsePhoneNumberFromString(`+${d}`) : l.parsePhoneNumberFromString(d, c);
    if (primary?.isValid()) return primary;
    if (!plus) {
      // "90532…" with the calling code but without "+"
      const alt = l.parsePhoneNumberFromString(`+${d}`);
      if (alt?.isValid()) return alt;
    }
    return primary;
  };

  const format = (typed: string) => {
    const { plus, d } = digitsOf(typed);
    const l = libRef.current;
    if (!d) return plus ? "+" : "";
    if (!l) return (plus ? "+" : "") + d.slice(0, 15);
    if (plus) return new l.AsYouType().input(`+${d.slice(0, 15)}`);
    return new l.AsYouType(countryRef.current as CountryCode).input(d.slice(0, 17));
  };

  const parse = (display: string): string | null => {
    const l = libRef.current;
    const { plus, d } = digitsOf(display);
    if (!d) return null;
    if (!l) return plus && d.length >= 7 ? `+${d}` : null;
    const p = parseNumber(display);
    return p && p.isPossible() ? p.number : null;
  };

  const pretty = (display: string) => {
    const p = parseNumber(display);
    if (!p || !p.isValid()) return display;
    return displayMode === "national" && p.country === countryRef.current ? p.formatNational() : p.formatInternational();
  };

  const toDisplay = (raw: string | null) => {
    if (!raw) return "";
    if (!libRef.current) return raw;
    return pretty(raw.startsWith("+") ? raw : `+${raw}`);
  };

  const check = (display: string): FormattedValidity => {
    const l = libRef.current;
    const { d } = digitsOf(display);
    if (!d) return { valid: true };
    if (!l) return d.length >= 7 ? { valid: true } : { valid: false, reason: "tooShort", message: t("tooShort") };
    const p = parseNumber(display);
    if (p?.isValid()) return { valid: true };
    const { plus } = digitsOf(display);
    const len = plus ? l.validatePhoneNumberLength(`+${d}`) : l.validatePhoneNumberLength(d, countryRef.current as CountryCode);
    if (len === "TOO_SHORT") return { valid: false, reason: "tooShort", message: t("tooShort") };
    if (len === "TOO_LONG") return { valid: false, reason: "tooLong", message: t("tooLong") };
    return { valid: false, reason: "invalid", message: plus ? t("invalid") : t("invalidFor", { country: countryName(countryRef.current) }) };
  };

  const engine = useFormattedInput({
    value,
    defaultValue,
    accept,
    format,
    parse,
    toDisplay,
    formatOnBlur: pretty,
    onValueChange: (raw, formatted) => {
      const c = check(formatted);
      v.report(c, "change");
      // "+44 20…" typed into a TR field: follow the number's country.
      const l = libRef.current;
      if (l && formatted.trim().startsWith("+")) {
        const detected = parseNumber(formatted)?.country;
        if (detected && detected !== countryRef.current && (!countries || countries.includes(detected))) setCountry(detected);
      }
      onValueChange?.(raw, { valid: c.valid, reason: c.reason, formatted, kind: raw ? parseNumber(formatted)?.country : undefined });
    },
  });
  const ref = useComposedRefs(forwardedRef, engine.ref);
  const submitName = useSubmitName(name);
  const engineRef = React.useRef(engine);
  engineRef.current = engine;

  // Load metadata, then re-format whatever is there.
  React.useEffect(() => {
    if (libRef.current) return;
    let alive = true;
    preloadPhoneInput().then((l) => {
      if (!alive) return;
      libRef.current = l;
      setLib(l);
      const e = engineRef.current;
      const raw = e.raw;
      if (raw) e.setDisplay(toDisplay(raw));
      else if (e.display) e.setDisplay(e.display);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeCountry = (next: string) => {
    const prev = countryRef.current;
    setCountry(next);
    countryRef.current = next;
    const e = engineRef.current;
    const l = libRef.current;
    if (!e.display) return;
    const { plus } = digitsOf(e.display);
    // Keep the local part when switching country ("0532…" stays, "+90 532…" → national under the new country).
    let national = e.display.replace(/\D/g, "");
    if (l && plus) {
      const p = parseNumber(e.display);
      national = p?.nationalNumber ?? national;
    } else if (l && prev !== next) {
      const p = l.parsePhoneNumberFromString(national, prev as CountryCode);
      if (p) national = p.nationalNumber;
    }
    e.setDisplay(national);
  };

  /* ---------------- country list ---------------- */

  const list = React.useMemo(() => {
    const all = (countries ?? lib?.getCountries() ?? [country]).map((c) => c.toUpperCase());
    if (!all.includes(country)) all.unshift(country);
    const cmp = compareText(locale);
    return all.map((c) => ({ code: c, name: countryName(c) })).sort((a, b) => cmp(a.name, b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, lib, locale, country, regionNames]);
  const preferred = preferredCountries?.map((c) => c.toUpperCase()).filter((c) => list.some((x) => x.code === c));
  const callingCode = (c: string) => {
    try {
      return lib ? `+${lib.getCountryCallingCode(c as CountryCode)}` : "";
    } catch {
      return "";
    }
  };
  const optionText = (c: { code: string; name: string }) => `${c.name} ${callingCode(c.code)}`.trim();

  const picker = hideCountry ? null : (
    <span data-slot="phone-input-country" className="relative -mx-3 flex h-full items-center gap-1.5 px-3 font-mono text-[12px] tabular text-fg-muted has-[select:focus-visible]:bg-hover has-[select:focus-visible]:text-fg">
      <span aria-hidden className="font-semibold tracking-[0.04em] text-fg">{country}</span>
      <span aria-hidden className="text-fg-subtle">{callingCode(country)}</span>
      {!readOnly ? <ChevronDown aria-hidden className="size-3 text-fg-subtle" /> : null}
      {!readOnly ? (
        <select
          aria-label={t("country")}
          value={country}
          disabled={disabled}
          onChange={(e) => changeCountry(e.currentTarget.value)}
          className="absolute inset-0 cursor-pointer appearance-none bg-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        >
          {preferred?.length ? (
            <optgroup label={t("suggested")}>
              {preferred.map((c) => (
                <option key={`p-${c}`} value={c}>
                  {optionText({ code: c, name: countryName(c) })}
                </option>
              ))}
            </optgroup>
          ) : null}
          {preferred?.length ? (
            <optgroup label={t("allCountries")}>
              {list.map((c) => (
                <option key={c.code} value={c.code}>
                  {optionText(c)}
                </option>
              ))}
            </optgroup>
          ) : (
            list.map((c) => (
              <option key={c.code} value={c.code}>
                {optionText(c)}
              </option>
            ))
          )}
        </select>
      ) : null}
    </span>
  );

  return (
    <>
      <WithoutFieldName>
        <Input
          ref={ref}
          {...rest}
          {...engine.inputProps}
          size={size}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid || v.invalid}
          addonStart={picker ?? undefined}
          inputClassName={cn("tabular", mono && "font-mono", inputClassName)}
          data-slot="phone-input"
          data-country={country}
          placeholder={rest.placeholder ?? (lib ? exampleFor(lib, country, displayMode) : undefined)}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            engine.inputProps.onKeyDown(e);
          }}
          onBlur={(e) => {
            engine.inputProps.onBlur(e);
            v.report(check(e.currentTarget.value), "blur");
            onBlur?.(e);
          }}
        />
      </WithoutFieldName>
      {submitName ? <input type="hidden" name={submitName} value={engine.raw ?? ""} disabled={disabled} /> : null}
    </>
  );
});

/** A typed-looking placeholder per country, derived from the metadata (no example numbers in /min). */
function exampleFor(lib: PhoneLib, country: string, mode: "national" | "international"): string | undefined {
  const samples: Record<string, string> = { TR: "5321234567", US: "2015550123", GB: "7400123456", DE: "15123456789", NL: "612345678", FR: "612345678" };
  const n = samples[country];
  if (!n) return undefined;
  const p = lib.parsePhoneNumberFromString(n, country as CountryCode);
  if (!p) return undefined;
  return mode === "national" ? p.formatNational() : p.formatInternational();
}
