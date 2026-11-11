// Sample content for the careers site of "Northpoint", the fictional operations workspace used
// across the Vamos UI blocks (Northpoint Studio Ltd., Kadıköy, Istanbul). Every human-readable
// field is `Localized` ({ en, tr }). Salaries are yearly gross bands in euros — Northpoint pays
// everyone in euros, wherever they live. Dates are `YYYY-MM-DD`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Fictional contact data only. */
export const PHONE = "+902160000000";
export const EMAIL = "careers@northpoint.example.com";
/** "Today" for the sample data, so posted dates read the same on every build. */
export const TODAY = "2026-11-11";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "EUR", timeZone: "Europe/Istanbul" });
  /** "€62k" — compact salary figures. */
  const k = (n: number) => f.currency(n, "EUR", { notation: "compact", maximumFractionDigits: 0 });
  const band = (b: [number, number]) => `${k(b[0])}–${k(b[1])}`;
  return {
    t,
    f,
    k,
    band,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  office: { ...unsplash("1497366811353-6870744d04b2", 1600, 1100), alt: { en: "The Kadıköy office: long shared desks under tall windows", tr: "Kadıköy ofisi: yüksek pencerelerin altında uzun ortak masalar" } as L },
  review: { ...unsplash("1522071820081-009f0129c71c", 1400, 1000), alt: { en: "Four colleagues reviewing a release plan on a laptop", tr: "Bir dizüstünde yayın planını inceleyen dört çalışma arkadaşı" } as L },
  whiteboard: { ...unsplash("1531403009284-440f080d1e12", 1400, 1000), alt: { en: "Sticky notes and a hand-drawn flow on a whiteboard", tr: "Beyaz tahtada yapışkan notlar ve elle çizilmiş bir akış" } as L },
};

/* ------------------------------------------------------------------ */
/* Teams, places and roles                                             */
/* ------------------------------------------------------------------ */

export type TeamId = "engineering" | "design" | "data" | "customer" | "people";
export type PlaceId = "istanbul" | "izmir" | "remote";
export type KindId = "full-time" | "part-time" | "internship";

export const teams: { id: TeamId; name: L; lead: string; size: number; bearing: number; brief: L }[] = [
  { id: "engineering", name: { en: "Product engineering", tr: "Ürün mühendisliği" }, lead: "Kerem Aksoy", size: 31, bearing: 12, brief: { en: "Web app, mobile apps and the sync engine behind both.", tr: "Web uygulaması, mobil uygulamalar ve ikisinin arkasındaki senkron motoru." } },
  { id: "design", name: { en: "Design", tr: "Tasarım" }, lead: "Ilgın Sever", size: 9, bearing: 84, brief: { en: "Product design, research and the Northpoint design system.", tr: "Ürün tasarımı, araştırma ve Northpoint tasarım sistemi." } },
  { id: "data", name: { en: "Data & reporting", tr: "Veri ve raporlama" }, lead: "Theo Lindqvist", size: 7, bearing: 151, brief: { en: "Warehouse, the reports customers open every Monday, forecasting.", tr: "Veri ambarı, müşterilerin her pazartesi açtığı raporlar, tahminleme." } },
  { id: "customer", name: { en: "Customer", tr: "Müşteri" }, lead: "Elif Ünal", size: 22, bearing: 233, brief: { en: "Onboarding, support in three languages and account management.", tr: "Kurulum, üç dilde destek ve müşteri yönetimi." } },
  { id: "people", name: { en: "People & finance", tr: "İnsan ve finans" }, lead: "Hande Yalçın", size: 6, bearing: 302, brief: { en: "Hiring, payroll in 11 countries, the office and the books.", tr: "İşe alım, 11 ülkede bordro, ofis ve muhasebe." } },
];

