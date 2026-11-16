// Contact-page content for "Ardıç Danışmanlık", a fictional accounting and tax advisory firm with
// three Istanbul offices.
// Human-readable fields are `Localized` ({ en, tr }) and resolved with `pickLocale`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import type { SiteLocale } from "./locale-switch";
import { streetMap } from "./street-map";

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: locale === "tr" ? "tr-TR" : "en-US",
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export const PHONE = "+902120000000";
export const WHATSAPP = "+905000000000";
export const EMAIL = "merhaba@ardic.example";

const mapImage = streetMap;

const weekdays = [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "19:00" }];

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: weekdays,
    tue: weekdays,
    wed: weekdays,
    thu: weekdays,
    fri: [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "17:00" }],
    sat: [{ open: "10:00", close: "14:00" }],
  },
};

export function branches(t: (v: Localized<string>) => string): Branch[] {
  return [
    {
      name: "Ardıç Nişantaşı",
      address: { line: "Ihlamur Caddesi 21, Kat 3", district: "Nişantaşı", city: "Şişli", region: "İstanbul", postalCode: "34367", country: "TR", geo: { lat: 41.0523, lng: 28.9946 } },
      phone: PHONE,
      email: EMAIL,
      hours,
      mapImage,
      notes: t({ en: "Entrance on the side street; lift to the third floor.", tr: "Giriş yan sokaktan; asansörle üçüncü kat." }),
    },
    {
      name: "Ardıç Moda",
      address: { line: "Kavak Sokak 8", district: "Moda", city: "Kadıköy", region: "İstanbul", postalCode: "34710", country: "TR", geo: { lat: 40.9842, lng: 29.0264 } },
      phone: "+902160000010",
      hours,
      mapImage,
      notes: t({ en: "Five minutes from Kadıköy pier on the Moda tram.", tr: "Kadıköy iskelesinden Moda tramvayıyla beş dakika." }),
    },
    {
      name: "Ardıç Ataşehir",
      address: { line: "Barbaros Mahallesi, Çınar Sokak 5", district: "Ataşehir", city: "Ataşehir", region: "İstanbul", postalCode: "34746", country: "TR", geo: { lat: 40.9923, lng: 29.1244 } },
      phone: "+902160000020",
      hours: { ...hours, weekly: { ...hours.weekly, sat: [] } },
      mapImage,
      notes: t({ en: "Free parking under the building, level −1. Closed on Saturdays.", tr: "Binanın altında ücretsiz otopark, −1. kat. Cumartesi kapalı." }),
    },
  ];
}
