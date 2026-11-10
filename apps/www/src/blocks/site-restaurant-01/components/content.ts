// Sample content for a fictional meyhane on Bağdat Caddesi. Every human-readable field is a
// `Localized` value ({ en, tr }) and is resolved with `pickLocale` before it reaches a block.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type MenuCategory, type OpeningHours } from "@vamos-ui/react/blocks";
import type { SiteLocale } from "./locale-switch";
import { streetMap } from "./street-map";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  /** An image whose `alt` is localized → the plain image data blocks take. */
  const img = <I extends { alt: Localized<string> }>(image: I) => ({ ...image, alt: t(image.alt) });
  return {
    t,
    img,
    /** BCP 47 locale for `Intl` (prices, weekdays, times). */
    intl: locale === "tr" ? "tr-TR" : "en-US",
    /** Built-in block strings; English is the default, so only Turkish needs passing. */
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export const photos = {
  diningRoom: { ...unsplash("1517248135467-4c7edcad34c4", 2000, 1333), alt: { en: "The dining room at dusk, candles on oak tables", tr: "Akşamüstü yemek salonu, meşe masalarda mumlar" } },
  mezeTable: { ...unsplash("1414235077428-338989a2e8c0", 1600, 2000), alt: { en: "Plates of meze and rakı glasses on a white tablecloth", tr: "Beyaz örtü üzerinde meze tabakları ve rakı kadehleri" } },
  plated: { ...unsplash("1504674900247-0877df9cc836", 1600, 1067), alt: { en: "Grilled fish with herbs and lemon", tr: "Otlar ve limonla ızgara balık" } },
  terrace: { ...unsplash("1555396273-367ea4eb4db5", 1600, 1067), alt: { en: "The terrace in May, strings of bulbs over the tables", tr: "Mayısta teras, masaların üstünde ampul dizileri" } },
  bar: { ...unsplash("1514933651103-005eec06c04b", 1200, 1500), alt: { en: "The rakı shelf behind the bar", tr: "Barın arkasındaki rakı rafı" } },
  grill: { ...unsplash("1555939594-58d7cb561ad1", 1600, 1067), alt: { en: "Bonito on the charcoal grill", tr: "Kömür ızgarada palamut" } },
  bread: { ...unsplash("1509440159596-0249088772ff", 1200, 1500), alt: { en: "Sourdough pide fresh from the oven", tr: "Fırından yeni çıkmış ekşi mayalı pide" } },
  meze: { ...unsplash("1541529086526-db283c563270", 1200, 1200), alt: { en: "Haydari, fava and pickled sea beans", tr: "Haydari, fava ve deniz börülcesi" } },
  map: streetMap,
};

export function hoursFor(t: (v: Localized<string>) => string): OpeningHours {
  return {
  timeZone: "Europe/Istanbul",
  weekly: {
    tue: [{ open: "17:00", close: "23:30" }],
    wed: [{ open: "17:00", close: "23:30" }],
    thu: [{ open: "17:00", close: "23:30" }],
    fri: [{ open: "17:00", close: "01:00" }],
    sat: [{ open: "12:00", close: "01:00" }],
    sun: [{ open: "12:00", close: "22:00" }],
  },
  special: [
    { date: "2026-12-31", ranges: [{ open: "19:00", close: "03:00" }], note: t({ en: "New Year’s Eve — set menu only", tr: "Yılbaşı gecesi — yalnızca fiks menü" }) },
    { date: "2027-01-01", closed: true, note: t({ en: "New Year’s Day", tr: "Yılbaşı" }) },
  ],
  };
}

export const PHONE = "+902163581144";
export const WHATSAPP = "+905321234567";

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Kıyı Meyhane",
    address: { line: "Bağdat Caddesi 412", district: "Caddebostan", city: "Kadıköy", region: "İstanbul", postalCode: "34728", country: "TR", geo: { lat: 40.9656, lng: 29.0647 } },
    phone: PHONE,
    email: "masa@kiyimeyhane.com",
    hours: hoursFor(t),
    mapImage: photos.map,
    placeUrl: "https://maps.app.goo.gl/kiyimeyhane",
    notes: t({ en: "Valet from 18:00. Caddebostan pier is a seven-minute walk.", tr: "18:00’den itibaren vale var. Caddebostan iskelesi yedi dakika yürüme mesafesinde." }),
  };
}

const TRY = (amount: string) => ({ amount, currency: "TRY" });