export const places: Record<PlaceId, { name: L; note: L }> = {
  istanbul: { name: { en: "Istanbul · hybrid", tr: "İstanbul · hibrit" }, note: { en: "Kadıköy office, Tue–Thu", tr: "Kadıköy ofisi, Salı–Perşembe" } },
  izmir: { name: { en: "Izmir · hybrid", tr: "İzmir · hibrit" }, note: { en: "Alsancak desk space, 2 days", tr: "Alsancak ortak ofis, haftada 2 gün" } },
  remote: { name: { en: "Remote · Europe", tr: "Uzaktan · Avrupa" }, note: { en: "UTC−1 to UTC+4", tr: "UTC−1 ile UTC+4 arası" } },
};

export const kinds: Record<KindId, L> = {
  "full-time": { en: "Full-time", tr: "Tam zamanlı" },
  "part-time": { en: "Part-time · 3 days", tr: "Yarı zamanlı · 3 gün" },
  internship: { en: "Internship · 6 months", tr: "Staj · 6 ay" },
};

export interface Job {
  id: string;
  ref: string;
  title: L;
  team: TeamId;
  level: L;
  places: PlaceId[];
  kind: KindId;
  /** Yearly gross, EUR. */
  salary: [number, number];
  posted: string;
  closes: string;
  hiringManager: string;
  summary: L;
  doing: L[];
  need: L[];
  nice: L[];
}

