// Sample content for a fictional hammam and spa in Moda. Human-readable fields are `Localized`
// ({ en, tr }) and resolved with `pickLocale` before they reach a block.
import { blockLabelsTr, formatTime, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type MenuCategory, type OpeningHours } from "@vamos-ui/react/blocks";
import type { SiteLocale } from "./locale-switch";
import { streetMap } from "./street-map";

/** English copy uses the same clock as the blocks (en-US: 12-hour), so one page never mixes "6 PM" and "18:00". */
export const enTime = (hhmm: string) => formatTime(hhmm, "en-US");

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  /** An image whose `alt` is localized → the plain image data blocks take. */
  const img = <I extends { alt: Localized<string> }>(image: I) => ({ ...image, alt: t(image.alt) });
  return {
    t,
    img,
    intl: locale === "tr" ? "tr-TR" : "en-US",
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export const PHONE = "+902160000000";
export const WHATSAPP = "+905000000000";

export const photos = {
  stones: { ...unsplash("1544161515-4ab6ce6db874", 1400, 1750), alt: { en: "A therapist laying warm stones beside a massage table", tr: "Masaj masasının yanında sıcak taşları yerleştiren terapist" } },
  room: { ...unsplash("1540555700478-4be289fbecef", 1600, 1067), alt: { en: "A treatment room with folded towels and a lit candle", tr: "Katlanmış havlular ve yanan bir mumla bakım odası" } },
  flowers: { ...unsplash("1490750967868-88aa4486c946", 1600, 2000), alt: { en: "Fresh peonies on the reception desk", tr: "Resepsiyon masasında taze şakayıklar" } },
  rest: { ...unsplash("1505691938895-1758d7feb511", 1600, 1067), alt: { en: "The rest room upstairs, linen and morning light", tr: "Üst kattaki dinlenme odası, keten ve sabah ışığı" } },
  reception: { ...unsplash("1629909613654-28e377c37b09", 1600, 1067), alt: { en: "The reception with oak benches", tr: "Meşe bankları olan resepsiyon" } },
  map: streetMap,
};

export const portraits = {
  elif: { ...unsplash("1594824476967-48c8b964273f", 800, 1000), alt: { en: "Elif Aydın in a linen apron, smiling", tr: "Keten önlüğüyle gülümseyen Elif Aydın" } },
  mert: { ...unsplash("1500648767791-00dcc994a43e", 800, 1000), alt: { en: "Mert Kaya in the hammam, arms folded", tr: "Hamamda kollarını kavuşturmuş Mert Kaya" } },
  deniz: { ...unsplash("1580489944761-15a19d654956", 800, 1000), alt: { en: "Deniz Uçar in a white T-shirt, hair tied up", tr: "Beyaz tişörtlü, saçları toplu Deniz Uçar" } },
};

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "09:00", close: "21:00" }],
    tue: [{ open: "09:00", close: "21:00" }],
    wed: [{ open: "09:00", close: "21:00" }],
    thu: [{ open: "09:00", close: "21:00" }],
    fri: [{ open: "09:00", close: "22:00" }],
    sat: [{ open: "09:00", close: "22:00" }],
    sun: [{ open: "09:00", close: "20:00" }],
  },
};

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Hamam Moda",
    address: { line: "Moda Caddesi 88", district: "Moda", city: "Kadıköy", region: "İstanbul", postalCode: "34710", country: "TR", geo: { lat: 40.9842, lng: 29.0264 } },
    phone: PHONE,
    email: "rezervasyon@example.com",
    hours,
    mapImage: photos.map,
    notes: t({ en: "Five minutes from Kadıköy pier on the Moda tram. Separate women’s hours on Tuesday mornings.", tr: "Kadıköy iskelesinden Moda tramvayıyla beş dakika. Salı sabahları yalnızca kadınlara açıktır." }),
  };
}

const TRY = (amount: string) => ({ amount, currency: "TRY" });

export function treatments(t: (v: Localized<string>) => string): MenuCategory[] {
  const min = (n: number) => t({ en: `${n} min`, tr: `${n} dk` });
  return [
    {
      title: t({ en: "Hammam", tr: "Hamam" }),
      note: t({ en: "Peştemal, slippers and tea included.", tr: "Peştemal, terlik ve çay dahildir." }),
      items: [
        { name: t({ en: "Traditional hammam", tr: "Geleneksel hamam" }), description: t({ en: "Kese and foam on the warm marble.", tr: "Sıcak mermerde kese ve köpük." }), duration: min(45), prices: [{ amount: TRY("1800") }] },
        { name: t({ en: "Moda ritual", tr: "Moda ritüeli" }), description: t({ en: "Hammam, clay mask and a 30-minute aromatherapy massage.", tr: "Hamam, kil maskesi ve 30 dakika aromaterapi masajı." }), duration: min(90), prices: [{ amount: TRY("3600") }], tags: ["chef-pick"] },
        { name: t({ en: "Hammam for two", tr: "İki kişilik hamam" }), description: t({ en: "The private kurna room, booked for you alone.", tr: "Yalnızca size ayrılan özel kurna odası." }), duration: min(60), prices: [{ amount: TRY("4200") }] },
      ],
    },
    {
      title: t({ en: "Massage", tr: "Masaj" }),
      items: [
        { name: t({ en: "Swedish massage", tr: "İsveç masajı" }), description: t({ en: "Medium pressure, full body.", tr: "Orta basınç, tüm vücut." }), prices: [{ label: min(50), amount: TRY("2100") }, { label: min(80), amount: TRY("2900") }] },
        { name: t({ en: "Deep tissue", tr: "Derin doku" }), description: t({ en: "Back, neck and shoulders.", tr: "Sırt, boyun ve omuz odaklı." }), prices: [{ label: min(50), amount: TRY("2400") }, { label: min(80), amount: TRY("3300") }] },
        { name: t({ en: "Hot stone", tr: "Sıcak taş" }), duration: min(70), prices: [{ amount: TRY("2800") }], unavailable: true },
      ],
    },
    {
      title: t({ en: "Face", tr: "Yüz" }),
      items: [
        { name: t({ en: "Peony facial", tr: "Şakayık yüz bakımı" }), description: t({ en: "Cleanse, enzyme peel, mask and a lymphatic face massage.", tr: "Temizlik, enzim peeling, maske ve lenf drenajlı yüz masajı." }), duration: min(50), prices: [{ amount: TRY("2300") }], tags: ["new"] },
        { name: t({ en: "Express glow", tr: "Hızlı ışıltı" }), description: t({ en: "Before an event; no redness afterwards.", tr: "Bir davetten önce; sonrasında kızarıklık yapmaz." }), duration: min(30), prices: [{ amount: TRY("1400") }] },
      ],
    },
  ];
}
