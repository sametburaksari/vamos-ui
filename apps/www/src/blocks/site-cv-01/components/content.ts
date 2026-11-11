// Sample content for "Deniz Arcan", a fictional product engineer in Istanbul.
// Every human-readable field is { en, tr } and resolved with `pickLocale`. Companies, projects,
// links and numbers are invented.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
/** A string in both languages. */
export type L = { en: string; tr: string };

export const EMAIL = "deniz@example.com";
export const PHONE = "+902160000000";
export const WEBSITE = "https://example.com/deniz";
export const GITHUB = "https://github.com/example";
export const LINKEDIN = "https://www.linkedin.com/in/example";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const month = new Intl.DateTimeFormat(intl, { month: "short", year: "numeric", timeZone: "UTC" });
  const day = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  /** `YYYY-MM` → "Mar 2023". */
  const ym = (v: string) => month.format(new Date(`${v}-01T00:00:00Z`));
  /** `YYYY-MM-DD` → "4 Nov 2026". */
  const ymd = (v: string) => day.format(new Date(`${v}T00:00:00Z`));
  /** Whole months between two `YYYY-MM` values (inclusive), as "3 yrs 2 mos". */
  const span = (from: string, to?: string) => {
    const [fy, fm] = from.split("-").map(Number) as [number, number];
    const [ty, tm] = (to ?? CV_AS_OF).split("-").map(Number) as [number, number];
    const total = (ty - fy) * 12 + (tm - fm) + 1;
    const y = Math.floor(total / 12);
    const m = total % 12;
    const parts = locale === "tr" ? [y ? `${y} yıl` : "", m ? `${m} ay` : ""] : [y ? `${y} yr${y > 1 ? "s" : ""}` : "", m ? `${m} mo${m > 1 ? "s" : ""}` : ""];
    return parts.filter(Boolean).join(" ");
  };
  return {
    t,
    intl,
    ym,
    ymd,
    span,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

/** "Present" is measured to this month, so the page reads the same on every render. */
export const CV_AS_OF = "2026-11";

export const profile = {
  name: "Deniz Arcan",
  role: { en: "Product engineer", tr: "Ürün mühendisi" },
  place: { en: "Istanbul, Türkiye · works remotely in CET ±2", tr: "İstanbul, Türkiye · CET ±2 saat diliminde uzaktan" },
  intro: {
    en: "I build the unglamorous parts of software — billing, permissions, offline sync — and make them feel obvious to the people who use them. Ten years across product teams of four to forty, mostly TypeScript and Postgres.",
    tr: "Yazılımın gösterişsiz kısımlarını — faturalama, yetkiler, çevrimdışı senkron — inşa ediyor ve onları kullananlara apaçık hissettiriyorum. Dört ila kırk kişilik ürün ekiplerinde on yıl; çoğunlukla TypeScript ve Postgres.",
  },
  status: { en: "Open to staff-level roles from February 2027", tr: "Şubat 2027’den itibaren staff seviyesi rollere açık" },
} satisfies Record<string, unknown>;

export interface Job {
  id: string;
  role: L;
  company: string;
  about: L;
  place: L;
  from: string;
  to?: string;
  points: L[];
  stack: string[];
}

export const jobs: Job[] = [
  {
    id: "tilda",
    role: { en: "Senior product engineer", tr: "Kıdemli ürün mühendisi" },
    company: "Tilda Ledger",
    about: { en: "B2B invoicing, 2,400 business customers", tr: "B2B faturalama, 2.400 kurumsal müşteri" },
    place: { en: "Istanbul · hybrid", tr: "İstanbul · hibrit" },
    from: "2023-03",
    points: [
      { en: "Led the move from per-seat to usage-based pricing: 2,400 accounts migrated over six weeks with zero incorrect invoices.", tr: "Kullanıcı başı fiyatlamadan kullanıma dayalı fiyatlamaya geçişi yönettim: 2.400 hesap altı haftada, tek bir hatalı fatura olmadan taşındı." },
      { en: "Designed the role and permission model now used by every product team; access-related tickets fell from 140 to 31 a month.", tr: "Artık tüm ürün ekiplerinin kullandığı rol ve yetki modelini tasarladım; erişimle ilgili talepler ayda 140’tan 31’e düştü." },
      { en: "Mentor two engineers; run the fortnightly RFC review.", tr: "İki mühendise mentorluk yapıyor, iki haftada bir RFC incelemesini yürütüyorum." },
    ],
    stack: ["TypeScript", "React", "Node.js", "Postgres", "Temporal"],
  },
  {
    id: "yukport",
    role: { en: "Product engineer", tr: "Ürün mühendisi" },
    company: "Yükport",
    about: { en: "Freight marketplace for regional hauliers", tr: "Bölgesel nakliyeciler için yük pazaryeri" },
    place: { en: "Istanbul", tr: "İstanbul" },
    from: "2020-06",
    to: "2023-02",
    points: [
      { en: "Built the offline-first driver app (React Native); proof-of-delivery works with no signal and syncs within 4 s of reconnecting.", tr: "Çevrimdışı öncelikli sürücü uygulamasını (React Native) geliştirdim; teslim kanıtı çekmeyen yerde de çalışır ve bağlantı gelince 4 sn içinde senkronlanır." },
      { en: "Cut support calls from drivers by 38% by replacing a 9-step job flow with three screens.", tr: "9 adımlı iş akışını üç ekrana indirerek sürücülerden gelen destek aramalarını %38 azalttım." },
    ],
    stack: ["React Native", "SQLite", "Go", "Kafka"],
  },
  {
    id: "mavna",
    role: { en: "Frontend engineer", tr: "Frontend mühendisi" },
    company: "Mavna Studio",
    about: { en: "Product studio, 14 people", tr: "Ürün stüdyosu, 14 kişi" },
    place: { en: "Izmir", tr: "İzmir" },
    from: "2018-01",
    to: "2020-05",
    points: [
      { en: "Shipped 11 client products, from a ferry ticketing kiosk to a municipal open-data portal.", tr: "Vapur bilet kiosk’undan belediye açık veri portalına kadar 11 müşteri ürünü teslim ettim." },
      { en: "Started the studio’s shared component library and accessibility checklist.", tr: "Stüdyonun ortak bileşen kütüphanesini ve erişilebilirlik kontrol listesini başlattım." },
    ],
    stack: ["React", "TypeScript", "GraphQL"],
  },
  {
    id: "sema",
    role: { en: "Software developer", tr: "Yazılım geliştirici" },
    company: "Sema Yazılım",
    about: { en: "ERP integrations", tr: "ERP entegrasyonları" },
    place: { en: "Ankara", tr: "Ankara" },
    from: "2016-07",
    to: "2017-12",
    points: [{ en: "Wrote the e-invoice export used by 300 accounting offices.", tr: "300 muhasebe bürosunun kullandığı e-fatura aktarımını yazdım." }],
    stack: ["C#", "SQL Server"],
  },
];

export interface Project {
  id: string;
  title: L;
  year: string;
  text: L;
  outcome: L;
  href: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: "usage-billing",
    title: { en: "Usage-based billing without a big bang", tr: "Büyük patlama olmadan kullanıma dayalı faturalama" },
    year: "2025",
    text: { en: "A shadow-invoicing system ran the new prices beside the old ones for two billing cycles, so every customer saw their new bill a month before paying it.", tr: "Gölge faturalama sistemi yeni fiyatları iki fatura dönemi boyunca eskilerin yanında çalıştırdı; her müşteri yeni faturasını ödemeden bir ay önce gördü." },
    outcome: { en: "0 incorrect invoices · churn flat at 1.1%", tr: "0 hatalı fatura · kayıp oranı %1,1’de sabit" },
    href: "https://example.com/deniz/usage-billing",
    tags: ["Postgres", "Temporal", "Product"],
  },
  {
    id: "permissions",
    title: { en: "Permissions people can read", tr: "Okunabilen yetkiler" },
    year: "2024",
    text: { en: "A permission editor that answers “what can this person do?” in plain sentences, with a preview of the app as that person.", tr: "“Bu kişi ne yapabilir?” sorusunu düz cümlelerle yanıtlayan ve uygulamayı o kişinin gözünden önizleyen bir yetki düzenleyici." },
    outcome: { en: "Access tickets −78%", tr: "Erişim talepleri −%78" },
    href: "https://example.com/deniz/permissions",
    tags: ["React", "Design systems"],
  },
  {
    id: "offline-sync",
    title: { en: "Proof of delivery, offline", tr: "Çevrimdışı teslim kanıtı" },
    year: "2022",
    text: { en: "A small sync engine on SQLite with per-field conflict rules, so a driver in a tunnel never loses a signature.", tr: "Alan bazında çakışma kurallarıyla SQLite üzerinde küçük bir senkron motoru; tünelde kalan sürücü hiçbir imzayı kaybetmez." },
    outcome: { en: "Sync p95 3.8 s · 0 lost deliveries in 14 months", tr: "Senkron p95 3,8 sn · 14 ayda 0 kayıp teslimat" },
    href: "https://example.com/deniz/offline-sync",
    tags: ["React Native", "SQLite"],
  },
  {
    id: "is-gunu",
    title: { en: "is-gunu — Turkish business days", tr: "is-gunu — Türkiye iş günleri" },
    year: "2021–",
    text: { en: "An open-source TypeScript library for Turkish public holidays, half days and business-day maths. 1.2 kB, no dependencies.", tr: "Türkiye resmî tatilleri, yarım günler ve iş günü hesapları için açık kaynak bir TypeScript kütüphanesi. 1,2 kB, bağımlılık yok." },
    outcome: { en: "1,240 stars · 38k weekly downloads", tr: "1.240 yıldız · haftalık 38 bin indirme" },
    href: "https://github.com/example/is-gunu",
    tags: ["Open source", "TypeScript"],
  },
];

