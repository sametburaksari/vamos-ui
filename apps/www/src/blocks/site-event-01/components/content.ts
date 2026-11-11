// Sample content for "Interface Days 2027", a fictional two-day design + engineering conference
// in Istanbul. Every human-readable field is `Localized` ({ en, tr }) and resolved with
// `pickLocale`. Times are "HH:mm" in Europe/Istanbul and always shown on the 24-hour clock.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized, type LogoItem } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

/** Fictional numbers and domains only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@interfacedays.example.com";
/** Doors open on day one, Istanbul time. */
export const STARTS_AT = "2027-05-14T09:30:00+03:00";
export const DAYS = ["2027-05-14", "2027-05-15"] as const;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "EUR", timeZone: "Europe/Istanbul" });
  /** "09:30" on the 24-hour clock in every locale. */
  const time = (hhmm: string) => f.time(hhmm, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  /** Whole euros: "€290" / "€290" per locale rules. */
  const eur = (n: number) => f.currency(n, "EUR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return {
    t,
    f,
    time,
    eur,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  hall: { ...unsplash("1540575467063-178a50c2df87", 1800, 1100), alt: { en: "The main stage from the back of the hall, lights down", tr: "Salonun arkasından ana sahne, ışıklar kısık" } as L },
  crowd: { ...unsplash("1505373877841-8d25f7d46678", 1600, 1100), alt: { en: "Attendees in rows watching a talk", tr: "Bir konuşmayı izleyen sıra sıra katılımcılar" } as L },
  stage: { ...unsplash("1475721027785-f74eccf877e2", 1600, 1100), alt: { en: "A speaker on stage in front of a large screen", tr: "Büyük bir ekranın önünde sahnedeki konuşmacı" } as L },
};

/* ------------------------------------------------------------------ */
/* Tracks and speakers                                                  */
/* ------------------------------------------------------------------ */

export type TrackId = "design" | "engineering" | "workshop";
/** Each track has a shape; colour is kept for the agenda state. */
export const tracks: { id: TrackId; name: L; shape: "circle" | "square" | "triangle" }[] = [
  { id: "design", name: { en: "Design", tr: "Tasarım" }, shape: "circle" },
  { id: "engineering", name: { en: "Engineering", tr: "Mühendislik" }, shape: "square" },
  { id: "workshop", name: { en: "Workshops", tr: "Atölyeler" }, shape: "triangle" },
];

export const rooms = {
  main: { en: "Main Stage · Dock A", tr: "Ana Sahne · Dok A" } as L,
  studio: { en: "Studio B", tr: "Stüdyo B" } as L,
  loft: { en: "Workshop Loft", tr: "Atölye Katı" } as L,
  foyer: { en: "Foyer", tr: "Fuaye" } as L,
  pier: { en: "Hasköy pier", tr: "Hasköy iskelesi" } as L,
};

export const speakers: { id: string; name: string; role: L; company: string; photo: string; shape: "circle" | "square" | "arch" | "leaf" }[] = [
  { id: "ayla", name: "Ayla Korkmaz", role: { en: "Design director", tr: "Tasarım direktörü" }, company: "Paperline Studio", photo: "1548142813-c348350df52b", shape: "arch" },
  { id: "jonas", name: "Jonas Brandt", role: { en: "Staff engineer", tr: "Kıdemli mühendis" }, company: "Halcyon Maps", photo: "1542909168-82c3e7fdca5c", shape: "circle" },
  { id: "priya", name: "Priya Raman", role: { en: "Accessibility lead", tr: "Erişilebilirlik lideri" }, company: "Ferro Health", photo: "1580489944761-15a19d654956", shape: "square" },
  { id: "emre", name: "Emre Taşkın", role: { en: "Type designer", tr: "Yazı karakteri tasarımcısı" }, company: "Kiln Type", photo: "1539571696357-5a69c17a67c6", shape: "leaf" },
  { id: "lucia", name: "Lucía Ortega", role: { en: "Design engineer", tr: "Tasarım mühendisi" }, company: "Brightfold", photo: "1544725176-7c40e5a71c5e", shape: "circle" },
  { id: "kenji", name: "Kenji Mori", role: { en: "Motion designer", tr: "Hareket tasarımcısı" }, company: "Studio Tide", photo: "1506794778202-cad84cf45f1d", shape: "arch" },
  { id: "defne", name: "Defne Arıkan", role: { en: "Head of design systems", tr: "Tasarım sistemleri lideri" }, company: "Kavak Bank", photo: "1567532939604-b6b5b0db2604", shape: "leaf" },
  { id: "tomas", name: "Tomás Silva", role: { en: "Frontend architect", tr: "Önyüz mimarı" }, company: "Parcel & Post", photo: "1566492031773-4f4e44671857", shape: "square" },
];
export const portrait = (id: string) => unsplash(id, 640, 800);

/* ------------------------------------------------------------------ */
/* Schedule                                                             */
/* ------------------------------------------------------------------ */

export interface Session {
  id: string;
  day: 0 | 1;
  start: string;
  end: string;
  /** `null`: everyone (registration, lunch, keynotes) — shown under every filter. */
  track: TrackId | null;
  kind: "talk" | "keynote" | "workshop" | "break";
  title: L;
  speaker?: string;
  room: keyof typeof rooms;
}

export const sessions: Session[] = [
  // Day 1 — Friday 14 May
  { id: "d1-reg", day: 0, start: "08:30", end: "09:30", track: null, kind: "break", title: { en: "Registration and Turkish coffee", tr: "Kayıt ve Türk kahvesi" }, room: "foyer" },
  { id: "d1-key", day: 0, start: "09:30", end: "10:15", track: null, kind: "keynote", title: { en: "Interfaces that admit they are software", tr: "Yazılım olduğunu kabul eden arayüzler" }, speaker: "ayla", room: "main" },
  { id: "d1-type", day: 0, start: "10:30", end: "11:10", track: "design", kind: "talk", title: { en: "Type at the size of a thumb", tr: "Başparmak boyunda tipografi" }, speaker: "emre", room: "studio" },
  { id: "d1-ds40", day: 0, start: "10:30", end: "11:10", track: "engineering", kind: "talk", title: { en: "Shipping a design system to 40 teams without a meeting", tr: "Tek toplantı yapmadan 40 ekibe tasarım sistemi" }, speaker: "defne", room: "main" },
  { id: "d1-forms", day: 0, start: "10:30", end: "12:30", track: "workshop", kind: "workshop", title: { en: "Accessible forms in two hours", tr: "İki saatte erişilebilir formlar" }, speaker: "priya", room: "loft" },
  { id: "d1-motion", day: 0, start: "11:20", end: "12:00", track: "design", kind: "talk", title: { en: "Motion as a status message", tr: "Durum mesajı olarak hareket" }, speaker: "kenji", room: "studio" },
  { id: "d1-maps", day: 0, start: "11:20", end: "12:00", track: "engineering", kind: "talk", title: { en: "Offline-first maps on a 3G connection", tr: "3G bağlantıda önce-çevrimdışı haritalar" }, speaker: "jonas", room: "main" },
  { id: "d1-lunch", day: 0, start: "12:30", end: "13:30", track: null, kind: "break", title: { en: "Lunch on the terrace", tr: "Terasta öğle yemeği" }, room: "foyer" },
  { id: "d1-rtl", day: 0, start: "13:30", end: "14:10", track: "design", kind: "talk", title: { en: "Right-to-left from day one", tr: "İlk günden sağdan sola" }, speaker: "lucia", room: "studio" },
  { id: "d1-cq", day: 0, start: "13:30", end: "14:10", track: "engineering", kind: "talk", title: { en: "Container queries in a nine-year-old codebase", tr: "Dokuz yıllık kod tabanında container query" }, speaker: "tomas", room: "main" },
  { id: "d1-proto", day: 0, start: "13:30", end: "15:30", track: "workshop", kind: "workshop", title: { en: "Prototyping with real, messy data", tr: "Gerçek ve dağınık veriyle prototip" }, speaker: "lucia", room: "loft" },
  { id: "d1-empty", day: 0, start: "14:20", end: "15:00", track: "design", kind: "talk", title: { en: "The empty state is the product", tr: "Boş ekran ürünün kendisidir" }, speaker: "ayla", room: "studio" },
  { id: "d1-perf", day: 0, start: "14:20", end: "15:00", track: "engineering", kind: "talk", title: { en: "A performance budget the designers wrote", tr: "Tasarımcıların yazdığı performans bütçesi" }, speaker: "jonas", room: "main" },
  { id: "d1-close", day: 0, start: "15:45", end: "16:30", track: null, kind: "keynote", title: { en: "Twelve years of one checkout page", tr: "Tek bir ödeme sayfasının on iki yılı" }, speaker: "tomas", room: "main" },
  { id: "d1-ferry", day: 0, start: "18:30", end: "21:00", track: null, kind: "break", title: { en: "Ferry social on the Golden Horn", tr: "Haliç’te vapur buluşması" }, room: "pier" },
  // Day 2 — Saturday 15 May
  { id: "d2-coffee", day: 1, start: "09:00", end: "09:45", track: null, kind: "break", title: { en: "Coffee and simit", tr: "Kahve ve simit" }, room: "foyer" },
  { id: "d2-key", day: 1, start: "09:45", end: "10:30", track: null, kind: "keynote", title: { en: "Accessibility is a performance problem", tr: "Erişilebilirlik bir performans sorunudur" }, speaker: "priya", room: "main" },
  { id: "d2-tokens", day: 1, start: "10:45", end: "11:25", track: "engineering", kind: "talk", title: { en: "Tokens that survive a rebrand", tr: "Marka yenilemesinden sağ çıkan tokenlar" }, speaker: "defne", room: "main" },
  { id: "d2-variable", day: 1, start: "10:45", end: "11:25", track: "design", kind: "talk", title: { en: "Variable fonts for Turkish, properly", tr: "Türkçe için değişken fontlar, doğru şekilde" }, speaker: "emre", room: "studio" },
  { id: "d2-anim", day: 1, start: "10:45", end: "12:45", track: "workshop", kind: "workshop", title: { en: "Springs, not curves: a motion workshop", tr: "Eğri değil yay: hareket atölyesi" }, speaker: "kenji", room: "loft" },
  { id: "d2-forms", day: 1, start: "11:35", end: "12:15", track: "design", kind: "talk", title: { en: "Ten forms we fixed and what broke", tr: "Düzelttiğimiz on form ve bozulanlar" }, speaker: "priya", room: "studio" },
  { id: "d2-edge", day: 1, start: "11:35", end: "12:15", track: "engineering", kind: "talk", title: { en: "Rendering at the edge for a bank", tr: "Bir banka için edge’de render" }, speaker: "tomas", room: "main" },
  { id: "d2-lunch", day: 1, start: "12:45", end: "13:45", track: null, kind: "break", title: { en: "Lunch on the terrace", tr: "Terasta öğle yemeği" }, room: "foyer" },
  { id: "d2-maps", day: 1, start: "13:45", end: "14:25", track: "design", kind: "talk", title: { en: "Drawing a map nobody has to read", tr: "Kimsenin okumak zorunda olmadığı bir harita" }, speaker: "jonas", room: "studio" },
  { id: "d2-review", day: 1, start: "13:45", end: "14:25", track: "engineering", kind: "talk", title: { en: "Design review as a pull request", tr: "Pull request olarak tasarım incelemesi" }, speaker: "lucia", room: "main" },
  { id: "d2-audit", day: 1, start: "13:45", end: "15:45", track: "workshop", kind: "workshop", title: { en: "Audit your own design system", tr: "Kendi tasarım sisteminizi denetleyin" }, speaker: "defne", room: "loft" },
  { id: "d2-close", day: 1, start: "16:00", end: "16:45", track: null, kind: "keynote", title: { en: "What we stopped designing", tr: "Tasarlamayı bıraktıklarımız" }, speaker: "kenji", room: "main" },
];

/* ------------------------------------------------------------------ */
/* Sponsors (fictional wordmarks)                                       */
/* ------------------------------------------------------------------ */

function wordmark(name: string, font: string, fill: string) {
  const width = Math.round(name.length * 14 + 16);
  const esc = name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='40' viewBox='0 0 ${width} 40'><text x='8' y='28' fill='${fill}' ${font}>${esc}</text></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width, height: 40 };
}
const FONTS = {
  sans: "font-family='Helvetica, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='-0.8'",
  mono: "font-family='Menlo, monospace' font-size='18' font-weight='600' letter-spacing='1'",
  condensed: "font-family='Arial Narrow, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='2'",
  serif: "font-family='Georgia, serif' font-size='25' letter-spacing='-0.5'",
};
const SPONSORS: [string, keyof typeof FONTS][] = [
  ["Paperline", "serif"],
  ["HALCYON MAPS", "condensed"],
  ["kiln/type", "mono"],
  ["Brightfold", "sans"],
  ["KAVAK BANK", "condensed"],
  ["Parcel&Post", "serif"],
  ["studio tide", "sans"],
  ["FERRO·HEALTH", "mono"],
];
export const sponsorLogos: LogoItem[] = SPONSORS.map(([name, font]) => ({
  name: name.replace(/[/·&]/g, " ").replace(/\s+/g, " ").trim(),
  image: wordmark(name, FONTS[font], "#1c1a17"),
  imageDark: wordmark(name, FONTS[font], "#efebe4"),
}));