export const jobs: Job[] = [
  {
    id: "senior-frontend",
    ref: "NP-ENG-041",
    title: { en: "Senior Frontend Engineer, Scheduling", tr: "Kıdemli Frontend Mühendisi, Planlama" },
    team: "engineering",
    level: { en: "Senior", tr: "Kıdemli" },
    places: ["istanbul", "remote"],
    kind: "full-time",
    salary: [62000, 78000],
    posted: "2026-11-04",
    closes: "2026-12-06",
    hiringManager: "Kerem Aksoy",
    summary: {
      en: "Own the week view that 2,400 sites plan their shifts in. It has to stay fast with 600 people on screen, work offline on a tablet in a back office, and still feel calm.",
      tr: "2.400 şubenin vardiyalarını planladığı hafta görünümünün sahibi olun. Ekranda 600 kişiyle hızlı kalmalı, arka ofisteki bir tablette çevrimdışı çalışmalı ve yine de sakin hissettirmeli.",
    },
    doing: [
      { en: "Rebuild drag-to-assign on the week grid with virtualised rows and keyboard support", tr: "Hafta tablosunda sürükle-ata özelliğini sanal satırlar ve klavye desteğiyle yeniden yazmak" },
      { en: "Pair with design on the conflict warnings managers see before publishing a rota", tr: "Yöneticilerin vardiya planını yayınlamadan önce gördüğü çakışma uyarılarında tasarımla birlikte çalışmak" },
      { en: "Set the performance budget for the scheduling module and keep it", tr: "Planlama modülünün performans bütçesini belirleyip korumak" },
    ],
    need: [
      { en: "6+ years building web apps in TypeScript and React", tr: "TypeScript ve React ile 6+ yıl web uygulaması geliştirme" },
      { en: "You have shipped a complex interactive view (calendar, editor, board) to real users", tr: "Gerçek kullanıcılara karmaşık bir etkileşimli görünüm (takvim, editör, pano) yayınlamış olmak" },
      { en: "Comfortable writing in English; most decisions happen in written docs", tr: "İngilizce yazmakta rahat olmak; kararların çoğu yazılı dokümanlarda alınır" },
    ],
    nice: [
      { en: "Experience with offline-first sync or CRDTs", tr: "Çevrimdışı öncelikli senkron ya da CRDT deneyimi" },
      { en: "You have worked on accessibility audits", tr: "Erişilebilirlik denetimlerinde çalışmış olmak" },
    ],
  },
  {
    id: "backend-sync",
    ref: "NP-ENG-044",
    title: { en: "Backend Engineer, Sync Engine", tr: "Backend Mühendisi, Senkron Motoru" },
    team: "engineering",
    level: { en: "Mid–Senior", tr: "Orta–Kıdemli" },
    places: ["remote", "istanbul", "izmir"],
    kind: "full-time",
    salary: [54000, 72000],
    posted: "2026-10-28",
    closes: "2026-11-30",
    hiringManager: "Defne Kurt",
    summary: {
      en: "The sync engine moves 40 million changes a day between phones, tablets and the web app. Help us make conflicts rarer and recoveries boring.",
      tr: "Senkron motoru telefonlar, tabletler ve web uygulaması arasında günde 40 milyon değişiklik taşır. Çakışmaları azaltmamıza ve kurtarmaları sıradanlaştırmamıza yardım edin.",
    },
    doing: [
      { en: "Move change logs from Postgres triggers to a partitioned event table", tr: "Değişiklik kayıtlarını Postgres tetikleyicilerinden bölümlenmiş bir olay tablosuna taşımak" },
      { en: "Write the runbook for the next region (Frankfurt → Stockholm)", tr: "Bir sonraki bölge için (Frankfurt → Stockholm) operasyon kılavuzunu yazmak" },
      { en: "Be on call one week in six, with a day off after", tr: "Altı haftada bir hafta nöbet tutmak, ardından bir gün izin" },
    ],
    need: [
      { en: "4+ years with Go, Kotlin or TypeScript on the server", tr: "Sunucu tarafında Go, Kotlin ya da TypeScript ile 4+ yıl" },
      { en: "Postgres beyond the ORM: query plans, locks, migrations under load", tr: "ORM’nin ötesinde Postgres: sorgu planları, kilitler, yük altında migration" },
      { en: "You have debugged a distributed system from logs alone", tr: "Dağıtık bir sistemi yalnızca loglardan hata ayıklamış olmak" },
    ],
    nice: [{ en: "Familiarity with logical replication", tr: "Mantıksal replikasyon bilgisi" }],
  },
  {
    id: "mobile-engineer",
    ref: "NP-ENG-046",
    title: { en: "Mobile Engineer (React Native)", tr: "Mobil Mühendis (React Native)" },
    team: "engineering",
    level: { en: "Mid", tr: "Orta" },
    places: ["istanbul", "izmir"],
    kind: "full-time",
    salary: [44000, 58000],
    posted: "2026-11-09",
    closes: "2026-12-13",
    hiringManager: "Kerem Aksoy",
    summary: {
      en: "Field staff clock in, swap shifts and read the day’s notes on our phone app. Make it the one work app people don’t complain about.",
      tr: "Saha ekipleri giriş yapar, vardiya değiştirir ve günün notlarını telefon uygulamamızda okur. Onu insanların şikâyet etmediği tek iş uygulaması yapın.",
    },
    doing: [
      { en: "Ship the new clock-in flow with location checks that respect privacy settings", tr: "Gizlilik ayarlarına saygılı konum kontrolleriyle yeni giriş akışını yayınlamak" },
      { en: "Cut cold start on mid-range Android phones below 1.5 seconds", tr: "Orta seviye Android telefonlarda soğuk açılışı 1,5 saniyenin altına indirmek" },
    ],
    need: [
      { en: "3+ years of React Native with apps in both stores", tr: "Her iki mağazada uygulaması olan 3+ yıl React Native" },
      { en: "You test on real, slow devices — not only the simulator", tr: "Yalnızca simülatörde değil, gerçek ve yavaş cihazlarda test etmek" },
    ],
    nice: [{ en: "Some native Swift or Kotlin", tr: "Biraz yerel Swift ya da Kotlin" }],
  },
  {
    id: "eng-intern",
    ref: "NP-ENG-048",
    title: { en: "Engineering Intern, Spring 2027", tr: "Mühendislik Stajyeri, Bahar 2027" },
    team: "engineering",
    level: { en: "Intern", tr: "Stajyer" },
    places: ["istanbul"],
    kind: "internship",
    salary: [16800, 16800],
    posted: "2026-11-02",
    closes: "2027-01-10",
    hiringManager: "Defne Kurt",
    summary: {
      en: "Six paid months on a real team, from February to July 2027. You get a mentor, a laptop and one project that ships before you leave.",
      tr: "Şubat–Temmuz 2027 arasında gerçek bir ekipte altı ücretli ay. Bir mentor, bir dizüstü ve ayrılmadan yayına çıkan bir proje.",
    },
    doing: [
      { en: "Pick one of three scoped projects in week one", tr: "İlk hafta kapsamı belli üç projeden birini seçmek" },
      { en: "Present what you built at the July all-hands", tr: "Yaptığınızı temmuz genel toplantısında sunmak" },
    ],
    need: [
      { en: "Final-year student or recent graduate in any field — show us something you built", tr: "Herhangi bir bölümde son sınıf öğrencisi ya da yeni mezun — yaptığınız bir şeyi gösterin" },
      { en: "Available four days a week in Kadıköy", tr: "Haftada dört gün Kadıköy’de bulunabilmek" },
    ],
    nice: [],
  },
  {
    id: "product-designer",
    ref: "NP-DES-012",
    title: { en: "Senior Product Designer, Mobile", tr: "Kıdemli Ürün Tasarımcısı, Mobil" },
    team: "design",
    level: { en: "Senior", tr: "Kıdemli" },
    places: ["istanbul", "remote"],
    kind: "full-time",
    salary: [56000, 70000],
    posted: "2026-10-21",
    closes: "2026-11-29",
    hiringManager: "Ilgın Sever",
    summary: {
      en: "Most of our users have never chosen software for themselves. Design for a cashier on a cracked screen at 06:40, and for the manager who reads the same data at night.",
      tr: "Kullanıcılarımızın çoğu kendileri için hiç yazılım seçmedi. 06.40’ta çatlak ekranlı bir kasiyer ve aynı veriyi gece okuyan yönetici için tasarlayın.",
    },
    doing: [
      { en: "Lead design for the field app with one PM and four engineers", tr: "Bir ürün yöneticisi ve dört mühendisle saha uygulamasının tasarımını yönetmek" },
      { en: "Run two site visits a month — warehouses, clinics, shop floors", tr: "Ayda iki saha ziyareti yapmak — depolar, klinikler, mağaza katları" },
      { en: "Contribute patterns back to the design system", tr: "Desenleri tasarım sistemine geri kazandırmak" },
    ],
    need: [
      { en: "A portfolio with shipped mobile work and the reasoning behind it", tr: "Yayınlanmış mobil işler ve arkasındaki gerekçeleri içeren bir portfolyo" },
      { en: "You prototype in code or in high-fidelity tools — your choice", tr: "Kodla ya da yüksek doğrulukta araçlarla prototip yapmak — seçim sizin" },
    ],
    nice: [{ en: "Turkish and English, for interviews with users", tr: "Kullanıcı görüşmeleri için Türkçe ve İngilizce" }],
  },
  {
    id: "ux-researcher",
    ref: "NP-DES-013",
    title: { en: "UX Researcher", tr: "UX Araştırmacısı" },
    team: "design",
    level: { en: "Mid", tr: "Orta" },
    places: ["istanbul"],
    kind: "part-time",
    salary: [26000, 32000],
    posted: "2026-11-06",
    closes: "2026-12-20",
    hiringManager: "Ilgın Sever",
    summary: {
      en: "Three days a week. Turn 180 support tickets a day and a dozen site visits a month into decisions the product team can act on.",
      tr: "Haftada üç gün. Günde 180 destek talebini ve ayda bir düzine saha ziyaretini ürün ekibinin uygulayabileceği kararlara dönüştürün.",
    },
    doing: [
      { en: "Set up a standing panel of 40 managers across sectors", tr: "Sektörler arası 40 yöneticiden oluşan kalıcı bir panel kurmak" },
      { en: "Publish a short findings note every second Friday", tr: "İki haftada bir cuma kısa bir bulgu notu yayınlamak" },
    ],
    need: [
      { en: "2+ years of qualitative research in a product team", tr: "Bir ürün ekibinde 2+ yıl nitel araştırma" },
      { en: "Fluent Turkish — most sessions are in Turkish", tr: "Akıcı Türkçe — oturumların çoğu Türkçe" },
    ],
    nice: [{ en: "Survey design and basic statistics", tr: "Anket tasarımı ve temel istatistik" }],
  },
  {
    id: "analytics-engineer",
    ref: "NP-DAT-007",
    title: { en: "Analytics Engineer", tr: "Analitik Mühendisi" },
    team: "data",
    level: { en: "Mid–Senior", tr: "Orta–Kıdemli" },
    places: ["remote", "istanbul"],
    kind: "full-time",
    salary: [50000, 66000],
    posted: "2026-10-30",
    closes: "2026-12-04",
    hiringManager: "Theo Lindqvist",
    summary: {
      en: "Our Monday report is the most-opened screen in the product. Own the models behind it and the definitions everyone argues about.",
      tr: "Pazartesi raporumuz üründe en çok açılan ekran. Arkasındaki modellerin ve herkesin tartıştığı tanımların sahibi olun.",
    },
    doing: [
      { en: "Rewrite labour-cost models so they reconcile with payroll to the cent", tr: "İşçilik maliyeti modellerini bordroyla kuruşu kuruşuna tutacak şekilde yeniden yazmak" },
      { en: "Document every metric that appears in a customer report", tr: "Müşteri raporunda görünen her metriği belgelemek" },
    ],
    need: [
      { en: "Strong SQL and a modelling tool you can defend", tr: "Güçlü SQL ve savunabileceğiniz bir modelleme aracı" },
      { en: "You have said no to a metric and explained why", tr: "Bir metriğe hayır deyip nedenini açıklamış olmak" },
    ],
    nice: [{ en: "Python for forecasting", tr: "Tahminleme için Python" }],
  },
  {
    id: "support-lead",
    ref: "NP-CUS-019",
    title: { en: "Support Team Lead, EMEA", tr: "Destek Ekip Lideri, EMEA" },
    team: "customer",
    level: { en: "Lead", tr: "Lider" },
    places: ["istanbul", "izmir"],
    kind: "full-time",
    salary: [38000, 48000],
    posted: "2026-11-01",
    closes: "2026-12-01",
    hiringManager: "Elif Ünal",
    summary: {
      en: "Lead nine support specialists who answer in Turkish, English and German. Median first reply today: 14 minutes. Keep it there while we double.",
      tr: "Türkçe, İngilizce ve Almanca yanıt veren dokuz destek uzmanına liderlik edin. Bugünkü ortanca ilk yanıt: 14 dakika. Biz ikiye katlanırken orada tutun.",
    },
    doing: [
      { en: "Plan coverage from 07:00 to 22:00 on weekdays and 09:00 to 18:00 on Saturdays", tr: "Hafta içi 07.00–22.00 ve cumartesi 09.00–18.00 arası kapsamayı planlamak" },
      { en: "Coach weekly, review tickets with the team, hire two people in Q1", tr: "Haftalık koçluk, ekiple talepleri gözden geçirmek, 1. çeyrekte iki kişiyi işe almak" },
    ],
    need: [
      { en: "2+ years leading a support or service team", tr: "Destek ya da hizmet ekibinde 2+ yıl liderlik" },
      { en: "Turkish and English at work level", tr: "İş düzeyinde Türkçe ve İngilizce" },
    ],
    nice: [{ en: "German", tr: "Almanca" }],
  },
  {
    id: "onboarding-specialist",
    ref: "NP-CUS-021",
    title: { en: "Onboarding Specialist", tr: "Kurulum Uzmanı" },
    team: "customer",
    level: { en: "Mid", tr: "Orta" },
    places: ["remote"],
    kind: "full-time",
    salary: [32000, 40000],
    posted: "2026-11-10",
    closes: "2026-12-15",
    hiringManager: "Elif Ünal",
    summary: {
      en: "Take a new customer from signed contract to their first published rota in 21 days. You will run about six onboardings at a time, mostly on video.",
      tr: "Yeni bir müşteriyi imzalı sözleşmeden ilk yayınlanmış vardiya planına 21 günde taşıyın. Aynı anda yaklaşık altı kurulum yürütürsünüz, çoğu görüntülü.",
    },
    doing: [
      { en: "Import staff lists, opening hours and pay rules with the customer", tr: "Personel listelerini, çalışma saatlerini ve ücret kurallarını müşteriyle içeri aktarmak" },
      { en: "Train managers in groups of up to eight", tr: "Yöneticileri en fazla sekiz kişilik gruplar hâlinde eğitmek" },
    ],
    need: [
      { en: "Experience onboarding B2B customers or running implementations", tr: "B2B müşteri kurulumu ya da uygulama projesi deneyimi" },
      { en: "Calm on video with a room of tired managers", tr: "Yorgun yöneticilerle dolu bir odada görüntülü görüşmede sakin kalmak" },
    ],
    nice: [{ en: "Spreadsheet skills that impress accountants", tr: "Muhasebecileri etkileyecek tablo becerileri" }],
  },
  {
    id: "people-partner",
    ref: "NP-PEO-004",
    title: { en: "People Partner", tr: "İnsan Kaynakları İş Ortağı" },
    team: "people",
    level: { en: "Senior", tr: "Kıdemli" },
    places: ["istanbul"],
    kind: "full-time",
    salary: [40000, 50000],
    posted: "2026-10-24",
    closes: "2026-11-24",
    hiringManager: "Hande Yalçın",
    summary: {
      en: "We are 75 people in 11 countries and hire about 25 more next year. Keep reviews fair, salary bands honest and onboarding something people mention later.",
      tr: "11 ülkede 75 kişiyiz ve gelecek yıl yaklaşık 25 kişi daha alacağız. Değerlendirmeleri adil, maaş bantlarını dürüst ve işe başlangıcı insanların sonradan andığı bir deneyim tutun.",
    },
    doing: [
      { en: "Run the twice-yearly band review with team leads", tr: "Yılda iki kez yapılan bant değerlendirmesini ekip liderleriyle yürütmek" },
      { en: "Own the onboarding fortnight and the leaver interview", tr: "İki haftalık işe başlangıç sürecinin ve ayrılış görüşmesinin sahibi olmak" },
    ],
    need: [
      { en: "5+ years in HR or people roles in a growing company", tr: "Büyüyen bir şirkette İK alanında 5+ yıl" },
      { en: "Working knowledge of Turkish labour law", tr: "Türk iş hukukunda çalışma düzeyinde bilgi" },
    ],
    nice: [{ en: "Experience with employer-of-record setups", tr: "Kayıtlı işveren (EOR) yapıları deneyimi" }],
  },
];

