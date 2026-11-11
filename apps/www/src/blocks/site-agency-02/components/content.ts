// Sample content for "Tamtam", a fictional brand studio in Karaköy, Istanbul. Six fictional
// client projects, each with its own brand colour — the site's colour blocks are those colours,
// passed through `siteAccent` so text on every block reaches 4.5:1.
// Every human-readable field is `{ en, tr }`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@tamtam.example.com";
export const ADDRESS = "Kemankeş Cad. 00, Kat 0, 34425 Karaköy, Beyoğlu / İstanbul";

/** The studio's own colour (the site accent). */
export const STUDIO_ACCENT = "#2340FF";
export const STUDIO_PALETTE = [
  { name: "Cobalt", hex: STUDIO_ACCENT },
  { name: "Paper", hex: "#F3F1EC" },
  { name: "Ink", hex: "#111111" },
];

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-US");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: intlOf(locale),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export type ProjectId = "sarnic" | "kolon" | "defne" | "orbit" | "mira" | "pazar";
export type MarkShape = "drop" | "wheels" | "leaf" | "orbit" | "lens" | "grid";

export interface Project {
  id: ProjectId;
  client: string;
  /** Short line under the name. */
  sector: L;
  year: number;
  /** The client's primary brand colour: the project's colour block. */
  colour: string;
  /** Supporting colours shown as swatches (data, not UI colours). */
  palette: { name: string; hex: string }[];
  typeface: string;
  mark: MarkShape;
  disciplines: L[];
  headline: L;
  problem: L;
  approach: L;
  deliverables: L[];
  results: { value: string; label: L }[];
  quote: { text: L; author: string; role: L };
  weeks: number;
}

const D = {
  naming: { en: "Naming", tr: "İsim" },
  strategy: { en: "Strategy", tr: "Strateji" },
  identity: { en: "Identity", tr: "Kimlik" },
  packaging: { en: "Packaging", tr: "Ambalaj" },
  web: { en: "Website", tr: "Web sitesi" },
  motion: { en: "Motion", tr: "Hareket" },
  signage: { en: "Signage", tr: "Yönlendirme" },
  editorial: { en: "Editorial", tr: "Editoryal" },
} satisfies Record<string, L>;

