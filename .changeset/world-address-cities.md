---
"@vamos-ui/react": minor
---

City suggestions for 246 countries: `cities={citiesFromUrl()}` on AddressField adds a suggestion list to the city field (the places of the country with 5 000+ inhabitants or an administrative seat, most populous first, narrowed to the chosen state; any other place can still be typed). One file per country loads on first focus from https://ui.vamos.ist/data/cities/{cc}.json, or from your own copy with `citiesFromUrl("/data/cities/{cc}.json")`; without a `cities` loader nothing is requested. The data is not in the npm package. City data © GeoNames, CC BY 4.0: show the attribution where you use it. `parseCities`, `createCityLoader` and `DEFAULT_CITIES_URL` are in `@vamos-ui/react/locale-data`.