/* ------------------------------------------------------------------ */
/* Home content                                                        */
/* ------------------------------------------------------------------ */

export const principles: { n: string; title: L; text: L }[] = [
  { n: "01", title: { en: "Write it down", tr: "Yazıya dökün" }, text: { en: "Decisions live in short docs with a name and a date on them. Meetings are for the parts writing can’t do.", tr: "Kararlar üzerinde isim ve tarih olan kısa dokümanlarda yaşar. Toplantılar yazının yapamadığı kısımlar içindir." } },
  { n: "02", title: { en: "Go and see", tr: "Gidip görün" }, text: { en: "Everyone — engineers too — spends one day a quarter at a customer site, standing behind a counter.", tr: "Herkes — mühendisler dahil — çeyrekte bir günü bir müşteride, tezgâhın arkasında geçirir." } },
  { n: "03", title: { en: "Small teams, whole problems", tr: "Küçük ekipler, bütün problemler" }, text: { en: "Teams of four to six own a problem end to end, including the support tickets it creates.", tr: "Dört ila altı kişilik ekipler bir problemin baştan sona sahibidir; yarattığı destek talepleri dahil." } },
  { n: "04", title: { en: "Open numbers", tr: "Açık rakamlar" }, text: { en: "Salary bands are on every job post. Revenue, runway and churn are in the Monday note.", tr: "Maaş bantları her ilanda yazar. Gelir, nakit ömrü ve kayıp oranı pazartesi notundadır." } },
];