export const projects: Project[] = [
  {
    id: "sarnic",
    client: "Sarnıç",
    sector: { en: "Spring water from Bolu", tr: "Bolu’dan kaynak suyu" },
    year: 2026,
    colour: "#00A6D6",
    palette: [
      { name: "Spring", hex: "#00A6D6" },
      { name: "Stone", hex: "#E8E4DA" },
      { name: "Cistern", hex: "#0B2A3A" },
    ],
    typeface: "Sarnıç Grotesk (custom)",
    mark: "drop",
    disciplines: [D.strategy, D.identity, D.packaging],
    headline: { en: "A water brand that tells you where the water is from", tr: "Suyun nereden geldiğini söyleyen bir su markası" },
    problem: {
      en: "Sarnıç bottled excellent water under a label that looked like every other shelf in the aisle. Shoppers picked by price; the spring’s story — a 1,140-metre source in Bolu — was printed in 6-point type on the back.",
      tr: "Sarnıç çok iyi bir suyu, raftaki diğer her şişeye benzeyen bir etiketle satıyordu. Alıcı fiyata göre seçiyordu; kaynağın hikâyesi — Bolu’da 1.140 metrede bir kaynak — arkada 6 puntoyla yazıyordu.",
    },
    approach: {
      en: "We made the altitude the logo. Every bottle carries the source height as a big number, the label is clear so the water is the colour, and one blue does the shouting. A custom grotesk keeps the numbers legible from three metres away.",
      tr: "Rakımı logo yaptık. Her şişe kaynak yüksekliğini büyük bir sayı olarak taşıyor, etiket şeffaf ki suyun kendisi renk olsun, bağırma işini tek bir mavi yapıyor. Özel bir grotesk, sayıların üç metreden okunmasını sağlıyor.",
    },
    deliverables: [
      { en: "Brand platform and tone of voice", tr: "Marka platformu ve dil" },
      { en: "Wordmark, drop mark, custom numerals", tr: "Logotip, damla işareti, özel rakamlar" },
      { en: "0.33 l, 0.5 l, 1.5 l and 19 l labels", tr: "0,33 l, 0,5 l, 1,5 l ve 19 l etiketleri" },
      { en: "Delivery truck livery", tr: "Dağıtım aracı giydirmesi" },
    ],
    results: [
      { value: "+31%", label: { en: "shelf sales, first 6 months", tr: "raf satışı, ilk 6 ay" } },
      { value: "2.4×", label: { en: "aided brand recall", tr: "yardımlı marka hatırlanırlığı" } },
      { value: "0", label: { en: "extra inks — one blue, clear label", tr: "ek mürekkep — tek mavi, şeffaf etiket" } },
    ],
    quote: {
      text: { en: "People now ask for “the one with the number”. We had been trying to get them to ask for us by name for nine years.", tr: "İnsanlar artık “üstünde sayı olanı” istiyor. Dokuz yıldır bizi adımızla istemelerini sağlamaya çalışıyorduk." },
      author: "Hande Yalçın",
      role: { en: "General manager, Sarnıç", tr: "Genel müdür, Sarnıç" },
    },
    weeks: 14,
  },
  {
    id: "kolon",
    client: "Vites Bikes",
    sector: { en: "City bicycles, made in Eskişehir", tr: "Şehir bisikletleri, Eskişehir yapımı" },
    year: 2025,
    colour: "#FF5A1F",
    palette: [
      { name: "Signal", hex: "#FF5A1F" },
      { name: "Asphalt", hex: "#2B2B2B" },
      { name: "Chalk", hex: "#F4F1EA" },
    ],
    typeface: "Vites Wide (custom)",
    mark: "wheels",
    disciplines: [D.naming, D.identity, D.web],
    headline: { en: "Two wheels, one colour you can see in traffic", tr: "İki teker, trafikte görülen tek renk" },
    problem: {
      en: "A small frame builder with a long name, a forgettable logo and bikes that were better than their price suggested.",
      tr: "Uzun adlı, akılda kalmayan logolu ve fiyatının gösterdiğinden iyi bisikletler yapan küçük bir kadro üreticisi.",
    },
    approach: {
      en: "We shortened the name to Vites, painted the frames one signal orange and built a shop around frame sizes instead of model names.",
      tr: "Adı Vites’e kısalttık, kadroları tek bir sinyal turuncusuna boyadık ve mağazayı model adları yerine kadro ölçülerine göre kurduk.",
    },
    deliverables: [
      { en: "Name and wordmark", tr: "İsim ve logotip" },
      { en: "Frame graphics and decals", tr: "Kadro grafikleri ve çıkartmalar" },
      { en: "Online shop with a size finder", tr: "Ölçü bulucu ile çevrim içi mağaza" },
    ],
    results: [
      { value: "−42%", label: { en: "returns for wrong frame size", tr: "yanlış ölçü kaynaklı iade" } },
      { value: "1,900", label: { en: "bikes sold in the first season", tr: "ilk sezonda satılan bisiklet" } },
      { value: "3", label: { en: "city dealers signed after launch", tr: "lansmandan sonra imzalanan şehir bayisi" } },
    ],
    quote: {
      text: { en: "The orange did more for us than any ad. People see a Vites two streets away.", tr: "Turuncu bizim için her reklamdan fazlasını yaptı. İnsanlar bir Vites’i iki sokak öteden görüyor." },
      author: "Umut Kaplan",
      role: { en: "Founder, Vites Bikes", tr: "Kurucu, Vites Bikes" },
    },
    weeks: 10,
  },
  {
    id: "defne",
    client: "Defne Books",
    sector: { en: "Independent publisher, poetry and essays", tr: "Bağımsız yayınevi, şiir ve deneme" },
    year: 2025,
    colour: "#1F7A4D",
    palette: [
      { name: "Laurel", hex: "#1F7A4D" },
      { name: "Paper", hex: "#F2EDE3" },
      { name: "Ink", hex: "#16211B" },
    ],
    typeface: "Defne Serif / Defne Mono",
    mark: "leaf",
    disciplines: [D.identity, D.editorial],
    headline: { en: "A cover system that makes 40 books look like one shelf", tr: "40 kitabı tek bir raf gibi gösteren kapak sistemi" },
    problem: {
      en: "Every cover was designed from scratch, so the list never looked like a list — and each one took a freelancer three weeks.",
      tr: "Her kapak sıfırdan tasarlanıyordu; liste hiç liste gibi görünmüyordu ve her biri bir serbest tasarımcının üç haftasını alıyordu.",
    },
    approach: {
      en: "A grid, one laurel green and a rule: the poem picks the cover. A line from the book sits where the image used to be.",
      tr: "Bir ızgara, tek bir defne yeşili ve bir kural: kapağı şiir seçer. Görselin yerinde kitaptan bir dize durur.",
    },
    deliverables: [
      { en: "Cover system and templates", tr: "Kapak sistemi ve şablonlar" },
      { en: "Colophon mark", tr: "Künye işareti" },
      { en: "Catalogue and fair stand", tr: "Katalog ve fuar standı" },
    ],
    results: [
      { value: "2 days", label: { en: "per cover, down from three weeks", tr: "kapak başına, üç haftadan" } },
      { value: "40", label: { en: "titles re-covered in one year", tr: "bir yılda yenilenen başlık" } },
      { value: "+18%", label: { en: "backlist sales", tr: "eski başlık satışı" } },
    ],
    quote: {
      text: { en: "Booksellers started shelving us face-out, together. That never happened before.", tr: "Kitapçılar bizi yan yana, kapağı önde dizmeye başladı. Bu daha önce hiç olmamıştı." },
      author: "Leyla Aksoy",
      role: { en: "Publisher, Defne Books", tr: "Yayıncı, Defne Kitap" },
    },
    weeks: 8,
  },
  {
    id: "orbit",
    client: "Orbit FM",
    sector: { en: "Community radio, 94.6", tr: "Topluluk radyosu, 94.6" },
    year: 2024,
    colour: "#FFD23F",
    palette: [
      { name: "Sodium", hex: "#FFD23F" },
      { name: "Night", hex: "#141414" },
      { name: "Static", hex: "#BDBDBD" },
    ],
    typeface: "Orbit Mono (custom)",
    mark: "orbit",
    disciplines: [D.identity, D.motion, D.web],
    headline: { en: "A station identity that moves to the music", tr: "Müziğe göre hareket eden bir istasyon kimliği" },
    problem: {
      en: "Thirty-two volunteer shows, thirty-two logos. Listeners knew the shows, not the station.",
      tr: "Otuz iki gönüllü program, otuz iki logo. Dinleyici programları tanıyordu, istasyonu değil.",
    },
    approach: {
      en: "One ring that every show can fill with its own pattern, driven by the audio. Yellow on black, everywhere.",
      tr: "Her programın sesle sürülen kendi deseniyle doldurabildiği tek bir halka. Her yerde siyah üstüne sarı.",
    },
    deliverables: [
      { en: "Ring mark and show template", tr: "Halka işareti ve program şablonu" },
      { en: "Audio-reactive motion kit", tr: "Sese tepki veren hareket kiti" },
      { en: "Live player website", tr: "Canlı yayın oynatıcılı site" },
    ],
    results: [
      { value: "32", label: { en: "shows on one system", tr: "program tek sistemde" } },
      { value: "+64%", label: { en: "live stream listeners", tr: "canlı yayın dinleyicisi" } },
      { value: "12 min", label: { en: "to make a new show cover", tr: "yeni program kapağı için" } },
    ],
    quote: {
      text: { en: "Our volunteers make their own show art in minutes now, and it still looks like Orbit.", tr: "Gönüllülerimiz artık program görsellerini dakikalar içinde yapıyor ve hâlâ Orbit gibi görünüyor." },
      author: "Can Özkan",
      role: { en: "Station manager, Orbit FM", tr: "İstasyon müdürü, Orbit FM" },
    },
    weeks: 12,
  },
  {
    id: "mira",
    client: "Mira Optik",
    sector: { en: "Eyewear, four shops in Izmir", tr: "Gözlük, İzmir’de dört mağaza" },
    year: 2024,
    colour: "#FF8FB1",
    palette: [
      { name: "Lens pink", hex: "#FF8FB1" },
      { name: "Frame", hex: "#3A1F2B" },
      { name: "Glass", hex: "#F7F2F4" },
    ],
    typeface: "Mira Serif (custom cut)",
    mark: "lens",
    disciplines: [D.strategy, D.identity, D.signage],
    headline: { en: "An optician that feels like a shop, not a clinic", tr: "Klinik değil, dükkân gibi hissettiren bir gözlükçü" },
    problem: {
      en: "White walls, blue logo, a waiting-room feeling. Younger customers bought frames online and came in only for the test.",
      tr: "Beyaz duvarlar, mavi logo, bekleme salonu hissi. Genç müşteriler çerçeveyi internetten alıp yalnızca muayene için geliyordu.",
    },
    approach: {
      en: "We kept the eye test serious and made everything around it warm: pink shopfronts, a serif with character, frames displayed like objects in a gallery.",
      tr: "Göz muayenesini ciddi tuttuk, çevresindeki her şeyi sıcaklaştırdık: pembe vitrinler, karakterli bir serif, galerideki nesneler gibi sergilenen çerçeveler.",
    },
    deliverables: [
      { en: "Identity and shopfront signage", tr: "Kimlik ve vitrin tabelası" },
      { en: "Frame display system", tr: "Çerçeve teşhir sistemi" },
      { en: "Prescription envelope and case", tr: "Reçete zarfı ve gözlük kılıfı" },
    ],
    results: [
      { value: "+27%", label: { en: "frames sold per eye test", tr: "muayene başına satılan çerçeve" } },
      { value: "4", label: { en: "shops refitted in 9 weeks", tr: "dükkân 9 haftada yenilendi" } },
      { value: "35%", label: { en: "of new customers under 30", tr: "yeni müşterilerin 30 yaş altı payı" } },
    ],
    quote: {
      text: { en: "Customers take photos of the shopfront. Nobody ever photographed an optician before.", tr: "Müşteriler vitrinin fotoğrafını çekiyor. Daha önce kimse bir gözlükçünün fotoğrafını çekmezdi." },
      author: "Elif Demir",
      role: { en: "Owner, Mira Optik", tr: "Sahibi, Mira Optik" },
    },
    weeks: 9,
  },
  {
    id: "pazar",
    client: "Pazar Kooperatifi",
    sector: { en: "Producers’ cooperative, 140 farms", tr: "Üretici kooperatifi, 140 çiftlik" },
    year: 2023,
    colour: "#B5452B",
    palette: [
      { name: "Clay", hex: "#B5452B" },
      { name: "Wheat", hex: "#EBD9A8" },
      { name: "Soil", hex: "#3B2A20" },
    ],
    typeface: "Pazar Soft / Pazar Sans",
    mark: "grid",
    disciplines: [D.naming, D.strategy, D.packaging],
    headline: { en: "140 farms, one label that still names each farmer", tr: "140 çiftlik, her üreticinin adını hâlâ taşıyan tek etiket" },
    problem: {
      en: "Members wanted a shared brand for the supermarket shelf without losing the farm names that their regular buyers trusted.",
      tr: "Üyeler, düzenli alıcılarının güvendiği çiftlik adlarını kaybetmeden süpermarket rafı için ortak bir marka istiyordu.",
    },
    approach: {
      en: "A clay-red grid label: the cooperative on top, the farm, village and harvest week in the cell below. One system, 140 stories.",
      tr: "Kil kırmızısı ızgaralı bir etiket: üstte kooperatif, alttaki hücrede çiftlik, köy ve hasat haftası. Tek sistem, 140 hikâye.",
    },
    deliverables: [
      { en: "Name and cooperative mark", tr: "İsim ve kooperatif işareti" },
      { en: "Grid label for 60 products", tr: "60 ürün için ızgara etiket" },
      { en: "Market stall kit", tr: "Pazar tezgâhı kiti" },
    ],
    results: [
      { value: "60", label: { en: "products on one label system", tr: "ürün tek etiket sisteminde" } },
      { value: "+22%", label: { en: "average price per kilo", tr: "kilo başına ortalama fiyat" } },
      { value: "2", label: { en: "national supermarket listings", tr: "ulusal market listelemesi" } },
    ],
    quote: {
      text: { en: "My name is still on the jar. That was the only thing I asked for, and they kept it.", tr: "Adım hâlâ kavanozun üstünde. İstediğim tek şey buydu ve korudular." },
      author: "Mehmet Arı",
      role: { en: "Member farmer, Pazar Kooperatifi", tr: "Üye üretici, Pazar Kooperatifi" },
    },
    weeks: 16,
  },
];

