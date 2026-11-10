// Sample content for "Oda Studio", a fictional web studio in Kadıköy. Human-readable fields are
// `Localized` ({ en, tr }) and resolved with `pickLocale` before they reach a block.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized, type LogoItem, type PostSummary } from "@vamos-ui/react/blocks";
import type { SiteLocale } from "./locale-switch";

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

export const PHONE = "+902163300412";

export const photos = {
  studio: { ...unsplash("1497366216548-37526070297c", 2000, 1333), alt: { en: "The studio’s long table by the window, late afternoon", tr: "Öğleden sonra stüdyonun pencere kenarındaki uzun masası" } },
  team: { ...unsplash("1522071820081-009f0129c71c", 1600, 1067), alt: { en: "Four people reviewing a site layout on a laptop", tr: "Bir site taslağını dizüstünde inceleyen dört kişi" } },
  laptop: { ...unsplash("1499951360447-b19be8fe80f5", 1600, 2000), alt: { en: "A site layout open on a laptop beside sketches", tr: "Eskizlerin yanında dizüstünde açık bir site taslağı" } },
  dashboard: { ...unsplash("1551288049-bebda4e38f71", 1600, 2000), alt: { en: "A campaign report on a monitor", tr: "Ekranda bir kampanya raporu" } },
  diningRoom: { ...unsplash("1517248135467-4c7edcad34c4", 1600, 2000), alt: { en: "Kıyı Meyhane’s dining room, photographed for the new site", tr: "Yeni site için fotoğraflanan Kıyı Meyhane salonu" } },
  camera: { ...unsplash("1452587925148-ce544e77e70d", 1600, 2000), alt: { en: "A film camera and prints from a shoot on the studio table", tr: "Stüdyo masasında bir film makinesi ve çekimden baskılar" } },
  plated: { ...unsplash("1504674900247-0877df9cc836", 1600, 1067), alt: { en: "A plate of grilled fish with herbs and lemon", tr: "Otlar ve limonla ızgara balık tabağı" } },
  spaRoom: { ...unsplash("1540555700478-4be289fbecef", 1600, 1067), alt: { en: "A treatment room with folded towels", tr: "Katlanmış havlularla bir bakım odası" } },
  clinic: { ...unsplash("1629909613654-28e377c37b09", 1600, 1067), alt: { en: "A bright clinic reception with oak benches", tr: "Meşe banklı aydınlık bir klinik resepsiyonu" } },
};

export const portraits = {
  kerem: { ...unsplash("1507003211169-0a1dd7228f2d", 800, 1000), alt: "Kerem Yıldız" },
  elif: { ...unsplash("1594824476967-48c8b964273f", 800, 1000), alt: "Elif Aydın" },
  selin: { ...unsplash("1559839734-2b71ea197ec2", 800, 1000), alt: "Selin Öztürk" },
  deniz: { ...unsplash("1580489944761-15a19d654956", 800, 1000), alt: "Deniz Uçar" },
  can: { ...unsplash("1472099645785-5658abf4ff4e", 160, 160), alt: "Can Demir" },
  ayse: { ...unsplash("1438761681033-6461ffad8d80", 160, 160), alt: "Ayşe Korkmaz" },
};

function wordmark(name: string, font: string, fill: string) {
  const width = Math.round(name.length * 14 + 16);
  const esc = name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='40' viewBox='0 0 ${width} 40'><text x='8' y='28' fill='${fill}' ${font}>${esc}</text></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width, height: 40 };
}
const SERIF = "font-family='Georgia, serif' font-size='26' letter-spacing='-0.5'";
const SANS = "font-family='Helvetica, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='-0.8'";
const MONO = "font-family='Menlo, monospace' font-size='18' font-weight='600' letter-spacing='1'";
const COND = "font-family='Arial Narrow, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='2'";
const ITAL = "font-family='Georgia, serif' font-size='26' font-style='italic'";

const BRANDS: [string, string][] = [
  ["Kıyı Meyhane", SERIF], ["HAMAM MODA", COND], ["ledgerly", SANS], ["Lena Clinic", ITAL], ["PERA/BAKERY", MONO],
  ["NOVA DENTAL", COND], ["fırın&co", SANS], ["Aster Hotels", ITAL], ["ODA·22", MONO], ["Studio Arda", SERIF],
];

export const clientLogos: LogoItem[] = BRANDS.map(([name, font]) => ({
  name: name.replace(/[/·&]/g, " ").replace(/\s+/g, " ").trim(),
  image: wordmark(name, font, "#1b1d17"),
  imageDark: wordmark(name, font, "#eceee6"),
}));

export function journal(t: (v: Localized<string>) => string, img: (i: (typeof photos)[keyof typeof photos]) => { src: string; alt: string; width: number; height: number }): PostSummary[] {
  return [
    { href: "/journal/restaurant-sites", title: t({ en: "What a restaurant site actually needs", tr: "Bir restoran sitesinin gerçekten neye ihtiyacı var" }), excerpt: t({ en: "After forty restaurant launches: hours, a menu that loads on 3G, and a booking button that works. The rest is optional.", tr: "Kırk restoran lansmanından sonra: saatler, 3G’de açılan bir menü ve çalışan bir rezervasyon düğmesi. Gerisi isteğe bağlı." }), cover: img(photos.plated), category: { label: t({ en: "Websites", tr: "Web siteleri" }), href: "/journal/websites" }, publishedAt: "2026-10-28", readingMinutes: 7, author: { name: "Kerem Yıldız" } },
    { href: "/journal/google-profile", title: t({ en: "Your Google profile beats your homepage", tr: "Google profiliniz ana sayfanızı geçer" }), excerpt: t({ en: "A spa we work with gets 305 searches a month from its profile and 28 from ads.", tr: "Birlikte çalıştığımız bir spa, profilinden ayda 305, reklamlardan 28 arama alıyor." }), cover: img(photos.spaRoom), category: { label: "SEO", href: "/journal/seo" }, publishedAt: "2026-10-14", readingMinutes: 5 },
    { href: "/journal/kvkk-forms", title: t({ en: "KVKK-friendly contact forms, without the wall of text", tr: "Metin duvarı olmadan KVKK uyumlu iletişim formları" }), publishedAt: "2026-09-30", readingMinutes: 4, category: { label: t({ en: "Websites", tr: "Web siteleri" }) } },
    { href: "/journal/clinic-photos", title: t({ en: "Shooting a clinic without stock photos", tr: "Stok fotoğraf kullanmadan klinik çekimi" }), publishedAt: "2026-09-12", readingMinutes: 6, category: { label: t({ en: "Photography", tr: "Fotoğraf" }) } },
    { href: "/journal/whatsapp-booking", title: t({ en: "WhatsApp booking links that don’t annoy anyone", tr: "Kimseyi rahatsız etmeyen WhatsApp rezervasyon bağlantıları" }), publishedAt: "2026-08-26", readingMinutes: 3, category: { label: t({ en: "Bookings", tr: "Rezervasyon" }) } },
  ];
}