export const benefits: { icon: string; title: L; text: L }[] = [
  { icon: "banknote", title: { en: "Paid in euros, bands published", tr: "Euro ile ödeme, açık bantlar" }, text: { en: "The same band for the same role in Istanbul, Izmir or Lisbon. Reviewed every April and October.", tr: "Aynı rol için İstanbul, İzmir ya da Lizbon’da aynı bant. Her nisan ve ekim gözden geçirilir." } },
  { icon: "calendar", title: { en: "30 days off", tr: "30 gün izin" }, text: { en: "Plus public holidays where you live, and the week between 25 December and 1 January.", tr: "Yaşadığınız yerin resmi tatillerine ek olarak 25 Aralık–1 Ocak arası hafta." } },
  { icon: "laptop", title: { en: "€1,200 setup budget", tr: "1.200 € kurulum bütçesi" }, text: { en: "For a desk, chair and screen at home, on top of the laptop we send before day one.", tr: "Evde masa, sandalye ve ekran için; ilk günden önce gönderdiğimiz dizüstüne ek olarak." } },
  { icon: "heart-pulse", title: { en: "Private health cover", tr: "Özel sağlık sigortası" }, text: { en: "For you and your family, from the first day, in every country we hire in.", tr: "İşe aldığımız her ülkede, ilk günden itibaren sizin ve aileniz için." } },
  { icon: "baby", title: { en: "20 weeks parental leave", tr: "20 hafta ebeveyn izni" }, text: { en: "Fully paid, for every parent, taken in one block or in parts within two years.", tr: "Tam ücretli, her ebeveyn için; tek seferde ya da iki yıl içinde parça parça." } },
  { icon: "book-open", title: { en: "€800 learning budget", tr: "800 € öğrenme bütçesi" }, text: { en: "Books, courses, a conference ticket. No approval needed under €150.", tr: "Kitap, kurs, konferans bileti. 150 €’nun altında onay gerekmez." } },
];

