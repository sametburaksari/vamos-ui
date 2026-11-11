// Sample content for "Motion Lab Physio", a fictional physiotherapy clinic in Suadiye, Kadıköy.
// Every human-readable field is `{ en, tr }`. No cures, no recovery promises, no before/after —
// body areas, treatments, durations, prices, people and how records are handled.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Teal from the plan; SiteShell derives the four accent variables (contrast-checked). */
export const ACCENT = "#14B8A6";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "desk@motionlab.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  gym: { ...unsplash("1571019613454-1cb2f99b2d8b", 1600, 1067), alt: { en: "A woman doing a core exercise on a mat by a bright window", tr: "Aydınlık bir pencerenin önünde matta karın egzersizi yapan bir kadın" } },
  mat: { ...unsplash("1552196563-55cd4e45efb3", 1200, 1500), alt: { en: "A woman sitting cross-legged on an exercise mat in a studio", tr: "Bir stüdyoda egzersiz matında bağdaş kurarak oturan bir kadın" } },
};

// ---------------------------------------------------------------- treatments

export type TreatmentId = "assessment" | "manual" | "rehab" | "sports" | "shockwave" | "needling" | "desk" | "pilates" | "gait";

export interface Treatment {
  id: TreatmentId;
  name: L;
  text: L;
  minutes: number;
  fee: number;
  group: "start" | "hands" | "move";
}

export const treatments: Record<TreatmentId, Treatment> = {
  assessment: { id: "assessment", group: "start", name: { en: "Initial assessment", tr: "İlk değerlendirme" }, text: { en: "History, movement tests and a first treatment. You leave with a written plan and two exercises.", tr: "Öykü, hareket testleri ve ilk tedavi. Yazılı bir plan ve iki egzersizle ayrılırsınız." }, minutes: 60, fee: 2600 },
  manual: { id: "manual", group: "hands", name: { en: "Manual therapy", tr: "Manuel terapi" }, text: { en: "Joint mobilisation and soft-tissue work, always followed by the exercise that keeps the gain.", tr: "Eklem mobilizasyonu ve yumuşak doku çalışması; ardından her zaman kazanımı koruyan egzersiz." }, minutes: 45, fee: 1900 },
  rehab: { id: "rehab", group: "move", name: { en: "Exercise rehabilitation", tr: "Egzersiz rehabilitasyonu" }, text: { en: "One-to-one in our gym, with a programme you can repeat at home or in your own gym.", tr: "Spor salonumuzda birebir; evde ya da kendi salonunuzda tekrarlayabileceğiniz bir programla." }, minutes: 45, fee: 1800 },
  sports: { id: "sports", group: "move", name: { en: "Sports injury session", tr: "Spor yaralanması seansı" }, text: { en: "Load testing, return-to-play steps and a plan agreed with your coach if you have one.", tr: "Yük testleri, sahaya dönüş adımları ve varsa antrenörünüzle ortak plan." }, minutes: 60, fee: 2400 },
  shockwave: { id: "shockwave", group: "hands", name: { en: "Shockwave therapy", tr: "Şok dalga tedavisi" }, text: { en: "For long-standing tendon pain, after an assessment. Usually alongside a loading programme.", tr: "Uzun süreli tendon ağrıları için, değerlendirmeden sonra. Genellikle bir yükleme programıyla birlikte." }, minutes: 20, fee: 1500 },
  needling: { id: "needling", group: "hands", name: { en: "Dry needling", tr: "Kuru iğneleme" }, text: { en: "Fine single-use needles in tight muscles, only if you want it and never on a first visit.", tr: "Gergin kaslara tek kullanımlık ince iğneler; yalnızca isterseniz ve asla ilk ziyarette değil." }, minutes: 30, fee: 1600 },
  desk: { id: "desk", group: "move", name: { en: "Desk & posture review", tr: "Masa ve duruş değerlendirmesi" }, text: { en: "Send three photos of where you work; we adjust the set-up with you and give you a micro-break routine.", tr: "Çalıştığınız yerin üç fotoğrafını gönderin; düzeni sizinle birlikte ayarlar, kısa mola rutini veririz." }, minutes: 45, fee: 1700 },
  pilates: { id: "pilates", group: "move", name: { en: "Clinical Pilates, 1:1", tr: "Klinik Pilates, birebir" }, text: { en: "Reformer sessions led by a physiotherapist. Groups of four on Tuesday and Thursday evenings for ₺900.", tr: "Fizyoterapist eşliğinde reformer seansları. Salı ve perşembe akşamları dört kişilik gruplar 900 ₺." }, minutes: 50, fee: 1800 },
  gait: { id: "gait", group: "move", name: { en: "Running gait analysis", tr: "Koşu analizi" }, text: { en: "Treadmill video from three angles, strength tests and a written report with drills.", tr: "Üç açıdan koşu bandı videosu, kuvvet testleri ve drill’lerle yazılı rapor." }, minutes: 75, fee: 2900 },
};