export const posts: { title: L; date: string; minutes: number; href: string }[] = [
  { title: { en: "Shadow invoices: how we changed every price without a single angry email", tr: "Gölge faturalar: tek bir öfkeli e-posta almadan tüm fiyatları nasıl değiştirdik" }, date: "2026-09-18", minutes: 11, href: "https://example.com/deniz/writing/shadow-invoices" },
  { title: { en: "Write the permission sentence first", tr: "Önce yetki cümlesini yazın" }, date: "2026-04-02", minutes: 6, href: "https://example.com/deniz/writing/permission-sentence" },
  { title: { en: "Offline-first is a product decision, not a library", tr: "Çevrimdışı öncelik bir kütüphane değil, ürün kararıdır" }, date: "2025-11-20", minutes: 9, href: "https://example.com/deniz/writing/offline-first" },
  { title: { en: "The RFC template we actually use", tr: "Gerçekten kullandığımız RFC şablonu" }, date: "2025-06-07", minutes: 4, href: "https://example.com/deniz/writing/rfc-template" },
];

export const skills: { key: string; label: L; value: L }[] = [
  { key: "languages", label: { en: "Languages", tr: "Diller" }, value: { en: "TypeScript, SQL, Go; enough Rust to review it", tr: "TypeScript, SQL, Go; incelemeye yetecek kadar Rust" } },
  { key: "frontend", label: { en: "Frontend", tr: "Frontend" }, value: { en: "React, React Native, accessibility (WCAG 2.2), design systems", tr: "React, React Native, erişilebilirlik (WCAG 2.2), tasarım sistemleri" } },
  { key: "backend", label: { en: "Backend", tr: "Backend" }, value: { en: "Postgres, durable workflows, queues, billing and tax rules", tr: "Postgres, kalıcı iş akışları, kuyruklar, faturalama ve vergi kuralları" } },
  { key: "practice", label: { en: "Ways of working", tr: "Çalışma biçimi" }, value: { en: "Short RFCs, pairing with design, owning on-call for what I ship", tr: "Kısa RFC’ler, tasarımla eşli çalışma, yayına aldığımın nöbetini üstlenmek" } },
];

export const spoken: { lang: L; level: L }[] = [
  { lang: { en: "Turkish", tr: "Türkçe" }, level: { en: "native", tr: "ana dil" } },
  { lang: { en: "English", tr: "İngilizce" }, level: { en: "C2, daily at work", tr: "C2, iş hayatında her gün" } },
  { lang: { en: "German", tr: "Almanca" }, level: { en: "B1", tr: "B1" } },
];

export const education = {
  degree: { en: "BSc Computer Engineering", tr: "Bilgisayar Mühendisliği Lisans" },
  school: { en: "Anadolu Technical University, Ankara", tr: "Anadolu Teknik Üniversitesi, Ankara" },
  years: "2012–2016",
  note: { en: "Thesis: conflict-free replicated data for field apps", tr: "Tez: saha uygulamaları için çakışmasız çoğaltılmış veri" },
};

export const talks: { title: L; event: string; date: string }[] = [
  { title: { en: "Shadow invoices", tr: "Gölge faturalar" }, event: "Product Night Kadıköy #48", date: "2026-10-09" },
  { title: { en: "Sync in a tunnel", tr: "Tünelde senkron" }, event: "Field Apps Day, Izmir", date: "2023-05-13" },
];
