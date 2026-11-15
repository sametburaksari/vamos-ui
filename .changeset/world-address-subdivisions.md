---
"@vamos-ui/react": minor
---

AddressField picks the state, province, prefecture or emirate from a list for 202 countries (one small file per country, loaded when it is picked; a text field stays for countries without one or with `subdivisions={false}`). Values are what the address writes: US `"CA"` shown as California, Brazil `"SP"`, Japan `"東京都"` in Japanese and `"Tokyo"` in other languages, Germany `"Bayern"` shown as Bavaria in English. `RegionSelect country="US"` lists a country's subdivisions on its own, accepts a stored name or ISO code ("California", "US-CA"), and reports the ISO 3166-2 code with `onOptionChange`. Lists come from Google's address data where it has one (CC BY 4.0) and from Unicode CLDR level-1 subdivisions elsewhere (Unicode License); `@vamos-ui/react/locale-data/world-subdivisions` exports the bundled loader, `subdivisionsFromUrl` serves the same files from your app.
