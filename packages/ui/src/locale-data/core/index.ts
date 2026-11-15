// React-free core of @vamos-ui/react/locale-data: contracts, week info, holidays, working days, IBAN, decimals.
export type {
  IsoDate,
  WeekInfo,
  Holiday,
  HolidayKind,
  HolidayRange,
  HolidayProvider,
  BusinessHours,
  WorkCalendar,
  IdResult,
  IdRule,
  IbanCountryRule,
  TaxRate,
  TaxScheme,
  Address,
  AddressPart,
  AddressProvince,
  AddressDistrict,
  AddressNeighbourhood,
  AddressDataSource,
  LocaleDataPack,
} from "./types";
export { isIsoDate, daysInMonth, toDayNumber, fromDayNumber, addDays, diffDays, isoWeekday, toIsoDate, isoDateInZone, compareIsoDate, eachDay } from "./date";
export { getWeekInfo, weekInfoForRegion, regionOf, defaultWorkDays, weekdayOrder } from "./week-info";
export { createHolidayProvider, combineHolidayProviders, isRangeCovered, holidaysOn, holidayName, type CreateHolidayProviderOptions } from "./holidays";
export { workingValue, isWorkingDay, countWorkingDays, addWorkingDays, nextWorkingDay } from "./working-days";
export { IBAN_LENGTHS, normalizeIban, ibanCheckDigits, buildIban, validateIban, isValidIban, formatIban, electronicIban } from "./iban";
export { toUnits, fromUnits, mulDivRound, roundHalfUp, addDecimal, subtractDecimal, multiplyDecimal, divideDecimal, compareDecimal } from "./decimal";
export { createCachedLoader, fillUrlTemplate, fetchJsonLoader, type FetchJsonOptions } from "./loader";
