/**
 * Locale data pack contracts. React-free: importable from server components, route handlers
 * and workers. A pack (`tr` first) contributes week info, holidays, ID / IBAN rules, a tax
 * scheme and an address data source.
 */

/** A date-only value, `YYYY-MM-DD`. Never produced with `toISOString()`. */
export type IsoDate = string;

/**
 * Week conventions of a locale. Day numbers follow `Intl.Locale#getWeekInfo`:
 * 1 = Monday … 7 = Sunday.
 */
export interface WeekInfo {
  firstDay: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  weekend: number[];
  /** Minimal days in the first week of the year (ISO 8601 = 4, US = 1). */
  minimalDays: number;
}

export type HolidayKind = "public" | "bank" | "observance";

export interface Holiday {
  date: IsoDate;
  /** English name (kit default language). */
  name: string;
  /** Official name in the pack's language ("Cumhuriyet Bayramı"). */
  localName?: string;
  kind: HolidayKind;
  /** Half day: non-working from this local time on ("13:00"). */
  partial?: { from: string };
  /** Sub-national region code (ISO 3166-2) when it does not apply nationwide. */
  region?: string;
  /** Stable id, e.g. `"tr-republic-day"`. */
  id?: string;
  /**
   * `false` when the date comes from a projection rather than an official publication.
   * Treat unverified dates as provisional.
   */
  verified?: boolean;
}

export interface HolidayRange {
  start: IsoDate;
  end: IsoDate;
}

export interface HolidayProvider {
  id: string;
  /** Holidays whose date falls inside `[start, end]` (inclusive), sorted by date. */
  get(range: HolidayRange, opts?: { region?: string }): Holiday[];
  /** The dates the data is known to be complete for. Outside it, results may be missing. */
  coverage?: { from: IsoDate; to: IsoDate };
}

export interface BusinessHours {
  /** "09:00" (24h, local wall clock). */
  start: string;
  end: string;
}

/**
 * Working time of a team, a country or a resource. Used by Agenda, Resource calendar, Gantt
 * and working-day math.
 */
export interface WorkCalendar {
  /** Working week days, 1 = Monday … 7 = Sunday. Default: every day not in `weekInfo.weekend`. */
  workDays?: number[];
  /** Used to derive `workDays` when they are not given. Default `"en-US"`. */
  locale?: string;
  businessHours?: BusinessHours[];
  holidays?: HolidayProvider | HolidayProvider[];
  /** Holiday region filter passed to the providers. */
  region?: string;
  /**
   * How half-day holidays (eves) count in working-day math. `"full"` (default) counts them as a
   * working day, `"half"` as 0.5, `"off"` as 0.
   */
  partialDays?: "full" | "half" | "off";
  /** Extra non-working dates (company days off, bridge days). */
  extraDaysOff?: IsoDate[];
  /** Dates that are working days even if they fall on a weekend (make-up days). */
  extraWorkDays?: IsoDate[];
}

/** Result of an ID / IBAN check. */
export interface IdResult {
  valid: boolean;
  /** Normalized value (digits / uppercase, no separators). */
  value: string;
  /** e.g. `"tr-tckn"`, `"tr-ykn"`, `"tr-vkn"`. */
  kind?: string;
  reason?: "empty" | "length" | "chars" | "pattern" | "checksum" | "country";
}

/** A pluggable identification number rule (consumed by Formatted inputs' `registerIdRule`). */
export interface IdRule {
  id: string;
  /** English label ("Turkish ID number (TCKN)"). */
  label: string;
  /** Expected lengths after normalization. */
  lengths: number[];
  /** Strip separators / whitespace. */
  normalize(value: string): string;
  validate(value: string): IdResult;
  /** Display format of a valid value. */
  format?(value: string): string;
  /** Privacy mask for read-only views (KVKK / GDPR). */
  mask?(value: string): string;
}

export interface IbanCountryRule {
  country: string;
  length: number;
  /** Pattern of the BBAN (everything after the 4 leading characters). */
  bban: RegExp;
  bankName?(code: string): string | undefined;
}

export interface TaxRate {
  /** Percent, e.g. 20. */
  value: number;
  label: string;
  validFrom: IsoDate;
  validTo?: IsoDate;
}

export interface TaxScheme {
  id: string;
  rates: TaxRate[];
  zeroRateRequiresExemption?: boolean;
  exemptionCodes?: { code: string; label: string; localLabel?: string }[];
  withholding?: { code: string; label: string; localLabel?: string; ratio: [num: number, den: number] }[];
  rounding: "line" | "document";
  priceEntry: ("net" | "gross")[];
}

export interface AddressDistrict {
  /** Official district code (NVİ for `tr`). */
  code: number;
  name: string;
}

export interface AddressProvince {
  /** Plate / province code (1–81 for `tr`). */
  code: number;
  name: string;
}

/** Province / district lookups. Async so packs can lazy-load their data. */
export interface AddressDataSource {
  id: string;
  provinces(): Promise<AddressProvince[]>;
  districts(provinceCode: number): Promise<AddressDistrict[]>;
}

export interface LocaleDataPack {
  code: string;
  weekInfo: WeekInfo;
  holidays?: HolidayProvider;
  idRules?: IdRule[];
  iban?: IbanCountryRule[];
  phone?: { defaultCountry: string; displayFormat: "national" | "international" };
  money?: {
    currency: string;
    suffixStyle?: "symbol" | "code" | "local";
    amountInWords?(decimal: string, currency: string): string;
  };
  taxScheme?: TaxScheme;
  address?: AddressDataSource;
}