/* ------------------------------------------------------------------ */
/* Tickets and FAQ                                                       */
/* ------------------------------------------------------------------ */

export const EUR = (amount: string) => ({ amount, currency: "EUR" });

export const faqHome: { q: L; a: L }[] = [
  { q: { en: "Is it in English?", tr: "Konuşmalar İngilizce mi?" }, a: { en: "Every talk is in English, with live Turkish captions on the screens in both rooms.", tr: "Tüm konuşmalar İngilizce; iki salonda da ekranlarda canlı Türkçe altyazı var." } },
  { q: { en: "Will talks be recorded?", tr: "Konuşmalar kaydedilecek mi?" }, a: { en: "Yes. Ticket holders get the recordings two weeks after the event; they go public in September 2027.", tr: "Evet. Bilet sahipleri kayıtları etkinlikten iki hafta sonra alır; kayıtlar Eylül 2027’de herkese açılır." } },
  { q: { en: "Is the venue step-free?", tr: "Mekân basamaksız mı?" }, a: { en: "Yes: ramps at both entrances, a lift to the Workshop Loft and a quiet room on the ground floor.", tr: "Evet: iki girişte rampa, Atölye Katı’na asansör ve zemin katta sessiz oda var." } },
  { q: { en: "Can I bring my child?", tr: "Çocuğumu getirebilir miyim?" }, a: { en: "Children under 12 come free. A supervised play corner runs both days from 09:00 to 17:00 — book it with your ticket.", tr: "12 yaş altı çocuklar ücretsiz. Gözetimli oyun köşesi iki gün de 09:00–17:00 arası açık — biletinizle birlikte ayırtın." } },
];

