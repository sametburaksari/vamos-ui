// Sample content for "Loam", a fictional garden-planning app before launch. Every human-readable
// field is `Localized` ({ en, tr }). Numbers stay numbers and are formatted per locale.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const ACCENT = "#4D7C0F";
export const EMAIL = "hello@loam.example.com";
export const SITE_URL = "https://loam.example.com";

/** Launch: the first 1,000 on the list get in on 1 March 2027, 09:00 Istanbul time. */
export const LAUNCH_AT = "2027-03-01T09:00:00+03:00";
/** People already on the list when you join; you are the next one. */
export const WAITING = 12408;
/** Places you move up for every friend who joins with your link. */
export const PER_REFERRAL = 250;
/** Size of the first wave. */
export const FIRST_WAVE = 1000;

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "EUR", timeZone: "Europe/Istanbul" });
  return {
    locale,
    t,
    f,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  seedlings: { ...unsplash("1523348837708-15d4a09cfac2", 2000, 1333), alt: { en: "Seedlings in black pots seen from above", tr: "Yukarıdan görülen siyah saksılarda fideler" } as L },
  soil: { ...unsplash("1416879595882-3373a0480b5b", 1200, 800), alt: { en: "A green trowel full of potting soil on a work table", tr: "Çalışma masasında saksı toprağıyla dolu yeşil bir kürek" } as L },
};

export const proofs: { value: L; title: L; text: L }[] = [
  {
    value: { en: "312", tr: "312" },
    title: { en: "crops with real sowing windows", tr: "gerçek ekim takvimli ürün" },
    text: {
      en: "From broad beans to bitter melon, each with sow, transplant and harvest dates for 41 climate zones — not one calendar for the whole planet.",
      tr: "Baklagillerden kudret narına, her biri 41 iklim bölgesi için ekim, şaşırtma ve hasat tarihleriyle — tüm gezegene tek takvim değil.",
    },
  },
  {
    value: { en: "4 min", tr: "4 dk" },
    title: { en: "to draw your plot to scale", tr: "parselinizi ölçekli çizmek için" },
    text: {
      en: "Pace it out, type three measurements, drag in beds. Loam works out sun hours from your street and the trees you mark.",
      tr: "Adımlayın, üç ölçü girin, yatakları sürükleyin. Loam güneş saatlerini sokağınızdan ve işaretlediğiniz ağaçlardan hesaplar.",
    },
  },
  {
    value: { en: "86", tr: "86" },
    title: { en: "allotments in the beta", tr: "hobi bahçesi betada" },
    text: {
      en: "Tested for two seasons in Izmir, Bristol and Utrecht. The rotation planner exists because three of them asked for it in the same week.",
      tr: "İzmir, Bristol ve Utrecht’te iki sezon test edildi. Münavebe planlayıcısı, üçü aynı hafta istediği için var.",
    },
  },
];

export const faq: { q: L; a: L }[] = [
  {
    q: { en: "What does it cost?", tr: "Ücreti ne kadar?" },
    a: { en: "Free for one plot. Loam Plus is €3 a month for several plots, households and seed inventory. People on the list get the first year of Plus free.", tr: "Tek parsel için ücretsiz. Loam Plus birden fazla parsel, hane paylaşımı ve tohum envanteri için ayda 3 €. Listedekilere Plus’ın ilk yılı ücretsiz." },
  },
  {
    q: { en: "Which phones?", tr: "Hangi telefonlar?" },
    a: { en: "iPhone (iOS 17+) and Android (10+) at launch, plus a web planner for drawing plots on a bigger screen.", tr: "Lansmanda iPhone (iOS 17+) ve Android (10+), ayrıca parselleri büyük ekranda çizmek için web planlayıcı." },
  },
  {
    q: { en: "What do you do with my email?", tr: "E-postamla ne yapıyorsunuz?" },
    a: { en: "Two emails: one when it’s your turn, one if launch moves. No newsletter, no sharing. Delete yourself from the list with one link.", tr: "İki e-posta: biri sıranız gelince, biri lansman kayarsa. Bülten yok, paylaşım yok. Tek bağlantıyla listeden çıkabilirsiniz." },
  },
];