export const projectById = (id: ProjectId) => projects.find((p) => p.id === id)!;

/** Services with weeks and starting prices (per locale currency). */
export const services: { id: string; name: L; text: L; weeks: number; fromUsd: number; fromTry: number }[] = [
  { id: "naming", name: D.naming, text: { en: "Names that are short, sayable in Turkish and English, and available.", tr: "Kısa, Türkçe ve İngilizce söylenebilen ve alınabilir isimler." }, weeks: 3, fromUsd: 6000, fromTry: 210000 },
  { id: "strategy", name: D.strategy, text: { en: "Who it is for, what it promises, what it never says.", tr: "Kimin için, neyi vaat ediyor, neyi asla söylemiyor." }, weeks: 3, fromUsd: 8000, fromTry: 280000 },
  { id: "identity", name: D.identity, text: { en: "Mark, type, colour and the rules that keep them together.", tr: "İşaret, yazı, renk ve onları bir arada tutan kurallar." }, weeks: 6, fromUsd: 18000, fromTry: 630000 },
  { id: "packaging", name: D.packaging, text: { en: "Labels and boxes that win three seconds on a shelf.", tr: "Rafta üç saniyeyi kazanan etiketler ve kutular." }, weeks: 5, fromUsd: 12000, fromTry: 420000 },
  { id: "web", name: D.web, text: { en: "Sites built on the identity, not decorated with it.", tr: "Kimliğin üzerine kurulan, onunla süslenmeyen siteler." }, weeks: 6, fromUsd: 15000, fromTry: 525000 },
  { id: "motion", name: D.motion, text: { en: "The brand when it moves: idents, social, screens.", tr: "Marka hareket ettiğinde: jenerik, sosyal, ekranlar." }, weeks: 4, fromUsd: 9000, fromTry: 315000 },
];