export const process: { title: L; text: L; duration: L }[] = [
  { title: { en: "Application read by a person", tr: "Başvurunuzu bir insan okur" }, text: { en: "The hiring manager reads every application. You hear back either way.", tr: "İşe alım yöneticisi her başvuruyu okur. Sonuç ne olursa olsun haber alırsınız." }, duration: { en: "within 5 working days", tr: "5 iş günü içinde" } },
  { title: { en: "30-minute intro call", tr: "30 dakikalık tanışma" }, text: { en: "With the hiring manager: the role, the team, the band, your questions.", tr: "İşe alım yöneticisiyle: rol, ekip, bant ve sorularınız." }, duration: { en: "30 min", tr: "30 dk" } },
  { title: { en: "Work sample, paid", tr: "Ücretli iş örneği" }, text: { en: "A scoped task close to the real job, capped at four hours. We pay €200 for it.", tr: "Gerçek işe yakın, en fazla dört saatlik kapsamlı bir görev. Karşılığında 200 € öderiz." }, duration: { en: "≤ 4 h", tr: "≤ 4 sa" } },
  { title: { en: "Team conversation", tr: "Ekiple görüşme" }, text: { en: "We go through your sample together, then you meet two future teammates.", tr: "Örneğinizi birlikte inceleriz, ardından iki müstakbel ekip arkadaşınızla tanışırsınız." }, duration: { en: "90 min", tr: "90 dk" } },
  { title: { en: "Offer", tr: "Teklif" }, text: { en: "A written offer inside the published band, with references only after you say yes.", tr: "Yayınlanan bant içinde yazılı teklif; referanslar yalnızca siz evet dedikten sonra." }, duration: { en: "≈ 3 weeks in total", tr: "toplam ≈ 3 hafta" } },
];