export const groupNames: Record<Treatment["group"], L> = {
  start: { en: "Start here", tr: "Buradan başlayın" },
  hands: { en: "Hands-on", tr: "Manuel uygulamalar" },
  move: { en: "Movement & exercise", tr: "Hareket ve egzersiz" },
};

// ---------------------------------------------------------------- body areas (the signature)

export type AreaId = "neck" | "shoulder" | "back" | "wrist" | "hip" | "knee" | "ankle";
export const AREAS: AreaId[] = ["neck", "shoulder", "back", "wrist", "hip", "knee", "ankle"];
export type View = "front" | "back";

export interface Area {
  id: AreaId;
  label: L;
  /** What people most often come with — descriptive, not diagnostic. */
  common: L;
  treatments: TreatmentId[];
  /** Typical number of visits, as a range. */
  visits: [number, number];
  /** Hotspot positions in % of the figure box, per view (missing = not shown in that view). */
  spot: Partial<Record<View, [number, number]>>;
}

export const areas: Record<AreaId, Area> = {
  neck: { id: "neck", label: { en: "Neck", tr: "Boyun" }, common: { en: "Stiffness after long screen days, tension headaches, a sore neck after a car journey.", tr: "Uzun ekran günlerinden sonra tutulma, gerilim tipi baş ağrıları, araba yolculuğu sonrası boyun ağrısı." }, treatments: ["assessment", "manual", "desk", "needling"], visits: [3, 5], spot: { front: [50, 15.5], back: [50, 15.5] } },
  shoulder: { id: "shoulder", label: { en: "Shoulder", tr: "Omuz" }, common: { en: "Pain reaching overhead, swimmers’ and climbers’ shoulders, stiffness after a fall.", tr: "Başın üstüne uzanırken ağrı, yüzücü ve tırmanıcı omuzları, düşme sonrası tutukluk." }, treatments: ["assessment", "manual", "rehab", "needling"], visits: [4, 8], spot: { front: [31, 19.5], back: [69, 19.5] } },
  back: { id: "back", label: { en: "Lower back", tr: "Bel" }, common: { en: "Aching after sitting, a back that “went” lifting something, stiffness first thing in the morning.", tr: "Oturduktan sonra ağrı, bir şey kaldırırken “tutulan” bel, sabahları ilk kalkışta tutukluk." }, treatments: ["assessment", "manual", "pilates", "desk"], visits: [4, 6], spot: { back: [50, 44] } },
  wrist: { id: "wrist", label: { en: "Elbow & wrist", tr: "Dirsek ve el bileği" }, common: { en: "Tennis and golfer’s elbow, mouse-hand ache, a wrist that hasn’t felt right since a fall.", tr: "Tenisçi ve golfçü dirseği, fare kullanımına bağlı el ağrısı, düşmeden beri rahat olmayan bilek." }, treatments: ["assessment", "manual", "rehab", "desk"], visits: [3, 6], spot: { front: [17, 54.5] } },
  hip: { id: "hip", label: { en: "Hip", tr: "Kalça" }, common: { en: "Groin or outer-hip pain on stairs, tight hips in runners, getting moving again after hip surgery.", tr: "Merdivende kasık ya da dış kalça ağrısı, koşucularda kalça gerginliği, kalça ameliyatı sonrası yeniden hareketlenme." }, treatments: ["assessment", "rehab", "pilates", "gait"], visits: [4, 8], spot: { front: [60, 53], back: [41, 53] } },
  knee: { id: "knee", label: { en: "Knee", tr: "Diz" }, common: { en: "Runner’s knee, pain on stairs or squatting, rehab after ligament or meniscus surgery.", tr: "Koşucu dizi, merdivende ya da çömelirken ağrı, bağ ya da menisküs ameliyatı sonrası rehabilitasyon." }, treatments: ["assessment", "rehab", "sports", "gait"], visits: [6, 12], spot: { front: [40, 75], back: [60, 75] } },
  ankle: { id: "ankle", label: { en: "Ankle & foot", tr: "Ayak bileği ve ayak" }, common: { en: "Sprains that keep coming back, heel pain in the morning, Achilles pain after running.", tr: "Tekrarlayan burkulmalar, sabahları topuk ağrısı, koşudan sonra Aşil ağrısı." }, treatments: ["assessment", "sports", "shockwave", "gait"], visits: [4, 8], spot: { front: [59, 93], back: [41, 93] } },
};