export const faqTickets: { q: L; a: L }[] = [
  { q: { en: "Can I get a refund?", tr: "İade alabilir miyim?" }, a: { en: "Full refund until 14 March 2027. After that, transfer your ticket to a colleague for free until 7 May.", tr: "14 Mart 2027’ye kadar tam iade. Sonrasında 7 Mayıs’a kadar biletinizi ücretsiz olarak bir meslektaşınıza devredebilirsiniz." } },
  { q: { en: "Do you send an invoice?", tr: "Fatura kesiyor musunuz?" }, a: { en: "Yes, an e-invoice in your company’s name within one working day. Turkish companies pay in TRY at the day’s rate.", tr: "Evet, bir iş günü içinde şirketiniz adına e-fatura. Türk şirketleri günün kuruyla TL öder." } },
  { q: { en: "I need a visa letter.", tr: "Vize davet mektubu gerekiyor." }, a: { en: "Write to visa@interfacedays.example.com with your ticket number; we reply within three working days.", tr: "Bilet numaranızla visa@interfacedays.example.com adresine yazın; üç iş günü içinde yanıtlarız." } },
  { q: { en: "Are workshops included?", tr: "Atölyeler dahil mi?" }, a: { en: "Workshop seats (24 each) come with Standard and Team tickets; pick yours in the schedule once you have a ticket.", tr: "Atölye koltukları (her biri 24 kişilik) Standart ve Ekip biletlerine dahildir; biletiniz olunca programdan seçin." } },
];

