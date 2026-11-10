// `tr` locale data pack: week info, holidays, ID / IBAN rules, KDV, address data. React-free.
import { weekInfoForRegion } from "../core/week-info";
import type { LocaleDataPack, WeekInfo, WorkCalendar } from "../core/types";
import { trHolidays } from "./holidays";
import { trTaxIdRule, trTcknRule, trVknRule } from "./id";
import { trIbanRule } from "./iban";
import { trAmountInWords, trKdv } from "./kdv";
import { trAddress } from "./address";

export { trHolidays, trHolidaysForYear, TR_HOLIDAYS_SOURCE, TR_RELIGIOUS_HOLIDAYS } from "./holidays";
export { validateTckn, validateVkn, validateTrTaxId, tcknCheckDigits, vknCheckDigit, trTaxSchemeId, maskTrId, trTcknRule, trVknRule, trTaxIdRule } from "./id";
export { validateTrIban, formatTrIban, trIbanBankCode, trIbanRule, TR_BANK_NAMES } from "./iban";
export {
  trKdv,
  TR_KDV_RATES,
  activeTaxRates,
  vatFromNet,
  netFromGross,
  grossFromNet,
  withheldVat,
  allocateProRata,
  computeKdv,
  needsExemptionCode,
  trNumberToWords,
  trAmountInWords,
  type KdvLineInput,
  type KdvLineResult,
  type KdvBreakdown,
  type KdvOptions,
} from "./kdv";
export { loadTrAddressData, trProvinces, trDistricts, findTrProvince, checkTrPostalCode, trAddress, type TrAddressData, type TrAddressRow } from "./address";

/** Monday start, Saturday–Sunday weekend, minimal days 1 (CLDR "TR"). */
export const trWeekInfo: WeekInfo = weekInfoForRegion("TR");

/** A ready work calendar: Mon–Fri, 09:00–18:00, Turkish public holidays. */
export const trWorkCalendar: WorkCalendar = {
  locale: "tr-TR",
  workDays: [1, 2, 3, 4, 5],
  businessHours: [{ start: "09:00", end: "18:00" }],
  holidays: trHolidays,
};

/** The full `tr` pack. */
export const trPack: LocaleDataPack = {
  code: "tr",
  weekInfo: trWeekInfo,
  holidays: trHolidays,
  idRules: [trTcknRule, trVknRule, trTaxIdRule],
  iban: [trIbanRule],
  phone: { defaultCountry: "TR", displayFormat: "national" },
  money: { currency: "TRY", suffixStyle: "local", amountInWords: trAmountInWords },
  taxScheme: trKdv,
  address: trAddress,
};