export const voices: { quote: L; author: string; role: L }[] = [
  {
    quote: { en: "I joined from a bank. The first week I spent a morning at a bakery chain’s central kitchen watching a manager fight our rota screen. I rebuilt that screen in my third month.", tr: "Bir bankadan geldim. İlk haftamda bir sabahı bir fırın zincirinin merkez mutfağında, bir yöneticinin vardiya ekranımızla boğuşmasını izleyerek geçirdim. Üçüncü ayımda o ekranı yeniden yaptım." },
    author: "Mert Ekinci",
    role: { en: "Frontend engineer, since 2024", tr: "Frontend mühendisi, 2024’ten beri" },
  },
  {
    quote: { en: "The band was in the job post, so the offer call took ten minutes. We spent the rest of it talking about the work.", tr: "Bant ilanda yazıyordu, bu yüzden teklif görüşmesi on dakika sürdü. Kalanında işi konuştuk." },
    author: "Sofia Marques",
    role: { en: "Analytics engineer, Lisbon", tr: "Analitik mühendisi, Lizbon" },
  },
  {
    quote: { en: "I work three days a week and nobody schedules a meeting on the other two. That sounds small. It isn’t.", tr: "Haftada üç gün çalışıyorum ve kimse diğer iki güne toplantı koymuyor. Küçük bir şey gibi duruyor. Değil." },
    author: "Zeynep Arıkan",
    role: { en: "Support specialist, Izmir", tr: "Destek uzmanı, İzmir" },
  },
];

