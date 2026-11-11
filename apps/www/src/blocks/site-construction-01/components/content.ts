// Sample content for "Stonebridge Build", a fictional contractor and developer working in İstanbul
// and İzmir. Every human-readable field is `{ en, tr }`. Projects, dates and figures are fictional.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "projects@stonebridge.example.com";
/** The site diary's "today": progress is reported up to this month. */
export const AS_OF = "2026-11";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
export const num = (value: number, locale: SiteLocale, digits = 0) => new Intl.NumberFormat(intlOf(locale), { maximumFractionDigits: digits }).format(value);

/** "2026-11" → "Nov 2026" / "Kas 2026" (or long: "November 2026"). */
export function monthLabel(ym: string, locale: SiteLocale, long = false) {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat(intlOf(locale), { month: long ? "long" : "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y!, m! - 1, 15)));
}
/** Months between two "YYYY-MM" values (b − a). */
export const monthDiff = (a: string, b: string) => {
  const [ay, am] = a.split("-").map(Number);
  const [by, bm] = b.split("-").map(Number);
  return (by! - ay!) * 12 + (bm! - am!);
};
export const addMonths = (ym: string, n: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y!, m! - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  slab: { ...unsplash("1541888946425-d81bb19240f5", 1800, 1200), alt: { en: "A site crew in hi-vis jackets standing on a freshly poured concrete slab", tr: "Yeni dökülmüş beton döşemede duran reflektörlü yelekli şantiye ekibi" } },
  cranes: { ...unsplash("1565008447742-97f6f38c985c", 1600, 1200), alt: { en: "Two residential towers under construction with tower cranes against a blue sky", tr: "Mavi gökyüzü önünde kule vinçli, inşaatı süren iki konut kulesi" } },
  rebar: { ...unsplash("1504307651254-35680f356dfd", 1600, 1200), alt: { en: "Rebar mats and formwork seen from above, two workers in orange checking ties", tr: "Yukarıdan donatı hasırları ve kalıp; turuncu giysili iki işçi bağları kontrol ediyor" } },
  columns: { ...unsplash("1531834685032-c34bf0d84c77", 1200, 1500), alt: { en: "Workers on scaffolding fixing tall rebar cages for concrete columns", tr: "İskelede beton kolon donatı kafeslerini bağlayan işçiler" } },
  dig: { ...unsplash("1517089596392-fb9a9033e05b", 1600, 1200), alt: { en: "Excavators and a dozer cutting a building pit, seen from above", tr: "Yukarıdan bir temel çukurunu kazan ekskavatörler ve dozer" } },
  plans: { ...unsplash("1503387837-b154d5074bd2", 1600, 1200), alt: { en: "Hands drawing on a plan beside a triangular scale ruler on a wooden table", tr: "Ahşap masada üçgen ölçek cetvelinin yanında plan çizen eller" } },
  loft: { ...unsplash("1497366811353-6870744d04b2", 1600, 1200), alt: { en: "A finished workshop floor with long tables, polished concrete and tall steel windows", tr: "Uzun masalar, cilalı beton ve yüksek çelik pencereli tamamlanmış atölye katı" } },
};

// ---------------------------------------------------------------- projects

export type ProjectStatus = "construction" | "completed" | "planning";
export type ProjectType = "residential" | "civic" | "commercial";

export interface Phase {
  id: string;
  name: L;
  start: string;
  end: string;
}
export interface DiaryEntry {
  month: string;
  text: L;
}
export interface Project {
  slug: string;
  name: string;
  place: L;
  type: ProjectType;
  status: ProjectStatus;
  client: L;
  value: L;
  area: string;
  summary: L;
  photo: { src: string; width: number; height: number; alt: L };
  facts: { label: L; value: L }[];
  phases: Phase[];
  diary: DiaryEntry[];
}

const P = (id: string, en: string, tr: string, start: string, end: string): Phase => ({ id, name: { en, tr }, start, end });

export const projects: Project[] = [
  {
    slug: "kuzey-yaka",
    name: "Kuzey Yaka Residences",
    place: { en: "Kartal, İstanbul", tr: "Kartal, İstanbul" },
    type: "residential",
    status: "construction",
    client: { en: "Kuzey Yaka Housing Co-operative", tr: "Kuzey Yaka Konut Kooperatifi" },
    value: { en: "₺1.9 bn", tr: "1,9 milyar ₺" },
    area: "21,400 m²",
    summary: { en: "Two 14-storey towers, 168 flats over a shared podium garden, built to the 2018 seismic code with base isolators.", tr: "Ortak bahçeli podyum üzerinde iki adet 14 katlı kule, 168 daire; sismik izolatörlü, 2018 deprem yönetmeliğine göre." },
    photo: photos.cranes,
    facts: [
      { label: { en: "Flats", tr: "Daire" }, value: { en: "168 (1+1 to 4+1)", tr: "168 (1+1’den 4+1’e)" } },
      { label: { en: "Structure", tr: "Taşıyıcı sistem" }, value: { en: "RC core and shear walls, 96 lead-rubber isolators", tr: "Betonarme çekirdek ve perdeler, 96 kurşun çekirdekli izolatör" } },
      { label: { en: "Certification", tr: "Sertifika" }, value: { en: "Targeting national green building, gold", tr: "Ulusal yeşil bina, altın hedefleniyor" } },
    ],
    phases: [
      P("setup", "Site set-up & hoarding", "Şantiye kurulumu ve çevirme", "2025-03", "2025-04"),
      P("dig", "Excavation & piling", "Kazı ve kazık", "2025-04", "2025-08"),
      P("base", "Raft & isolators", "Radye ve izolatörler", "2025-08", "2025-11"),
      P("frame", "Frame, floors 1–14", "Kaba yapı, 1–14. katlar", "2025-11", "2026-09"),
      P("envelope", "Façade & roof", "Cephe ve çatı", "2026-06", "2027-01"),
      P("mep", "Mechanical & electrical", "Mekanik ve elektrik", "2026-07", "2027-03"),
      P("fitout", "Fit-out & landscape", "İnce işler ve peyzaj", "2026-11", "2027-05"),
      P("handover", "Snagging & handover", "Eksik listesi ve teslim", "2027-05", "2027-06"),
    ],
    diary: [
      { month: "2025-03", text: { en: "Hoarding up, site office and wheel wash in. Neighbours’ meeting held on 18 March.", tr: "Çevirme kuruldu, şantiye ofisi ve tekerlek yıkama hazır. 18 Mart’ta komşu toplantısı yapıldı." } },
      { month: "2025-06", text: { en: "112 of 184 bored piles cast. Groundwater lower than the survey said — pumps scaled back.", tr: "184 fore kazığın 112’si döküldü. Yeraltı suyu etüttekinden düşük — pompalar azaltıldı." } },
      { month: "2025-10", text: { en: "Last of 96 isolators set on the raft. Independent check by the design engineer passed.", tr: "96 izolatörün sonuncusu radyeye yerleşti. Proje mühendisinin bağımsız kontrolü olumlu." } },
      { month: "2026-02", text: { en: "Tower A at floor 5, Tower B at floor 4. Six-day floor cycle reached.", tr: "A kulesi 5., B kulesi 4. katta. Altı günlük kat döngüsüne ulaşıldı." } },
      { month: "2026-07", text: { en: "Tower A topped out on 24 July. Façade brackets going on from floor 3 up.", tr: "A kulesinin kaba yapısı 24 Temmuz’da bitti. Cephe konsolları 3. kattan yukarı takılıyor." } },
      { month: "2026-09", text: { en: "Both frames complete, one week behind plan after the August heat stoppages.", tr: "İki kulenin kaba yapısı tamam; ağustostaki sıcak nedeniyle duruşlar sonrası plana göre bir hafta geride." } },
      { month: "2026-11", text: { en: "Façade 60% closed on Tower A. First show flat being fitted out on floor 2.", tr: "A kulesinde cephe %60 kapandı. 2. katta ilk örnek daire hazırlanıyor." } },
    ],
  },
  {
    slug: "liman-library",
    name: "Liman Library & Archive",
    place: { en: "Bornova, İzmir", tr: "Bornova, İzmir" },
    type: "civic",
    status: "construction",
    client: { en: "Municipal culture directorate", tr: "Belediye kültür müdürlüğü" },
    value: { en: "₺640 m", tr: "640 milyon ₺" },
    area: "7,800 m²",
    summary: { en: "A public library over a climate-controlled archive for 1.2 million documents, with a reading terrace facing the bay.", tr: "1,2 milyon belge için iklim kontrollü arşivin üzerinde, körfeze bakan okuma teraslı bir halk kütüphanesi." },
    photo: photos.rebar,
    facts: [
      { label: { en: "Archive", tr: "Arşiv" }, value: { en: "18 °C ± 1, 45% RH, inert-gas fire suppression", tr: "18 °C ± 1, %45 bağıl nem, inert gazlı söndürme" } },
      { label: { en: "Structure", tr: "Taşıyıcı sistem" }, value: { en: "Post-tensioned slabs, 14 m reading-room spans", tr: "Ardgermeli döşemeler, 14 m okuma salonu açıklıkları" } },
      { label: { en: "Procurement", tr: "İhale" }, value: { en: "Design & build, open tender 2025", tr: "Tasarla-yap, 2025 açık ihale" } },
    ],
    phases: [
      P("setup", "Site set-up", "Şantiye kurulumu", "2025-09", "2025-10"),
      P("dig", "Excavation & retaining wall", "Kazı ve istinat duvarı", "2025-10", "2026-01"),
      P("base", "Basement archive box", "Bodrum arşiv kutusu", "2026-01", "2026-05"),
      P("frame", "Frame & post-tensioned slabs", "Kaba yapı ve ardgermeli döşemeler", "2026-05", "2026-12"),
      P("envelope", "Stone façade & glazing", "Taş cephe ve camlar", "2026-11", "2027-04"),
      P("mep", "Archive climate & services", "Arşiv iklimlendirme ve tesisat", "2026-10", "2027-05"),
      P("fitout", "Fit-out & shelving", "İnce işler ve raf sistemleri", "2027-03", "2027-07"),
      P("handover", "Commissioning & handover", "Devreye alma ve teslim", "2027-07", "2027-08"),
    ],
    diary: [
      { month: "2025-09", text: { en: "Contract signed 2 September; site handed over a week later.", tr: "Sözleşme 2 Eylül’de imzalandı; şantiye bir hafta sonra teslim alındı." } },
      { month: "2025-12", text: { en: "Secant-pile retaining wall closed on all four sides.", tr: "Kesişen kazık istinat duvarı dört taraftan kapandı." } },
      { month: "2026-04", text: { en: "Archive box waterproofed and tested: 72 hours flooded, no ingress.", tr: "Arşiv kutusu yalıtıldı ve test edildi: 72 saat su altında, sızıntı yok." } },
      { month: "2026-08", text: { en: "First post-tensioned slab stressed. Reading-room shoring stays in until level 3.", tr: "İlk ardgermeli döşeme gerildi. Okuma salonu dikmeleri 3. kata kadar kalıyor." } },
      { month: "2026-11", text: { en: "Level 3 slab poured. Stone samples approved by the client on 6 November.", tr: "3. kat döşemesi döküldü. Taş numuneleri 6 Kasım’da işveren tarafından onaylandı." } },
    ],
  },
  {
    slug: "degirmen-workshops",
    name: "Değirmen Workshops",
    place: { en: "Beykoz, İstanbul", tr: "Beykoz, İstanbul" },
    type: "commercial",
    status: "completed",
    client: { en: "Private owner", tr: "Özel mülk sahibi" },
    value: { en: "₺410 m", tr: "410 milyon ₺" },
    area: "5,200 m²",
    summary: { en: "A 1920s flour mill turned into 34 workshops and studios. Brick shell repaired, a steel mezzanine and new roof inside.", tr: "1920’lerden bir un değirmeni 34 atölye ve stüdyoya dönüştü. Tuğla kabuk onarıldı; içine çelik asma kat ve yeni çatı." },
    photo: photos.loft,
    facts: [
      { label: { en: "Units", tr: "Birim" }, value: { en: "34 workshops, 40–220 m²", tr: "34 atölye, 40–220 m²" } },
      { label: { en: "Heritage", tr: "Koruma" }, value: { en: "Registered building, board approval 2023", tr: "Tescilli yapı, kurul onayı 2023" } },
      { label: { en: "Handed over", tr: "Teslim" }, value: { en: "14 May 2026, 9 days early", tr: "14 Mayıs 2026, 9 gün erken" } },
    ],
    phases: [
      P("setup", "Survey & propping", "Rölöve ve destekleme", "2024-02", "2024-04"),
      P("strip", "Strip-out & brick repair", "Söküm ve tuğla onarımı", "2024-04", "2024-10"),
      P("frame", "Steel mezzanine & roof", "Çelik asma kat ve çatı", "2024-09", "2025-04"),
      P("mep", "Services", "Tesisat", "2025-02", "2025-11"),
      P("fitout", "Fit-out & courtyard", "İnce işler ve avlu", "2025-09", "2026-04"),
      P("handover", "Handover", "Teslim", "2026-04", "2026-05"),
    ],
    diary: [
      { month: "2024-02", text: { en: "Laser survey of every elevation; 2,300 bricks marked for replacement.", tr: "Tüm cephelerin lazer rölövesi; 2.300 tuğla değişim için işaretlendi." } },
      { month: "2024-08", text: { en: "Reclaimed bricks from a local demolition matched to the original by colour.", tr: "Yakındaki bir yıkımdan çıkan tuğlalar renk olarak orijinale eşlendi." } },
      { month: "2025-03", text: { en: "New roof watertight before the spring rains.", tr: "Yeni çatı bahar yağmurlarından önce su geçirmez hale geldi." } },
      { month: "2025-12", text: { en: "First twelve tenants signed off their units for fit-out.", tr: "İlk on iki kiracı ince işler için birimlerini onayladı." } },
      { month: "2026-05", text: { en: "Handed over on 14 May, nine days early, with 41 snags all closed.", tr: "14 Mayıs’ta, dokuz gün erken teslim; 41 eksiğin tamamı kapandı." } },
    ],
  },
  {
    slug: "ardic-terraces",
    name: "Ardıç Terrace Houses",
    place: { en: "Urla, İzmir", tr: "Urla, İzmir" },
    type: "residential",
    status: "planning",
    client: { en: "Stonebridge Development", tr: "Stonebridge Geliştirme" },
    value: { en: "₺520 m", tr: "520 milyon ₺" },
    area: "6,100 m²",
    summary: { en: "Twenty-two terrace houses stepping down a south slope, timber-frame upper floors on a concrete base. Our own development.", tr: "Güney yamacından basamaklanan yirmi iki sıra ev; beton taban üzerine ahşap karkas üst katlar. Kendi geliştirme projemiz." },
    photo: photos.plans,
    facts: [
      { label: { en: "Homes", tr: "Konut" }, value: { en: "22 houses, 3 and 4 bedrooms", tr: "22 ev, 3 ve 4 yatak odalı" } },
      { label: { en: "Structure", tr: "Taşıyıcı sistem" }, value: { en: "Concrete base, cross-laminated timber above", tr: "Beton taban, üstte çapraz lamine ahşap" } },
      { label: { en: "Sales", tr: "Satış" }, value: { en: "Register interest from January 2027", tr: "Ocak 2027’den itibaren ön kayıt" } },
    ],
    phases: [
      P("design", "Design & permits", "Tasarım ve ruhsat", "2026-03", "2027-01"),
      P("setup", "Site set-up & earthworks", "Şantiye kurulumu ve hafriyat", "2027-02", "2027-05"),
      P("base", "Foundations & retaining walls", "Temel ve istinat duvarları", "2027-05", "2027-09"),
      P("frame", "Timber frames", "Ahşap karkas", "2027-09", "2028-02"),
      P("fitout", "Fit-out & gardens", "İnce işler ve bahçeler", "2028-01", "2028-07"),
      P("handover", "Handover", "Teslim", "2028-07", "2028-08"),
    ],
    diary: [
      { month: "2026-03", text: { en: "Land purchase completed; topographic and geotechnical surveys commissioned.", tr: "Arsa alımı tamamlandı; topografik ve geoteknik etütler başlatıldı." } },
      { month: "2026-07", text: { en: "Concept approved by the planning office after one round of comments.", tr: "Konsept, imar müdürlüğünün bir tur görüşünden sonra onaylandı." } },
      { month: "2026-11", text: { en: "Building permit application submitted on 4 November.", tr: "Yapı ruhsatı başvurusu 4 Kasım’da yapıldı." } },
    ],
  },
];

export const typeName: Record<ProjectType, L> = {
  residential: { en: "Residential", tr: "Konut" },
  civic: { en: "Civic", tr: "Kamu" },
  commercial: { en: "Commercial", tr: "Ticari" },
};
export const statusName: Record<ProjectStatus, L> = {
  construction: { en: "On site", tr: "İnşaat sürüyor" },
  completed: { en: "Completed", tr: "Tamamlandı" },
  planning: { en: "In planning", tr: "Planlama" },
};

export type PhaseState = "done" | "active" | "upcoming";

/** Where each phase stands in month `at` (inclusive of the whole month), and the overall %. */
export function progressAt(p: Project, at: string) {
  const end = (ym: string) => addMonths(ym, 1); // a phase ending "2026-09" runs through September
  const states = p.phases.map((ph) => {
    const span = Math.max(1, monthDiff(ph.start, end(ph.end)));
    const done = monthDiff(ph.start, end(at));
    const pct = Math.max(0, Math.min(1, done / span));
    const state: PhaseState = pct >= 1 ? "done" : pct > 0 ? "active" : "upcoming";
    return { phase: ph, pct, state, span };
  });
  const total = states.reduce((s, x) => s + x.span, 0);
  const overall = states.reduce((s, x) => s + x.span * x.pct, 0) / total;
  return { states, overall };
}

export const projectStart = (p: Project) => p.phases[0]!.start;
export const projectEnd = (p: Project) => p.phases[p.phases.length - 1]!.end;

// ---------------------------------------------------------------- company

export const team = [
  { name: "Haluk Demirtaş", role: { en: "Founder · civil engineer", tr: "Kurucu · inşaat mühendisi" }, specialty: { en: "38 years on site, 61 buildings handed over", tr: "Sahada 38 yıl, teslim edilen 61 bina" }, photo: { ...unsplash("1472099645785-5658abf4ff4e", 800, 1000), alt: { en: "Haluk Demirtaş in glasses and a dark polo shirt", tr: "Gözlüklü, koyu polo yakalı Haluk Demirtaş" } } },
  { name: "Cem Yalın", role: { en: "Project director", tr: "Proje direktörü" }, specialty: { en: "Kuzey Yaka, Liman Library", tr: "Kuzey Yaka, Liman Kütüphanesi" }, photo: { ...unsplash("1547425260-76bcadfb4f2c", 800, 1000), alt: { en: "Cem Yalın in glasses and a blue striped shirt", tr: "Gözlüklü, mavi çizgili gömlekli Cem Yalın" } } },
  { name: "Abena Osei", role: { en: "MEP lead", tr: "Mekanik-elektrik lideri" }, specialty: { en: "Archive climate, commissioning", tr: "Arşiv iklimlendirme, devreye alma" }, photo: { ...unsplash("1531123897727-8f129e1688ce", 800, 1000), alt: { en: "Abena Osei in a white collared shirt", tr: "Beyaz yakalı gömlekli Abena Osei" } } },
  { name: "Daniel Mensah", role: { en: "Site manager", tr: "Şantiye şefi" }, specialty: { en: "Safety lead, 1.2 million hours without a lost-time injury", tr: "İSG lideri, iş günü kayıplı kaza olmadan 1,2 milyon saat" }, photo: { ...unsplash("1621905252507-b35492cc74b4", 800, 1000), alt: { en: "Daniel Mensah in a yellow hard hat and a checked shirt", tr: "Sarı baretli, ekose gömlekli Daniel Mensah" } } },
];

const office = { open: "08:30", close: "18:00" };
export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: { mon: [office], tue: [office], wed: [office], thu: [office], fri: [office], sat: [], sun: [] },
};

const mapSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f1f1ef'/>" +
  "<g fill='#e2e2de'>" +
  Array.from({ length: 20 }, (_, i) => `<rect x='${(i % 5) * 240 + 20}' y='${Math.floor(i / 5) * 225 + 20}' width='200' height='185' rx='2'/>`).join("") +
  "</g><g fill='none' stroke='#ffffff' stroke-linecap='round'><path d='M-20 440 H1220' stroke-width='32'/><path d='M480 -20 V920' stroke-width='22'/><path d='M-20 860 L1220 120' stroke-width='14'/></g>" +
  "<rect x='500' y='245' width='200' height='185' rx='2' fill='#cfcfc9'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(mapSvg)}`, width: 1200, height: 900, alt: "" };

export const address = { line: "Ankara Caddesi 211, Kat 2", district: "Soğanlık", city: "Kartal", region: "İstanbul", postalCode: "34880", country: "TR", geo: { lat: 40.9067, lng: 29.1923 } };

export function branches(t: (v: Localized<string>) => string): Branch[] {
  return [
    { name: t({ en: "Head office", tr: "Merkez ofis" }), address, phone: PHONE, email: EMAIL, hours, mapImage: streetMap, notes: t({ en: "Site visits start here: bring safety boots, we lend the rest.", tr: "Şantiye ziyaretleri buradan başlar: iş ayakkabınızı getirin, gerisini biz veririz." }) },
    { name: t({ en: "İzmir office", tr: "İzmir ofisi" }), address: { line: "Kazımdirik Mahallesi 372. Sokak 8", district: "Bornova", city: "Bornova", region: "İzmir", postalCode: "35100", country: "TR", geo: { lat: 38.4572, lng: 27.2189 } }, phone: PHONE, email: EMAIL, hours, mapImage: streetMap, notes: t({ en: "Two streets from the Liman Library site.", tr: "Liman Kütüphanesi şantiyesine iki sokak." }) },
  ];
}