export const conduct: L = {
  en: "Interface Days is for everyone who makes interfaces. We do not tolerate harassment of attendees, speakers, volunteers or staff in any form — in the halls, on the ferry, in our chat or on social media.\n\nHarassment includes offensive comments about gender, gender identity, age, sexual orientation, disability, appearance, body size, ethnicity, religion or nationality; unwelcome photography or recording; and sustained disruption of talks.\n\nIf something happens, tell any volunteer in an orange lanyard, call the safety line on +90 216 000 00 00 (staffed both days, 08:00–22:00) or write to safety@interfacedays.example.com. We will respond within 15 minutes during the event and may remove anyone from the conference without a refund.",
  tr: "Interface Days arayüz üreten herkes içindir. Katılımcılara, konuşmacılara, gönüllülere ya da çalışanlara yönelik hiçbir tacize — salonlarda, vapurda, sohbet kanalımızda ya da sosyal medyada — müsamaha göstermeyiz.\n\nTaciz; cinsiyet, cinsiyet kimliği, yaş, cinsel yönelim, engellilik, görünüş, beden ölçüsü, etnik köken, din ya da milliyete dair saldırgan yorumları, istenmeyen fotoğraf veya kaydı ve konuşmaların sürekli bölünmesini kapsar.\n\nBir şey olursa turuncu kartlıklı herhangi bir gönüllüye söyleyin, güvenlik hattını arayın: +90 216 000 00 00 (iki gün de 08:00–22:00) ya da safety@interfacedays.example.com adresine yazın. Etkinlik süresince 15 dakika içinde dönüş yaparız ve gerekirse kişiyi iade yapmadan konferanstan çıkarabiliriz.",
};
