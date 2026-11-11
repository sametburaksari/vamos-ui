// Sample content for "Harbor City FC", a fictional semi-professional football club ("the Pilots")
// playing in the fictional Coastal League. Every human-readable field is `Localized` ({ en, tr })
// and resolved with `pickLocale`. Dates are `YYYY-MM-DD`, kick-offs "HH:mm" local time, always on
// the 24-hour clock. The data is a snapshot taken on Wednesday 11 November 2026.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
type L = Localized<string>;

/** Fictional numbers and domains only. */
export const PHONE = "+902160000000";
export const EMAIL = "office@harborcityfc.example.com";
export const TICKETS_EMAIL = "tickets@harborcityfc.example.com";
export const CLUB = "Harbor City FC";
export const SHORT = "Harbor City";
export const GROUND = "The Quayside";
export const SEASON = "2026/27";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  /** "15:00" on the 24-hour clock in every locale. */
  const time = (hhmm: string) => f.time(`2026-01-01T${hhmm}:00`, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  /** Whole lira: "₺6,400" / "₺6.400". */
  const lira = (n: number) => f.currency(n, "TRY", { minimumFractionDigits: 0, maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" });
  return {
    locale,
    t,
    f,
    time,
    lira,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export const photos = {
  floodlights: { ...unsplash("1431324155629-1a6deb1dec8d", 1800, 1200), alt: { en: "A night game under a single floodlight, players spread across the pitch", tr: "Tek bir projektörün altında gece maçı, sahaya yayılmış oyuncular" } as L },
  stadium: { ...unsplash("1522778119026-d647f0596c20", 1800, 1200), alt: { en: "Full stands around a freshly striped pitch before kick-off", tr: "Başlama vuruşundan önce yeni biçilmiş sahanın çevresinde dolu tribünler" } as L },
  strike: { ...unsplash("1560272564-c83b66b1ad12", 1400, 1000), alt: { en: "A player in black volleying the ball in front of a goal", tr: "Siyah formalı bir oyuncu kalenin önünde topa vole vuruyor" } as L },
  ball: { ...unsplash("1574629810360-7efbbe195018", 1400, 1000), alt: { en: "A boot about to strike a ball on wet grass", tr: "Islak çimde topa vurmak üzere olan bir krampon" } as L },
  line: { ...unsplash("1459865264687-595d652de67e", 1400, 1000), alt: { en: "Close-up of a white touchline painted on the grass", tr: "Çime çizilmiş beyaz kenar çizgisinin yakın çekimi" } as L },
};

/* ------------------------------------------------------------------ */
/* Clubs, teams, competitions                                           */
/* ------------------------------------------------------------------ */

export type TeamId = "men" | "women" | "u19";
export type CompId = "league" | "cup" | "friendly";

export const teams: { id: TeamId; name: L }[] = [
  { id: "men", name: { en: "First team", tr: "A takım" } },
  { id: "women", name: { en: "Women", tr: "Kadın takımı" } },
  { id: "u19", name: { en: "Under-19", tr: "U19" } },
];

export const competitions: { id: CompId; name: L; short: L }[] = [
  { id: "league", name: { en: "Coastal League", tr: "Sahil Ligi" }, short: { en: "League", tr: "Lig" } },
  { id: "cup", name: { en: "Harbour Shield", tr: "Liman Kalkanı" }, short: { en: "Cup", tr: "Kupa" } },
  { id: "friendly", name: { en: "Friendly", tr: "Hazırlık maçı" }, short: { en: "Friendly", tr: "Hazırlık" } },
];

/** Opponents, with their ground for away games. */
export const clubs: Record<string, { name: string; ground: string }> = {
  saltmarsh: { name: "Saltmarsh Athletic", ground: "Marsh Lane" },
  kestrel: { name: "Kestrel Town", ground: "Kestrel Park" },
  ironbridge: { name: "Ironbridge United", ground: "Foundry Road" },
  avalon: { name: "Port Avalon", ground: "Lantern Park" },
  westcliff: { name: "Westcliff Wanderers", ground: "Cliff Top" },
  millbrook: { name: "Millbrook City", ground: "The Mill Ground" },
  daleford: { name: "Daleford FC", ground: "Dale Meadow" },
  copper: { name: "Copper Bay", ground: "Bayview Stadium" },
  eastholm: { name: "Eastholm Albion", ground: "Holm Park" },
  northgate: { name: "Northgate Rovers", ground: "Gatehouse Road" },
  greyhaven: { name: "Greyhaven Town", ground: "The Haven" },
  thornfield: { name: "Thornfield", ground: "Thorn Lane" },
};

export interface Match {
  id: string;
  team: TeamId;
  comp: CompId;
  /** "R2", "QF" for the cup; the matchday number for the league. */
  round?: L;
  date: string;
  kickoff: string;
  home: boolean;
  opponent: keyof typeof clubs;
  /** [Harbor City, opponent] — results only. */
  score?: [number, number];
  /** Scorers for Harbor City, results only. */
  scorers?: string;
  /** Fixtures: on general sale / members only / sold out. */
  tickets?: "on-sale" | "members" | "sold-out" | "free";
  /** Fixtures: live on the club stream. */
  stream?: boolean;
}

const md = (n: number): L => ({ en: `Matchday ${n}`, tr: `${n}. hafta` });

export const matches: Match[] = [
  /* First team · results */
  { id: "m01", team: "men", comp: "friendly", date: "2026-07-25", kickoff: "18:00", home: false, opponent: "daleford", score: [1, 1], scorers: "Okafor" },
  { id: "m02", team: "men", comp: "friendly", date: "2026-08-01", kickoff: "18:00", home: true, opponent: "thornfield", score: [3, 0], scorers: "Demir 2, Lindqvist" },
  { id: "m03", team: "men", comp: "league", round: md(1), date: "2026-08-15", kickoff: "19:00", home: true, opponent: "saltmarsh", score: [2, 0], scorers: "Demir, Okafor" },
  { id: "m04", team: "men", comp: "league", round: md(2), date: "2026-08-22", kickoff: "19:00", home: false, opponent: "kestrel", score: [1, 1], scorers: "Varga (pen)" },
  { id: "m05", team: "men", comp: "league", round: md(3), date: "2026-08-29", kickoff: "19:00", home: true, opponent: "ironbridge", score: [3, 1], scorers: "Demir 2, Aydın" },
  { id: "m06", team: "men", comp: "cup", round: { en: "Round 1", tr: "1. tur" }, date: "2026-09-02", kickoff: "19:45", home: false, opponent: "thornfield", score: [2, 0], scorers: "Lindqvist, Okafor" },
  { id: "m07", team: "men", comp: "league", round: md(4), date: "2026-09-12", kickoff: "15:00", home: false, opponent: "avalon", score: [0, 1] },
  { id: "m08", team: "men", comp: "league", round: md(5), date: "2026-09-19", kickoff: "15:00", home: true, opponent: "westcliff", score: [2, 2], scorers: "Varga, Demir" },
  { id: "m09", team: "men", comp: "league", round: md(6), date: "2026-09-26", kickoff: "15:00", home: false, opponent: "millbrook", score: [2, 1], scorers: "Aydın, Okafor" },
  { id: "m10", team: "men", comp: "league", round: md(7), date: "2026-10-03", kickoff: "15:00", home: true, opponent: "daleford", score: [4, 0], scorers: "Demir 3, Brennan" },
  { id: "m11", team: "men", comp: "cup", round: { en: "Round 2", tr: "2. tur" }, date: "2026-10-07", kickoff: "19:45", home: true, opponent: "eastholm", score: [1, 0], scorers: "Varga" },
  { id: "m12", team: "men", comp: "league", round: md(8), date: "2026-10-17", kickoff: "15:00", home: false, opponent: "copper", score: [1, 2], scorers: "Okafor" },
  { id: "m13", team: "men", comp: "league", round: md(9), date: "2026-10-24", kickoff: "15:00", home: true, opponent: "eastholm", score: [3, 2], scorers: "Demir, Lindqvist, Aydın" },
  { id: "m14", team: "men", comp: "league", round: md(10), date: "2026-10-31", kickoff: "17:30", home: false, opponent: "northgate", score: [0, 0] },
  { id: "m15", team: "men", comp: "league", round: md(11), date: "2026-11-07", kickoff: "15:00", home: true, opponent: "greyhaven", score: [2, 1], scorers: "Demir, Varga (pen)" },
  /* First team · fixtures */
  { id: "m16", team: "men", comp: "league", round: md(12), date: "2026-11-14", kickoff: "15:00", home: false, opponent: "saltmarsh", tickets: "on-sale", stream: true },
  { id: "m17", team: "men", comp: "league", round: md(13), date: "2026-11-21", kickoff: "15:00", home: true, opponent: "kestrel", tickets: "on-sale", stream: true },
  { id: "m18", team: "men", comp: "cup", round: { en: "Quarter-final", tr: "Çeyrek final" }, date: "2026-11-25", kickoff: "19:45", home: true, opponent: "avalon", tickets: "members", stream: true },
  { id: "m19", team: "men", comp: "league", round: md(14), date: "2026-11-28", kickoff: "17:30", home: false, opponent: "ironbridge", tickets: "on-sale" },
  { id: "m20", team: "men", comp: "league", round: md(15), date: "2026-12-05", kickoff: "15:00", home: true, opponent: "avalon", tickets: "sold-out", stream: true },
  { id: "m21", team: "men", comp: "league", round: md(16), date: "2026-12-12", kickoff: "15:00", home: false, opponent: "westcliff", tickets: "on-sale" },
  { id: "m22", team: "men", comp: "league", round: md(17), date: "2026-12-19", kickoff: "15:00", home: true, opponent: "millbrook", tickets: "on-sale", stream: true },
  { id: "m23", team: "men", comp: "league", round: md(18), date: "2026-12-26", kickoff: "13:00", home: false, opponent: "daleford", tickets: "on-sale" },
  { id: "m24", team: "men", comp: "league", round: md(19), date: "2027-01-02", kickoff: "15:00", home: true, opponent: "copper", tickets: "on-sale", stream: true },
  /* Women · results */
  { id: "w01", team: "women", comp: "league", round: md(1), date: "2026-09-06", kickoff: "14:00", home: true, opponent: "westcliff", score: [3, 1], scorers: "Kaya 2, Moreau" },
  { id: "w02", team: "women", comp: "league", round: md(2), date: "2026-09-20", kickoff: "14:00", home: false, opponent: "copper", score: [2, 2], scorers: "Kaya, Nyström" },
  { id: "w03", team: "women", comp: "cup", round: { en: "Round 1", tr: "1. tur" }, date: "2026-10-04", kickoff: "13:00", home: true, opponent: "greyhaven", score: [5, 0], scorers: "Moreau 2, Kaya, Ellis, Nyström" },
  { id: "w04", team: "women", comp: "league", round: md(3), date: "2026-10-18", kickoff: "14:00", home: false, opponent: "avalon", score: [1, 3], scorers: "Ellis" },
  { id: "w05", team: "women", comp: "league", round: md(4), date: "2026-11-01", kickoff: "14:00", home: true, opponent: "kestrel", score: [2, 0], scorers: "Kaya, Moreau" },
  /* Women · fixtures */
  { id: "w06", team: "women", comp: "league", round: md(5), date: "2026-11-15", kickoff: "14:00", home: false, opponent: "eastholm", tickets: "free" },
  { id: "w07", team: "women", comp: "league", round: md(6), date: "2026-11-29", kickoff: "14:00", home: true, opponent: "northgate", tickets: "free", stream: true },
  { id: "w08", team: "women", comp: "cup", round: { en: "Round 2", tr: "2. tur" }, date: "2026-12-06", kickoff: "13:00", home: false, opponent: "millbrook", tickets: "on-sale" },
  { id: "w09", team: "women", comp: "league", round: md(7), date: "2026-12-13", kickoff: "14:00", home: true, opponent: "saltmarsh", tickets: "free", stream: true },
  /* Under-19 · results and fixtures */
  { id: "y01", team: "u19", comp: "league", round: md(1), date: "2026-09-13", kickoff: "11:00", home: false, opponent: "ironbridge", score: [2, 3], scorers: "Şahin, Osei" },
  { id: "y02", team: "u19", comp: "league", round: md(2), date: "2026-10-11", kickoff: "11:00", home: true, opponent: "daleford", score: [4, 1], scorers: "Osei 2, Petrov, Şahin" },
  { id: "y03", team: "u19", comp: "friendly", date: "2026-10-28", kickoff: "18:30", home: true, opponent: "thornfield", score: [1, 1], scorers: "Petrov" },
  { id: "y04", team: "u19", comp: "league", round: md(3), date: "2026-11-22", kickoff: "11:00", home: false, opponent: "greyhaven", tickets: "free" },
  { id: "y05", team: "u19", comp: "league", round: md(4), date: "2026-12-20", kickoff: "11:00", home: true, opponent: "copper", tickets: "free" },
];

export const nextMatch = matches.find((m) => m.id === "m16")!;
export const nextHomeMatch = matches.find((m) => m.id === "m17")!;

/* ------------------------------------------------------------------ */
/* Coastal League table after matchday 11                               */
/* ------------------------------------------------------------------ */

export type FormLetter = "W" | "D" | "L";
export interface StandingRow {
  club: string;
  us?: boolean;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  /** Oldest first. */
  form: FormLetter[];
}
const row = (club: string, w: number, d: number, l: number, gf: number, ga: number, form: string, us?: boolean): StandingRow => ({ club, us, p: w + d + l, w, d, l, gf, ga, form: form.split("") as FormLetter[] });

export const standings: StandingRow[] = [
  row("Port Avalon", 8, 2, 1, 22, 9, "WWDWW"),
  row(CLUB, 6, 3, 2, 20, 11, "WLWDW", true),
  row("Copper Bay", 6, 2, 3, 18, 12, "WWLWL"),
  row("Northgate Rovers", 5, 4, 2, 15, 10, "DDWLW"),
  row("Westcliff Wanderers", 5, 3, 3, 17, 14, "LWWDW"),
  row("Kestrel Town", 4, 4, 3, 13, 12, "DWDLD"),
  row("Millbrook City", 4, 1, 6, 14, 16, "LWLLW"),
  row("Eastholm Albion", 3, 3, 5, 12, 15, "WLLDL"),
  row("Greyhaven Town", 3, 3, 5, 11, 15, "DLWDL"),
  row("Ironbridge United", 2, 4, 5, 10, 16, "LDDWL"),
  row("Saltmarsh Athletic", 2, 2, 7, 8, 19, "LLWLD"),
  row("Daleford FC", 1, 3, 7, 7, 18, "LDLLD"),
];

/* ------------------------------------------------------------------ */
/* News, people, membership                                             */
/* ------------------------------------------------------------------ */

export const news: { title: L; excerpt: L; date: string; category: L; minutes: number; photo?: keyof typeof photos }[] = [
  {
    title: { en: "Demir’s hat-trick and the 4–0 that turned October", tr: "Demir’in hat-trick’i ve Ekim’i çeviren 4–0" },
    excerpt: { en: "Eleven goals in eleven league games. Our number nine on finishing, the new left-foot routine and why he still takes the ferry to training.", tr: "On bir lig maçında on bir gol. Golcümüz bitiricilik, yeni sol ayak rutini ve antrenmana hâlâ neden vapurla geldiği üzerine." },
    date: "2026-11-09",
    category: { en: "First team", tr: "A takım" },
    minutes: 6,
    photo: "strike",
  },
  {
    title: { en: "Quarter-final tickets: members’ window opens Friday", tr: "Çeyrek final biletleri: üye önceliği Cuma açılıyor" },
    excerpt: { en: "Port Avalon at The Quayside, Wednesday 25 November. Members get 48 hours before general sale.", tr: "25 Kasım Çarşamba, The Quayside’da Port Avalon. Üyeler genel satıştan 48 saat önce alabilir." },
    date: "2026-11-10",
    category: { en: "Tickets", tr: "Bilet" },
    minutes: 2,
  },
  {
    title: { en: "Women’s side put five past Greyhaven", tr: "Kadın takımımız Greyhaven’a beş attı" },
    excerpt: { en: "Moreau scored twice as the Pilots reached the second round of the Shield.", tr: "Moreau’nun iki golüyle Pilotlar Kalkan’da ikinci tura yükseldi." },
    date: "2026-10-05",
    category: { en: "Women", tr: "Kadın takımı" },
    minutes: 3,
  },
  {
    title: { en: "The Lighthouse End gets its roof back", tr: "Fener Tribünü çatısına kavuşuyor" },
    excerpt: { en: "Work finishes before the Kestrel game. 640 covered seats, safe standing in rows A–F.", tr: "Çalışmalar Kestrel maçından önce bitiyor. 640 kapalı koltuk, A–F sıralarında güvenli ayakta alan." },
    date: "2026-10-28",
    category: { en: "Club", tr: "Kulüp" },
    minutes: 4,
  },
];

export const scorers: { name: string; goals: number; apps: number; pos: L }[] = [
  { name: "Emir Demir", goals: 11, apps: 13, pos: { en: "Striker", tr: "Forvet" } },
  { name: "Daniel Okafor", goals: 5, apps: 15, pos: { en: "Winger", tr: "Kanat" } },
  { name: "Bence Varga", goals: 4, apps: 14, pos: { en: "Midfield", tr: "Orta saha" } },
  { name: "Selin Aydın", goals: 3, apps: 15, pos: { en: "Midfield", tr: "Orta saha" } },
];

export type PlanId = "supporter" | "junior" | "adult" | "family";
export const plans: { id: PlanId; name: L; price: number; description: L; features: { text: L; included?: boolean }[]; highlight?: L }[] = [
  {
    id: "supporter",
    name: { en: "Supporter", tr: "Taraftar" },
    price: 750,
    description: { en: "No seat, all the rest. For exiles and away-day regulars.", tr: "Koltuk yok, gerisi tamam. Uzakta yaşayanlar ve deplasmancılar için." },
    features: [
      { text: { en: "48-hour priority window for every match", tr: "Her maç için 48 saat öncelikli alım" } },
      { text: { en: "A vote at the members’ AGM", tr: "Üyeler genel kurulunda oy hakkı" } },
      { text: { en: "Every match live on Pilots TV", tr: "Tüm maçlar Pilots TV’de canlı" } },
      { text: { en: "Season ticket seat", tr: "Kombine koltuğu" }, included: false },
    ],
  },
  {
    id: "junior",
    name: { en: "Under-18", tr: "18 yaş altı" },
    price: 1900,
    description: { en: "A seat in any stand, plus a mascot draw every home game.", tr: "Her tribünde koltuk ve her iç saha maçında maskot çekilişi." },
    features: [
      { text: { en: "All 11 home league matches", tr: "11 iç saha lig maçının tamamı" } },
      { text: { en: "Mascot and ball-kid draw", tr: "Maskot ve top toplayıcı çekilişi" } },
      { text: { en: "Free entry to Women’s and U19 games", tr: "Kadın ve U19 maçlarına ücretsiz giriş" } },
      { text: { en: "Cup matches at half price", tr: "Kupa maçları yarı fiyatına" } },
    ],
  },
  {
    id: "adult",
    name: { en: "Adult season ticket", tr: "Yetişkin kombine" },
    price: 6400,
    description: { en: "Your seat for every home league game. Same seat, every week.", tr: "Her iç saha lig maçında sizin koltuğunuz. Her hafta aynı yer." },
    highlight: { en: "Most members", tr: "En çok tercih edilen" },
    features: [
      { text: { en: "All 11 home league matches", tr: "11 iç saha lig maçının tamamı" } },
      { text: { en: "First refusal on cup tickets", tr: "Kupa biletlerinde ilk hak" } },
      { text: { en: "Free entry to Women’s and U19 games", tr: "Kadın ve U19 maçlarına ücretsiz giriş" } },
      { text: { en: "10% off in the club shop", tr: "Kulüp mağazasında %10 indirim" } },
      { text: { en: "A vote at the members’ AGM", tr: "Üyeler genel kurulunda oy hakkı" } },
    ],
  },
  {
    id: "family",
    name: { en: "Family", tr: "Aile" },
    price: 13800,
    description: { en: "Two adults and up to two under-16s, seated together in the Customs House Stand.", tr: "İki yetişkin ve en fazla iki 16 yaş altı, Gümrük Tribünü’nde yan yana." },
    features: [
      { text: { en: "Four seats, all 11 home league matches", tr: "Dört koltuk, 11 iç saha lig maçı" } },
      { text: { en: "Family zone with its own entrance", tr: "Ayrı girişli aile bölümü" } },
      { text: { en: "Birthday message on the big screen", tr: "Dev ekranda doğum günü mesajı" } },
      { text: { en: "Two votes at the members’ AGM", tr: "Genel kurulda iki oy" } },
    ],
  },
];

export const stands: { name: L; note: L; seats: number }[] = [
  { name: { en: "North Quay Stand", tr: "Kuzey Rıhtım Tribünü" }, note: { en: "Main stand, press box, best view of the harbour lights.", tr: "Ana tribün, basın locası, liman ışıklarına en iyi manzara." }, seats: 2100 },
  { name: { en: "Lighthouse End", tr: "Fener Tribünü" }, note: { en: "Home end. Safe standing in rows A–F; the drums live here.", tr: "Ev sahibi kale arkası. A–F sıraları güvenli ayakta alan; davullar burada." }, seats: 1400 },
  { name: { en: "Customs House Stand", tr: "Gümrük Tribünü" }, note: { en: "Family zone and step-free access at gates 7–9.", tr: "Aile bölümü; 7–9 numaralı kapılarda basamaksız giriş." }, seats: 1650 },
];

export const joinSteps: { title: L; text: L }[] = [
  { title: { en: "Pick a membership", tr: "Üyeliğinizi seçin" }, text: { en: "Pay online or at the ticket office by the North Quay gate. Prices for the rest of the season drop by ₺420 for every home game already played.", tr: "Çevrimiçi ya da Kuzey Rıhtım kapısındaki gişede ödeyin. Sezonun kalanı için fiyat, oynanmış her iç saha maçı başına ₺420 düşer." } },
  { title: { en: "Choose your seat", tr: "Koltuğunuzu seçin" }, text: { en: "We email a seat-map link within one working day. Families are seated together automatically.", tr: "Bir iş günü içinde koltuk haritası bağlantısı e-postayla gelir. Aileler otomatik olarak yan yana oturur." } },
  { title: { en: "Collect your card", tr: "Kartınızı alın" }, text: { en: "Your membership card is your ticket. Pick it up on matchday or have it posted for free.", tr: "Üyelik kartınız biletinizdir. Maç günü gişeden alın ya da ücretsiz postalayalım." } },
];

export const faqMembership: { q: L; a: L }[] = [
  { q: { en: "Can I pay in instalments?", tr: "Taksitle ödeyebilir miyim?" }, a: { en: "Yes. Adult and Family memberships can be split into three monthly payments at no extra cost.", tr: "Evet. Yetişkin ve Aile üyelikleri ek ücret olmadan üç aylık taksite bölünebilir." } },
  { q: { en: "What if I can’t make a game?", tr: "Bir maça gelemezsem ne olur?" }, a: { en: "List your seat on the members’ exchange by 12:00 the day before. If it sells, we credit you ₺250 towards next season.", tr: "Koltuğunuzu bir gün önce saat 12:00’ye kadar üye takas listesine koyun. Satılırsa gelecek sezon için ₺250 hesabınıza işlenir." } },
  { q: { en: "Are cup games included?", tr: "Kupa maçları dahil mi?" }, a: { en: "No, but season ticket holders get first refusal on their own seat until 48 hours before general sale.", tr: "Hayır, ama kombine sahipleri genel satıştan 48 saat öncesine kadar kendi koltuklarında ilk hakka sahiptir." } },
  { q: { en: "Is the ground accessible?", tr: "Stat erişilebilir mi?" }, a: { en: "Gates 7–9 are step-free, with 24 wheelchair spaces and companion seats in the Customs House Stand. Call the office to book.", tr: "7–9 numaralı kapılar basamaksızdır; Gümrük Tribünü’nde 24 tekerlekli sandalye alanı ve refakatçi koltukları var. Ayırtmak için ofisi arayın." } },
];