export const faq: { q: L; a: L }[] = [
  { q: { en: "Can I apply for more than one role?", tr: "Birden fazla role başvurabilir miyim?" }, a: { en: "Yes, up to two at a time. Tell us in the note which one you would pick.", tr: "Evet, aynı anda en fazla ikiye. Notta hangisini seçeceğinizi belirtin." } },
  { q: { en: "Do I need to speak Turkish?", tr: "Türkçe bilmem gerekiyor mu?" }, a: { en: "Only where the post says so. Our working language is English; about half the company speaks Turkish.", tr: "Yalnızca ilanda belirtilmişse. Çalışma dilimiz İngilizce; şirketin yaklaşık yarısı Türkçe konuşuyor." } },
  { q: { en: "Which countries can you hire in?", tr: "Hangi ülkelerde işe alım yapabiliyorsunuz?" }, a: { en: "Türkiye directly; the EU, UK, Norway and Georgia through an employer of record. Remote roles need four hours of overlap with Istanbul.", tr: "Türkiye’de doğrudan; AB, Birleşik Krallık, Norveç ve Gürcistan’da kayıtlı işveren aracılığıyla. Uzaktan roller İstanbul ile dört saat çakışma gerektirir." } },
  { q: { en: "What happens to my CV if I am not hired?", tr: "İşe alınmazsam CV’me ne olur?" }, a: { en: "We delete it after 12 months, or sooner if you ask. It is only seen by the people on the hiring panel.", tr: "12 ay sonra, ya da isterseniz daha önce sileriz. Yalnızca işe alım panelindeki kişiler görür." } },
  { q: { en: "Do you sponsor relocation?", tr: "Taşınma desteği veriyor musunuz?" }, a: { en: "For Istanbul roles, yes: up to €4,000 and two weeks of temporary housing.", tr: "İstanbul rolleri için evet: 4.000 €’ya kadar ve iki haftalık geçici konaklama." } },
];
