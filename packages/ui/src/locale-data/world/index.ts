// World address data: formats for every country (lazy, ~5.5 kB gzip), formatAddress, subdivision
// loaders (the bundled files: @vamos-ui/react/locale-data/world-subdivisions). React-free.
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
export {
  parseSubdivisions,
  createSubdivisionLoader,
  subdivisionsFromUrl,
  loadSubdivisions,
  findSubdivision,
  type Subdivision,
  type SubdivisionFile,
  type SubdivisionLoader,
  type SubdivisionRow,
} from "./subdivisions";
export {
  parseCities,
  sortCities,
  createCityLoader,
  citiesFromUrl,
  DEFAULT_CITIES_URL,
  type City,
  type CityFile,
  type CityLoader,
  type CityRow,
  type ParseCitiesOptions,
} from "./cities";
