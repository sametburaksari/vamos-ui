// Sample content for "Atlas Academy", a fictional school running a part-time data analysis course.
// Every human-readable field is `Localized` ({ en, tr }) and resolved with `pickLocale`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

/** Mustard; SiteShell derives the fill, the text on it and the accent ink (contrast-checked). */
export const ACCENT = "#CA8A04";
export const PHONE = "+902160000000";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const currency = locale === "tr" ? "TRY" : "USD";
  const base = createFormatter(intl, { timeZone: "Europe/Istanbul", currency });
  /** Whole-unit prices ("$1,290", "₺44.900"). */
  const f = { ...base, currency: (value: string, code: string = currency) => base.currency(value, { currency: code, display: "narrowSymbol" }, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) };
  return {
    t,
    intl,
    f,
    currency,
    img: <I extends { alt: L }>(image: I) => ({ ...image, alt: t(image.alt) }),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
    /** Money in the page's one currency: `price({ USD: "1290", TRY: "44900" })`. */
    money: (p: { USD: string; TRY: string }) => ({ amount: p[currency], currency }),
  };
}

export const photos = {
  live: { ...unsplash("1556761175-5973dc0f32e7", 1600, 1067), alt: { en: "A Saturday live session: Nora at the screen, the cohort on sofas with laptops", tr: "Cumartesi canlı dersi: Nora ekranın başında, grup laptoplarıyla kanepelerde" } },
  review: { ...unsplash("1551434678-e076c223a692", 1600, 1067), alt: { en: "A mentor and a student going through a notebook side by side", tr: "Bir mentor ve bir öğrenci yan yana bir defteri inceliyor" } },
  group: { ...unsplash("1522202176988-66273c2fd55f", 1600, 1067), alt: { en: "Three students comparing queries around a wooden table", tr: "Ahşap bir masa etrafında sorgularını karşılaştıran üç öğrenci" } },
  chart: { ...unsplash("1543286386-713bdd548da4", 1600, 1067), alt: { en: "A hand-drawn line chart on paper beside a ruler and pen", tr: "Cetvel ve kalemin yanında kâğıda elle çizilmiş bir çizgi grafik" } },
  instructor: { ...unsplash("1573497019940-1c28c88b4f3e", 900, 1125), alt: { en: "Nora Aksoy, smiling, in a striped cardigan", tr: "Çizgili hırkasıyla gülümseyen Nora Aksoy" } },
  emre: { ...unsplash("1557862921-37829c790f19", 900, 1125), alt: { en: "Emre Sayın with arms folded, in a grey T-shirt", tr: "Gri tişörtüyle kollarını kavuşturmuş Emre Sayın" } },
  ama: { ...unsplash("1531123897727-8f129e1688ce", 900, 1125), alt: { en: "Ama Boateng in a white collared shirt", tr: "Beyaz yakalı gömleğiyle Ama Boateng" } },
};

// ---------------------------------------------------------------- curriculum

export type LessonKind = "video" | "lab" | "review" | "project";

export interface Lesson {
  title: L;
  /** Lesson length in minutes (video or guided lab). */
  minutes: number;
  kind: LessonKind;
}

export interface Module {
  code: string;
  title: L;
  outcome: L;
  lessons: Lesson[];
}

/** Hours of study per lesson-hour: watch or do it, then practise and write it up. */
export const STUDY_FACTOR = 3;

export const kindLabel: Record<LessonKind, L> = {
  video: { en: "Lesson", tr: "Ders" },
  lab: { en: "Lab", tr: "Uygulama" },
  review: { en: "Review", tr: "Değerlendirme" },
  project: { en: "Project", tr: "Proje" },
};

const ls = (en: string, tr: string, minutes: number, kind: LessonKind = "video"): Lesson => ({ title: { en, tr }, minutes, kind });