export function menu(t: (v: Localized<string>) => string): MenuCategory[] {
  return [
    {
      title: t({ en: "Cold meze", tr: "Soğuk mezeler" }),
      note: t({ en: "Made every morning; served from 17:00.", tr: "Her sabah hazırlanır; 17:00’den itibaren servis edilir." }),
      items: [
        { name: "Haydari", description: t({ en: "Strained yoghurt, dill, roasted garlic, Urfa pepper.", tr: "Süzme yoğurt, dereotu, közlenmiş sarımsak, isot." }), prices: [{ amount: TRY("180") }], tags: ["vegetarian"], allergens: ["milk"] },
        { name: "Fava", description: t({ en: "Broad-bean purée, red onion, Ayvalık olive oil.", tr: "Bakla püresi, kırmızı soğan, Ayvalık zeytinyağı." }), prices: [{ amount: TRY("170") }], tags: ["vegan"] },
        { name: "Lakerda", description: t({ en: "Bonito cured for three days, red onion, black pepper.", tr: "Üç gün tuzlanmış palamut, kırmızı soğan, karabiber." }), prices: [{ amount: TRY("420") }], tags: ["chef-pick"], allergens: ["fish"] },
        { name: "Deniz börülcesi", description: t({ en: "Samphire, garlic, lemon.", tr: "Deniz börülcesi, sarımsak, limon." }), prices: [{ amount: TRY("190") }], tags: ["vegan", "gluten-free"] },
        { name: "Atom", description: t({ en: "Thick yoghurt, dried chilli butter. Hot.", tr: "Koyu yoğurt, kuru biberli tereyağı. Acılı." }), prices: [{ amount: TRY("185") }], tags: ["spicy", "vegetarian"], allergens: ["milk"] },
      ],
    },
    {
      title: t({ en: "Hot starters", tr: "Ara sıcaklar" }),
      items: [
        { name: t({ en: "Fried squid", tr: "Kalamar tava" }), description: t({ en: "Tarator, lemon.", tr: "Tarator, limon." }), prices: [{ amount: TRY("390") }], allergens: ["molluscs", "gluten", "nuts"] },
        { name: "Paçanga böreği", description: t({ en: "Pastırma and kaşar in yufka.", tr: "Yufkada pastırma ve kaşar." }), prices: [{ amount: TRY("280") }], allergens: ["gluten", "milk"], unavailable: true },
        { name: t({ en: "Grilled octopus", tr: "Izgara ahtapot" }), description: t({ en: "Charred over oak, smoked aubergine.", tr: "Meşe kömüründe, közlenmiş patlıcan." }), prices: [{ amount: TRY("640") }], tags: ["new"], allergens: ["molluscs"] },
      ],
    },
    {
      title: t({ en: "From the grill", tr: "Izgaradan" }),
      note: t({ en: "Priced daily by weight — ask for today’s board.", tr: "Günlük, gramajla fiyatlanır — bugünün tahtasını sorun." }),
      items: [
        { name: t({ en: "Catch of the day", tr: "Günün balığı" }), description: t({ en: "Charcoal-grilled whole fish, rocket, red onion.", tr: "Kömürde bütün balık, roka, kırmızı soğan." }), prices: [{}] },
        { name: "Levrek", description: t({ en: "Line-caught sea bass, 400–500 g.", tr: "Oltayla tutulmuş levrek, 400–500 g." }), prices: [{ amount: TRY("950") }], allergens: ["fish"] },
        { name: "Palamut", description: t({ en: "In season: September to November.", tr: "Mevsiminde: eylülden kasıma." }), prices: [{ amount: TRY("560") }], tags: ["chef-pick"], allergens: ["fish"] },
      ],
    },
    {
      title: t({ en: "Rakı", tr: "Rakı" }),
      items: [
        { name: "Yeni Rakı Yeni Seri", prices: [{ label: "20 cl", amount: TRY("950") }, { label: "35 cl", amount: TRY("1450") }, { label: "70 cl", amount: TRY("2600") }] },
        { name: "Tekirdağ Gold", prices: [{ label: "35 cl", amount: TRY("1750") }, { label: "70 cl", amount: TRY("3200") }] },
        { name: "Efe Göbek", prices: [{ label: "35 cl", amount: TRY("1650") }, { label: "70 cl", amount: TRY("2950") }] },
      ],
    },
  ];
}