// ---------------------------------------------------------------- people

export interface Physio {
  id: string;
  name: string;
  role: L;
  focus: L;
  areas: AreaId[];
  photo: { src: string; width: number; height: number; alt: L };
}

export const team: Physio[] = [
  { id: "yalin", name: "Zeynep Yalın", role: { en: "Physiotherapist, clinical lead", tr: "Fizyoterapist, klinik sorumlusu" }, focus: { en: "Knees · running · post-surgery rehab", tr: "Diz · koşu · ameliyat sonrası rehabilitasyon" }, areas: ["knee", "hip", "ankle"], photo: { ...unsplash("1534751516642-a1af1ef26a56", 800, 1000), alt: { en: "Zeynep Yalın, long dark hair, in a pink T-shirt in front of green leaves", tr: "Uzun koyu saçlı, pembe tişörtlü Zeynep Yalın, yeşil yaprakların önünde" } } },
  { id: "tuna", name: "Barış Tuna", role: { en: "Physiotherapist", tr: "Fizyoterapist" }, focus: { en: "Shoulders · climbers · swimmers", tr: "Omuz · tırmanıcılar · yüzücüler" }, areas: ["shoulder", "neck", "wrist"], photo: { ...unsplash("1506794778202-cad84cf45f1d", 800, 1000), alt: { en: "Barış Tuna, bearded, in a knitted jumper", tr: "Sakallı, örgü kazaklı Barış Tuna" } } },
  { id: "erdem", name: "Kerem Erdem", role: { en: "Physiotherapist, Pilates lead", tr: "Fizyoterapist, Pilates sorumlusu" }, focus: { en: "Backs · desk workers · Clinical Pilates", tr: "Bel · masa başı çalışanlar · Klinik Pilates" }, areas: ["back", "neck", "hip"], photo: { ...unsplash("1560250097-0b93528c311a", 800, 1000), alt: { en: "Kerem Erdem in glasses and a dark blazer", tr: "Gözlüklü, koyu ceketli Kerem Erdem" } } },
];

// ---------------------------------------------------------------- booking

/** Week grid in the booking form: next six working days, these start times. */
export const TIMES = ["08:00", "09:00", "11:00", "13:00", "16:00", "18:00", "19:00"];

// ---------------------------------------------------------------- place

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "07:30", close: "20:30" }],
    tue: [{ open: "07:30", close: "20:30" }],
    wed: [{ open: "07:30", close: "20:30" }],
    thu: [{ open: "07:30", close: "20:30" }],
    fri: [{ open: "07:30", close: "19:00" }],
    sat: [{ open: "09:00", close: "15:00" }],
    sun: [],
  },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f1f3f3'/>" +
  "<g fill='#e2e7e6'>" +
  Array.from({ length: 28 }, (_, i) => `<rect x='${(i % 7) * 172 + 12}' y='${Math.floor(i / 7) * 225 + 12}' width='150' height='200' rx='4'/>`).join("") +
  "</g><path d='M-20 700 L1220 300' fill='none' stroke='#ffffff' stroke-width='34'/>" +
  "<path d='M300 -20 L380 920' fill='none' stroke='#ffffff' stroke-width='16'/>" +
  "<path d='M0 860 C400 820 800 880 1200 830 L1200 900 L0 900Z' fill='#d9e4e6'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Motion Lab Physio",
    address: { line: "Çamlık Sokak 21", district: "Suadiye", city: "Kadıköy", region: "İstanbul", postalCode: "34740", country: "TR", geo: { lat: 40.9607, lng: 29.0845 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Ground floor, step-free, with four parking spaces at the back. Showers and lockers if you come from work or a run.", tr: "Zemin kat, basamaksız; arkada dört park yeri. İşten ya da koşudan geliyorsanız duş ve dolap var." }),
  };
}