export const modules: Module[] = [
  {
    code: "01",
    title: { en: "Asking a good question", tr: "İyi soru sormak" },
    outcome: { en: "turn a vague request into a question with one metric and a deadline", tr: "belirsiz bir talebi tek metrikli ve tarihli bir soruya çevirmek" },
    lessons: [ls("What a business question looks like", "İş sorusu neye benzer", 18), ls("From question to metric", "Sorudan metriğe", 22), ls("Rewrite five vague requests", "Beş belirsiz talebi yeniden yazın", 35, "lab"), ls("Your analysis brief", "Analiz özetiniz", 25, "project")],
  },
  {
    code: "02",
    title: { en: "Spreadsheets, seriously", tr: "Ciddi tablolar" },
    outcome: { en: "clean a messy export and answer it with one pivot table", tr: "dağınık bir dışa aktarımı temizleyip tek bir pivot tabloyla yanıtlamak" },
    lessons: [ls("Clean tables, tidy columns", "Temiz tablolar, düzenli sütunlar", 24), ls("Lookups without tears", "Gözyaşsız arama formülleri", 28), ls("Pivot tables that answer something", "Bir şeyi yanıtlayan pivot tablolar", 31), ls("A month of courier deliveries", "Bir aylık kurye teslimatı", 45, "lab")],
  },
  {
    code: "03",
    title: { en: "SQL foundations", tr: "SQL temelleri" },
    outcome: { en: "pull, filter and summarise any table without asking an engineer", tr: "bir mühendise sormadan her tabloyu çekmek, süzmek ve özetlemek" },
    lessons: [ls("SELECT, WHERE, ORDER BY", "SELECT, WHERE, ORDER BY", 26), ls("Aggregations and GROUP BY", "Toplamalar ve GROUP BY", 30), ls("Dates and time zones", "Tarihler ve saat dilimleri", 22), ls("Forty questions, one database", "Kırk soru, tek veritabanı", 60, "lab")],
  },
  {
    code: "04",
    title: { en: "Joins and window functions", tr: "Birleştirmeler ve pencere fonksiyonları" },
    outcome: { en: "build a retention table from raw events in a single query", tr: "ham olaylardan tek sorguda bir elde tutma tablosu kurmak" },
    lessons: [ls("Joins, drawn on paper first", "Önce kâğıtta çizilen birleştirmeler", 34), ls("Window functions", "Pencere fonksiyonları", 38), ls("Cohorts and retention in SQL", "SQL ile kohort ve elde tutma", 36), ls("The churn query", "Kayıp sorgusu", 55, "lab"), ls("Mentor review #1", "Mentor değerlendirmesi #1", 30, "review")],
  },
  {
    code: "05",
    title: { en: "Python and pandas", tr: "Python ve pandas" },
    outcome: { en: "clean and reshape 180,000 rows in a notebook someone else can rerun", tr: "180.000 satırı başkasının yeniden çalıştırabileceği bir defterde temizlemek" },
    lessons: [ls("Notebooks, not scripts", "Betik değil, defter", 20), ls("DataFrames in an afternoon", "Bir öğleden sonrada DataFrame", 40), ls("Reshaping: melt, pivot, merge", "Yeniden biçimlendirme: melt, pivot, merge", 35), ls("Cleaning 180,000 rows", "180.000 satırı temizlemek", 70, "lab")],
  },
  {
    code: "06",
    title: { en: "Statistics you will use", tr: "Kullanacağınız istatistik" },
    outcome: { en: "say whether a change worked, and how sure you are, in one sentence", tr: "bir değişikliğin işe yarayıp yaramadığını ve ne kadar emin olduğunuzu tek cümleyle söylemek" },
    lessons: [ls("Averages that lie", "Yalan söyleyen ortalamalar", 25), ls("Distributions and outliers", "Dağılımlar ve aykırı değerler", 30), ls("A/B tests without p-hacking", "p-hacking olmadan A/B testleri", 42), ls("Did the new checkout work?", "Yeni ödeme adımı işe yaradı mı?", 50, "lab")],
  },
  {
    code: "07",
    title: { en: "Charts and the story", tr: "Grafikler ve hikâye" },
    outcome: { en: "make one chart that a manager understands in five seconds", tr: "bir yöneticinin beş saniyede anlayacağı tek bir grafik yapmak" },
    lessons: [ls("Choosing the chart", "Grafiği seçmek", 24), ls("Colour, labels and the one point", "Renk, etiketler ve tek mesaj", 28), ls("Dashboards people open twice", "İki kez açılan paneller", 32), ls("Redesign a bad dashboard", "Kötü bir paneli yeniden tasarlayın", 45, "lab"), ls("Mentor review #2", "Mentor değerlendirmesi #2", 30, "review")],
  },
  {
    code: "08",
    title: { en: "Capstone", tr: "Bitirme projesi" },
    outcome: { en: "present a full analysis of real data in seven minutes, with a recommendation", tr: "gerçek veriyle tam bir analizi bir öneriyle birlikte yedi dakikada sunmak" },
    lessons: [ls("Pick a dataset and a question", "Bir veri seti ve bir soru seçin", 20), ls("Build the analysis", "Analizi kurun", 240, "project"), ls("Present in seven minutes", "Yedi dakikada sunun", 45, "project")],
  },
];

