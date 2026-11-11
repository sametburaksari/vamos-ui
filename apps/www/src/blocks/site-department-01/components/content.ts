// Sample content for the "Department of Urban Studies" at the fictional Halden University.
// Every human-readable field is { en, tr } and resolved with `pickLocale`. Courses, people,
// rooms and dates are invented; photos are unbranded Unsplash images.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "urban@example.com";

export const DEPT: L = { en: "Department of Urban Studies", tr: "Kentsel Çalışmalar Bölümü" };
export const UNI: L = { en: "Halden University", tr: "Halden Üniversitesi" };
export const FACULTY: L = { en: "Faculty of Architecture and Planning", tr: "Mimarlık ve Planlama Fakültesi" };

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const f = createFormatter(intl, { currency: "TRY", timeZone: "Europe/Istanbul" });
  return { locale, t, f, intl, labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}
export type Copy = ReturnType<typeof copyFor>;

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=72&auto=format&fit=crop`, width: w, height: h });
const portrait = (id: string) => unsplash(id, 640, 800);

// ---------------------------------------------------------------- programmes

export type Level = "ba" | "ma" | "phd";
export const levels: Record<Level, { short: L; long: L }> = {
  ba: { short: { en: "BA", tr: "Lisans" }, long: { en: "Undergraduate", tr: "Lisans" } },
  ma: { short: { en: "MA", tr: "Y. Lisans" }, long: { en: "Master’s", tr: "Yüksek lisans" } },
  phd: { short: { en: "PhD", tr: "Doktora" }, long: { en: "Doctoral", tr: "Doktora" } },
};

export interface Programme {
  level: Level;
  title: L;
  years: L;
  language: L;
  places: number;
  deadline: string;
  text: L;
  ects: number;
}

export const programmes: Programme[] = [
  { level: "ba", title: { en: "BA Urban Studies", tr: "Kentsel Çalışmalar Lisans Programı" }, years: { en: "4 years", tr: "4 yıl" }, language: { en: "English (30% Turkish)", tr: "İngilizce (%30 Türkçe)" }, places: 62, deadline: "2027-07-24", ects: 240, text: { en: "Planning history, urban economics and two studios a year, with a summer semester in a partner city.", tr: "Planlama tarihi, kent ekonomisi ve her yıl iki stüdyo; bir yaz dönemi ortak bir kentte." } },
  { level: "ma", title: { en: "MA Urban Design and Policy", tr: "Kentsel Tasarım ve Politika Yüksek Lisansı" }, years: { en: "2 years", tr: "2 yıl" }, language: { en: "English", tr: "İngilizce" }, places: 24, deadline: "2027-04-15", ects: 120, text: { en: "For architects, planners and policy graduates; thesis or a live project with a municipality.", tr: "Mimar, plancı ve politika mezunları için; tez ya da bir belediyeyle canlı proje." } },
  { level: "phd", title: { en: "PhD Urban Studies", tr: "Kentsel Çalışmalar Doktora Programı" }, years: { en: "4–5 years", tr: "4–5 yıl" }, language: { en: "English or Turkish", tr: "İngilizce ya da Türkçe" }, places: 6, deadline: "2027-03-01", ects: 240, text: { en: "Funded places in three research groups; teaching assistantship from year two.", tr: "Üç araştırma grubunda burslu kontenjan; ikinci yıldan itibaren araştırma görevliliği." } },
];

// ---------------------------------------------------------------- courses (the finder)

export type Term = "autumn" | "spring";
export type Format = "studio" | "seminar" | "lecture" | "fieldwork";
export type Lang = "en" | "tr";

export const terms: Record<Term, L> = { autumn: { en: "Autumn", tr: "Güz" }, spring: { en: "Spring", tr: "Bahar" } };
export const formats: Record<Format, L> = {
  studio: { en: "Studio", tr: "Stüdyo" },
  seminar: { en: "Seminar", tr: "Seminer" },
  lecture: { en: "Lecture", tr: "Ders" },
  fieldwork: { en: "Fieldwork", tr: "Saha çalışması" },
};

export interface Course {
  code: string;
  level: Level;
  title: L;
  term: Term;
  format: Format;
  lang: Lang;
  ects: number;
  /** Person id. */
  lead: string;
  /** "Tue 10:00–12:50" as weekday index (1 = Monday) + times. */
  slot: { day: number; from: string; to: string };
  room: string;
  seats: number;
  taken: number;
  text: L;
  prereq?: string;
}

export const courses: Course[] = [
  { code: "URB 101", level: "ba", term: "autumn", format: "lecture", lang: "en", ects: 6, lead: "aksoy", slot: { day: 1, from: "09:00", to: "11:50" }, room: "A-101", seats: 90, taken: 84, title: { en: "Introduction to Urban Studies", tr: "Kentsel Çalışmalara Giriş" }, text: { en: "How cities grew, who decided, and how we read them today: maps, censuses, walking.", tr: "Kentler nasıl büyüdü, kim karar verdi ve bugün onları nasıl okuyoruz: haritalar, nüfus sayımları, yürüyüş." } },
  { code: "URB 112", level: "ba", term: "autumn", format: "studio", lang: "en", ects: 8, lead: "deniz", slot: { day: 3, from: "13:00", to: "17:50" }, room: "Studio 2", seats: 20, taken: 20, title: { en: "Studio I: Reading the Street", tr: "Stüdyo I: Sokağı Okumak" }, text: { en: "One street in Balat, measured and drawn by hand over twelve weeks.", tr: "Balat’ta tek bir sokak, on iki hafta boyunca elle ölçülüp çiziliyor." } },
  { code: "URB 124", level: "ba", term: "spring", format: "lecture", lang: "tr", ects: 5, lead: "yalin", slot: { day: 2, from: "10:00", to: "12:50" }, room: "A-204", seats: 80, taken: 51, title: { en: "History of Planning in Turkey", tr: "Türkiye’de Planlama Tarihi" }, text: { en: "From the 1930s master plans to today’s urban transformation law.", tr: "1930’ların nazım planlarından bugünkü kentsel dönüşüm yasasına." } },
  { code: "URB 131", level: "ba", term: "spring", format: "studio", lang: "en", ects: 8, lead: "deniz", slot: { day: 3, from: "13:00", to: "17:50" }, room: "Studio 2", seats: 20, taken: 14, title: { en: "Studio II: The Block", tr: "Stüdyo II: Yapı Adası" }, text: { en: "Redesigning one urban block with its residents, from survey to model.", tr: "Bir yapı adasını sakinleriyle birlikte, saha araştırmasından maketine yeniden tasarlamak." }, prereq: "URB 112" },
  { code: "URB 215", level: "ba", term: "autumn", format: "lecture", lang: "en", ects: 6, lead: "okafor", slot: { day: 4, from: "09:00", to: "11:50" }, room: "B-110", seats: 70, taken: 66, title: { en: "Urban Economics", tr: "Kent Ekonomisi" }, text: { en: "Land rent, housing markets and why rents rise near new metro stations.", tr: "Arazi rantı, konut piyasası ve yeni metro istasyonlarının yakınında kiraların neden arttığı." } },
  { code: "URB 226", level: "ba", term: "autumn", format: "seminar", lang: "tr", ects: 5, lead: "yalin", slot: { day: 2, from: "14:00", to: "16:50" }, room: "B-204", seats: 25, taken: 19, title: { en: "Informal Housing and the Gecekondu", tr: "Kayıt Dışı Konut ve Gecekondu" }, text: { en: "Seventy years of self-built neighbourhoods, from oral histories and court files.", tr: "Yetmiş yıllık kendi yapılan mahalleler; sözlü tarih ve mahkeme kayıtlarından." } },
  { code: "URB 238", level: "ba", term: "spring", format: "fieldwork", lang: "en", ects: 7, lead: "marchetti", slot: { day: 5, from: "09:00", to: "16:50" }, room: "Off campus", seats: 18, taken: 18, title: { en: "Field School: Waterfronts", tr: "Saha Okulu: Kıyılar" }, text: { en: "Six Fridays on the Golden Horn and one week in a partner port city.", tr: "Haliç’te altı cuma ve ortak bir liman kentinde bir hafta." } },
  { code: "URB 247", level: "ba", term: "spring", format: "lecture", lang: "en", ects: 6, lead: "karaca", slot: { day: 1, from: "13:00", to: "15:50" }, room: "A-101", seats: 80, taken: 38, title: { en: "Cities and Climate", tr: "Kentler ve İklim" }, text: { en: "Heat islands, flooding and what streets can do about them.", tr: "Isı adaları, sel ve sokakların bunlar için neler yapabileceği." } },
  { code: "URB 312", level: "ba", term: "autumn", format: "studio", lang: "en", ects: 10, lead: "marchetti", slot: { day: 3, from: "13:00", to: "17:50" }, room: "Studio 4", seats: 20, taken: 17, title: { en: "Studio III: Mobility Corridors", tr: "Stüdyo III: Ulaşım Koridorları" }, text: { en: "A 4 km tram corridor, designed with transport engineers from the Faculty of Engineering.", tr: "Mühendislik Fakültesi’nden ulaştırma mühendisleriyle tasarlanan 4 km’lik tramvay koridoru." }, prereq: "URB 131" },
  { code: "URB 334", level: "ba", term: "spring", format: "seminar", lang: "en", ects: 5, lead: "okafor", slot: { day: 4, from: "14:00", to: "16:50" }, room: "B-204", seats: 25, taken: 9, title: { en: "Data for Planners", tr: "Plancılar için Veri" }, text: { en: "Census, mobility and land-use data in Python and QGIS. No prior coding needed.", tr: "Python ve QGIS ile nüfus, hareketlilik ve arazi kullanımı verisi. Önceden kodlama bilgisi gerekmez." } },
  { code: "URB 351", level: "ba", term: "autumn", format: "seminar", lang: "tr", ects: 5, lead: "aksoy", slot: { day: 5, from: "10:00", to: "12:50" }, room: "B-204", seats: 25, taken: 25, title: { en: "Public Space and Protest", tr: "Kamusal Alan ve Protesto" }, text: { en: "Squares, parks and who is allowed to gather in them.", tr: "Meydanlar, parklar ve orada kimin toplanabildiği." } },
  { code: "URB 405", level: "ba", term: "spring", format: "studio", lang: "en", ects: 12, lead: "deniz", slot: { day: 3, from: "13:00", to: "17:50" }, room: "Studio 4", seats: 20, taken: 12, title: { en: "Graduation Studio", tr: "Bitirme Stüdyosu" }, text: { en: "A self-directed project with a public review in June.", tr: "Haziranda açık jüriyle değerlendirilen bağımsız proje." }, prereq: "URB 312" },
  { code: "URB 502", level: "ma", term: "autumn", format: "studio", lang: "en", ects: 15, lead: "marchetti", slot: { day: 2, from: "13:00", to: "18:50" }, room: "Studio 5", seats: 24, taken: 22, title: { en: "Design Studio: Neighbourhood Repair", tr: "Tasarım Stüdyosu: Mahalle Onarımı" }, text: { en: "Working brief from Kuzey Yaka municipality: 40 hectares, 11,000 residents.", tr: "Kuzey Yaka Belediyesi’nden gerçek bir brif: 40 hektar, 11.000 sakin." } },
  { code: "URB 511", level: "ma", term: "autumn", format: "seminar", lang: "en", ects: 7.5, lead: "aksoy", slot: { day: 4, from: "17:00", to: "19:50" }, room: "B-301", seats: 24, taken: 16, title: { en: "Theories of the City", tr: "Kent Kuramları" }, text: { en: "From Lefebvre to platform urbanism, one text a week.", tr: "Lefebvre’den platform kentçiliğine, haftada bir metin." } },
  { code: "URB 523", level: "ma", term: "spring", format: "seminar", lang: "en", ects: 7.5, lead: "okafor", slot: { day: 1, from: "17:00", to: "19:50" }, room: "B-301", seats: 24, taken: 11, title: { en: "Housing Policy", tr: "Konut Politikası" }, text: { en: "Social housing, rent control and cooperatives compared across six countries.", tr: "Altı ülkede sosyal konut, kira denetimi ve kooperatifler karşılaştırmalı." } },
  { code: "URB 534", level: "ma", term: "spring", format: "studio", lang: "en", ects: 15, lead: "karaca", slot: { day: 2, from: "13:00", to: "18:50" }, room: "Studio 5", seats: 24, taken: 15, title: { en: "Design Studio: The Hot City", tr: "Tasarım Stüdyosu: Sıcak Kent" }, text: { en: "Shade, water and trees for a district that reached 41 °C in July 2026.", tr: "Temmuz 2026’da 41 °C’ye ulaşan bir ilçe için gölge, su ve ağaç." }, prereq: "URB 502" },
  { code: "URB 545", level: "ma", term: "autumn", format: "fieldwork", lang: "tr", ects: 5, lead: "yalin", slot: { day: 6, from: "10:00", to: "15:00" }, room: "Off campus", seats: 15, taken: 7, title: { en: "Walking Methods", tr: "Yürüme Yöntemleri" }, text: { en: "Five Saturday walks across the city with notebooks, sound recorders and a camera.", tr: "Defter, ses kaydedici ve kamerayla kentte beş cumartesi yürüyüşü." } },
  { code: "URB 560", level: "ma", term: "spring", format: "lecture", lang: "en", ects: 5, lead: "karaca", slot: { day: 5, from: "13:00", to: "15:50" }, room: "A-204", seats: 40, taken: 33, title: { en: "Urban Infrastructure and Finance", tr: "Kentsel Altyapı ve Finansman" }, text: { en: "Who pays for a metro line, and who gains from it.", tr: "Bir metro hattını kim öder, kim kazanır." } },
  { code: "URB 601", level: "phd", term: "autumn", format: "seminar", lang: "en", ects: 10, lead: "aksoy", slot: { day: 3, from: "10:00", to: "12:50" }, room: "B-301", seats: 10, taken: 6, title: { en: "Research Design", tr: "Araştırma Tasarımı" }, text: { en: "From a question to a fundable proposal, with mock reviews.", tr: "Bir sorudan fonlanabilir bir öneriye; deneme hakem değerlendirmeleriyle." } },
  { code: "URB 612", level: "phd", term: "spring", format: "seminar", lang: "tr", ects: 10, lead: "yalin", slot: { day: 3, from: "10:00", to: "12:50" }, room: "B-301", seats: 10, taken: 4, title: { en: "Archives and Oral History", tr: "Arşivler ve Sözlü Tarih" }, text: { en: "Working with municipal archives, court records and interviews.", tr: "Belediye arşivleri, mahkeme kayıtları ve görüşmelerle çalışmak." } },
  { code: "URB 625", level: "phd", term: "autumn", format: "seminar", lang: "en", ects: 10, lead: "okafor", slot: { day: 4, from: "10:00", to: "12:50" }, room: "B-301", seats: 10, taken: 5, title: { en: "Quantitative Urban Analysis", tr: "Nicel Kent Analizi" }, text: { en: "Spatial statistics and causal inference with city data.", tr: "Kent verisiyle mekânsal istatistik ve nedensel çıkarım." } },
];

// ---------------------------------------------------------------- people

export type Rank = "prof" | "assoc" | "asst" | "staff";
export const ranks: { id: Rank; title: L }[] = [
  { id: "prof", title: { en: "Professors", tr: "Profesörler" } },
  { id: "assoc", title: { en: "Associate professors", tr: "Doçentler" } },
  { id: "asst", title: { en: "Assistant professors", tr: "Dr. öğretim üyeleri" } },
  { id: "staff", title: { en: "Research and teaching staff", tr: "Araştırma ve öğretim görevlileri" } },
];

export interface Person {
  id: string;
  name: string;
  rank: Rank;
  title: L;
  role?: L;
  interests: L;
  office: string;
  hours: L;
  photo?: ReturnType<typeof portrait>;
  group?: string;
}

export const people: Person[] = [
  { id: "aksoy", name: "Prof. Leyla Aksoy", rank: "prof", title: { en: "Professor of Urban Theory", tr: "Kent Kuramı Profesörü" }, role: { en: "Head of department", tr: "Bölüm başkanı" }, interests: { en: "Public space, protest, the right to the city", tr: "Kamusal alan, protesto, kent hakkı" }, office: "B-305", hours: { en: "Thu 13:00–15:00", tr: "Per 13.00–15.00" }, photo: portrait("1544005313-94ddf0286df2"), group: "space" },
  { id: "okafor", name: "Prof. Daniel Okafor", rank: "prof", title: { en: "Professor of Urban Economics", tr: "Kent Ekonomisi Profesörü" }, interests: { en: "Housing markets, rent, transit and land value", tr: "Konut piyasası, kira, toplu taşıma ve arazi değeri" }, office: "B-307", hours: { en: "Mon 14:00–16:00", tr: "Pzt 14.00–16.00" }, photo: portrait("1507003211169-0a1dd7228f2d"), group: "housing" },
  { id: "yalin", name: "Assoc. Prof. Kerem Yalın", rank: "assoc", title: { en: "Associate Professor of Planning History", tr: "Planlama Tarihi Doçenti" }, role: { en: "Director of doctoral studies", tr: "Doktora programı koordinatörü" }, interests: { en: "Informal housing, archives, oral history", tr: "Kayıt dışı konut, arşivler, sözlü tarih" }, office: "B-311", hours: { en: "Tue 10:00–12:00", tr: "Sal 10.00–12.00" }, photo: portrait("1500648767791-00dcc994a43e"), group: "housing" },
  { id: "marchetti", name: "Assoc. Prof. Giulia Marchetti", rank: "assoc", title: { en: "Associate Professor of Urban Design", tr: "Kentsel Tasarım Doçenti" }, role: { en: "MA programme director", tr: "Yüksek lisans programı koordinatörü" }, interests: { en: "Waterfronts, mobility corridors, design studios", tr: "Kıyılar, ulaşım koridorları, tasarım stüdyoları" }, office: "Studio 5", hours: { en: "Wed 10:00–12:00", tr: "Çar 10.00–12.00" }, photo: portrait("1494790108377-be9c29b29330"), group: "climate" },
  { id: "karaca", name: "Dr. Selin Karaca", rank: "asst", title: { en: "Assistant Professor of Urban Climate", tr: "Kent İklimi Dr. Öğretim Üyesi" }, interests: { en: "Heat, flooding, green infrastructure", tr: "Sıcaklık, sel, yeşil altyapı" }, office: "B-214", hours: { en: "Fri 11:00–13:00", tr: "Cum 11.00–13.00" }, photo: portrait("1438761681033-6461ffad8d80"), group: "climate" },
  { id: "deniz", name: "Dr. Mert Deniz", rank: "asst", title: { en: "Assistant Professor of Architecture and the City", tr: "Mimarlık ve Kent Dr. Öğretim Üyesi" }, role: { en: "BA studio coordinator", tr: "Lisans stüdyo koordinatörü" }, interests: { en: "Drawing, measuring, the urban block", tr: "Çizim, ölçüm, yapı adası" }, office: "Studio 2", hours: { en: "Wed 09:00–11:00", tr: "Çar 09.00–11.00" }, photo: portrait("1472099645785-5658abf4ff4e"), group: "space" },
  { id: "ozturk", name: "Ayşe Öztürk", rank: "staff", title: { en: "Research assistant", tr: "Araştırma görevlisi" }, interests: { en: "PhD on post-earthquake housing in Hatay", tr: "Hatay’da deprem sonrası konut üzerine doktora" }, office: "B-120", hours: { en: "By appointment", tr: "Randevuyla" }, group: "housing" },
  { id: "lindqvist", name: "Erik Lindqvist", rank: "staff", title: { en: "Postdoctoral fellow", tr: "Doktora sonrası araştırmacı" }, interests: { en: "Tree canopy and heat in eight cities", tr: "Sekiz kentte ağaç örtüsü ve sıcaklık" }, office: "B-122", hours: { en: "Tue 14:00–15:00", tr: "Sal 14.00–15.00" }, group: "climate" },
  { id: "sahin", name: "Can Şahin", rank: "staff", title: { en: "Studio instructor", tr: "Stüdyo öğretim görevlisi" }, interests: { en: "Model making, digital fabrication", tr: "Maket yapımı, dijital üretim" }, office: "Workshop", hours: { en: "Mon–Thu 12:00–13:00", tr: "Pzt–Per 12.00–13.00" } },
];

export const groups: { id: string; title: L; lead: string; text: L; project: L }[] = [
  { id: "housing", title: { en: "Housing and Land", tr: "Konut ve Arazi" }, lead: "okafor", text: { en: "Who builds, who owns and who can afford to stay.", tr: "Kim inşa eder, kim sahip olur, kim kalmayı göze alabilir." }, project: { en: "Rent after the metro: 12 stations, 2014–2026", tr: "Metrodan sonra kira: 12 istasyon, 2014–2026" } },
  { id: "climate", title: { en: "Climate and the Street", tr: "İklim ve Sokak" }, lead: "karaca", text: { en: "Design and policy for hotter, wetter cities.", tr: "Daha sıcak, daha yağışlı kentler için tasarım ve politika." }, project: { en: "Shade Atlas: 2,400 streets measured at 15:00", tr: "Gölge Atlası: saat 15.00’te ölçülen 2.400 sokak" } },
  { id: "space", title: { en: "Public Space and Memory", tr: "Kamusal Alan ve Bellek" }, lead: "aksoy", text: { en: "Squares, monuments and the everyday life around them.", tr: "Meydanlar, anıtlar ve çevrelerindeki gündelik yaşam." }, project: { en: "Fifty squares, fifty years: an open archive", tr: "Elli meydan, elli yıl: açık bir arşiv" } },
];

export const events = [
  { date: "2026-11-18", time: "17:00", room: "B-204", kind: { en: "Seminar", tr: "Seminer" }, title: { en: "Who owns the shoreline? Coastal law and practice since 1990", tr: "Kıyı kimin? 1990’dan bu yana kıyı hukuku ve uygulaması" }, who: "Dr. Hande Polat (guest)" },
  { date: "2026-11-25", time: "17:00", room: "B-204", kind: { en: "Seminar", tr: "Seminer" }, title: { en: "Measuring shade: first results from the Shade Atlas", tr: "Gölgeyi ölçmek: Gölge Atlası’ndan ilk sonuçlar" }, who: "Dr. Selin Karaca, Erik Lindqvist" },
  { date: "2026-12-04", time: "14:00", room: "Studio 4", kind: { en: "Public review", tr: "Açık jüri" }, title: { en: "Studio III mid-term review: the Halic tram corridor", tr: "Stüdyo III ara jüri: Haliç tramvay koridoru" }, who: "Assoc. Prof. Giulia Marchetti" },
  { date: "2026-12-09", time: "18:30", room: "Aula", kind: { en: "Lecture", tr: "Konferans" }, title: { en: "Annual lecture: Repairing, not replacing, the city", tr: "Yıllık konferans: Kenti değiştirmek değil, onarmak" }, who: "Prof. Leyla Aksoy" },
];

export const photos = {
  city: { ...unsplash("1477959858617-67f85cf4f1df", 1600, 1000), alt: { en: "A dense city seen from above at dusk, streets lit in a grid", tr: "Alacakaranlıkta yukarıdan görülen yoğun bir kent, ızgara biçiminde aydınlanan sokaklar" } },
};
