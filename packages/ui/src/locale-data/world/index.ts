// World address data: formats for every country (lazy, ~5.5 kB gzip), formatAddress. React-free.
export {
  parseAddressFormat,
  createAddressFormat,
  loadAddressFormats,
  loadAddressFormat,
  peekAddressFormat,
  subscribeAddressFormats,
  addressFormatCountries,
  addressFormatFallback,
  checkPostalCode,
  validateAddress,
  type AddressFormat,
  type AddressFormatRecord,
  type AddressFormatsFile,
  type AddressFormatToken,
  type AddressIssue,
  type PostalCodeCheck,
  type PostalCodeKind,
  type RegionKind,
  type CityKind,
  type SublocalityKind,
} from "./formats";
export { formatAddress, isLatinText, type FormatAddressOptions } from "./format-address";