export const totals = (() => {
  const lessons = modules.flatMap((m) => m.lessons);
  const minutes = lessons.reduce((s, l) => s + l.minutes, 0);
  return { modules: modules.length, lessons: lessons.length, minutes, studyHours: (minutes * STUDY_FACTOR) / 60, labs: lessons.filter((l) => l.kind === "lab").length };
})();

// ---------------------------------------------------------------- cohorts

export interface Cohort {
  id: "winter" | "spring" | "summer";
  name: L;
  start: string;
  end: string;
  seats: number;
  taken: number;
  /** Live sessions in the first weeks (`YYYY-MM-DD`): Tuesdays 19:30 and Saturdays 11:00, Istanbul time. */
  live: string[];
}

/** Tuesdays and Saturdays for `weeks` weeks from a Monday start. */
function liveDays(startMonday: string, weeks: number): string[] {
  const [y, m, d] = startMonday.split("-").map(Number) as [number, number, number];
  const out: string[] = [];
  for (let w = 0; w < weeks; w++) {
    for (const offset of [1, 5]) {
      const day = new Date(Date.UTC(y, m - 1, d + w * 7 + offset));
      out.push(day.toISOString().slice(0, 10));
    }
  }
  return out;
}

export const cohorts: Cohort[] = [
  { id: "winter", name: { en: "Winter cohort", tr: "Kış dönemi" }, start: "2027-01-18", end: "2027-04-11", seats: 24, taken: 10, live: liveDays("2027-01-18", 12) },
  { id: "spring", name: { en: "Spring cohort", tr: "Bahar dönemi" }, start: "2027-03-15", end: "2027-06-06", seats: 24, taken: 2, live: liveDays("2027-03-15", 12) },
  { id: "summer", name: { en: "Summer cohort", tr: "Yaz dönemi" }, start: "2027-05-10", end: "2027-08-01", seats: 24, taken: 0, live: liveDays("2027-05-10", 12) },
];

export const PRICES = {
  selfPaced: { USD: "490", TRY: "16900" },
  cohort: { USD: "1290", TRY: "44900" },
  instalment: { USD: "450", TRY: "15600" },
};

// ---------------------------------------------------------------- projects

export const projects = [
  {
    title: { en: "Why are Thursday deliveries late?", tr: "Perşembe teslimatları neden gecikiyor?" },
    who: { en: "Defne K., logistics coordinator → junior analyst", tr: "Defne K., lojistik koordinatörü → kıdemsiz analist" },
    tools: "SQL · Sheets",
    rows: "62,400",
    finding: { en: "Late deliveries cluster on one depot’s second shift; moving 40 parcels to the morning run cut delays by 23%.", tr: "Gecikmeler tek bir deponun ikinci vardiyasında toplanıyor; 40 paketi sabah turuna almak gecikmeleri %23 azalttı." },
    series: [12, 14, 13, 18, 22, 21, 26, 19, 15, 13, 12, 11],
  },
  {
    title: { en: "Which trial users stay?", tr: "Hangi deneme kullanıcıları kalıyor?" },
    who: { en: "Kerem A., customer support lead", tr: "Kerem A., müşteri destek sorumlusu" },
    tools: "SQL · pandas",
    rows: "188,000",
    finding: { en: "Users who invite one teammate in week one retain at 3.1× the rate; the onboarding email now asks for it.", tr: "İlk hafta bir ekip arkadaşını davet eden kullanıcılar 3,1 kat daha fazla kalıyor; karşılama e-postası artık bunu istiyor." },
    series: [40, 36, 31, 29, 27, 26, 26, 25, 25, 24, 24, 24],
  },
  {
    title: { en: "Is the library busier after the redesign?", tr: "Yenilemeden sonra kütüphane daha mı kalabalık?" },
    who: { en: "Zehra T., municipal planner", tr: "Zehra T., belediye planlamacısı" },
    tools: "pandas · charts",
    rows: "9,800",
    finding: { en: "Visits rose 11%, but only on weekday evenings; weekend numbers are within normal variation.", tr: "Ziyaretler %11 arttı, ama yalnızca hafta içi akşamları; hafta sonu rakamları olağan dalgalanma içinde." },
    series: [21, 20, 22, 21, 23, 22, 25, 26, 25, 27, 26, 28],
  },
];
