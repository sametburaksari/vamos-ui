// Sample content for "Pawbridge Vets", a fictional small-animal practice in Kadıköy.
// Every human-readable field is `{ en, tr }`. No medical claims — services, times and fees only.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Leaf green from the plan; SiteShell derives the four accent variables (contrast-checked). */
export const ACCENT = "#16A34A";

/** Fictional numbers only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@pawbridge.example.com";

/** en-GB and tr-TR both use the 24-hour clock. */
export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const tl = (value: string | number, locale: SiteLocale) => createFormatter(intlOf(locale), { currency: "TRY" }).currency(value, "TRY", { currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

// ---------------------------------------------------------------- pets (the signature switch)

export type PetId = "dog" | "cat" | "rabbit" | "bird";
export const PETS: PetId[] = ["dog", "cat", "rabbit", "bird"];

export interface Pet {
  id: PetId;
  /** Button label ("Dog"). */
  label: L;
  /** Plural used in sentences ("dogs"). */
  plural: L;
  /** Short line about how this species is looked after here. */
  care: L;
  /** Where they wait. */
  waiting: L;
  photo: { src: string; width: number; height: number; focal?: { x: number; y: number }; alt: L };
}

export const pets: Record<PetId, Pet> = {
  dog: {
    id: "dog",
    label: { en: "Dog", tr: "Köpek" },
    plural: { en: "dogs", tr: "köpekler" },
    care: { en: "Puppy courses, yearly boosters, dental care and keyhole neutering.", tr: "Yavru programı, yıllık rapel aşılar, diş bakımı ve kapalı yöntemle kısırlaştırma." },
    waiting: { en: "Dogs wait on the garden side, with water bowls and a weighing scale by the door.", tr: "Köpekler bahçe tarafında bekler; kapının yanında su kapları ve tartı var." },
    photo: { ...unsplash("1587300003388-59208cc962cb", 1200, 1500), focal: { x: 0.45, y: 0.4 }, alt: { en: "A tricolour shepherd dog smiling on a beach", tr: "Kumsalda gülümseyen üç renkli bir çoban köpeği" } },
  },
  cat: {
    id: "cat",
    label: { en: "Cat", tr: "Kedi" },
    plural: { en: "cats", tr: "kediler" },
    care: { en: "A cat-only floor, unhurried 30-minute appointments and senior screening from age 10.", tr: "Yalnızca kedilere ayrılmış bir kat, acelesiz 30 dakikalık randevular ve 10 yaşından sonra yaşlılık taraması." },
    waiting: { en: "Cats wait upstairs, away from dogs, with raised shelves for carriers and covers to borrow.", tr: "Kediler üst katta, köpeklerden uzakta bekler; taşıma çantaları için yüksek raflar ve ödünç örtüler var." },
    photo: { ...unsplash("1596854407944-bf87f6fdd49e", 1200, 1500), focal: { x: 0.5, y: 0.45 }, alt: { en: "A ginger and white cat looking up against a yellow wall", tr: "Sarı bir duvarın önünde yukarı bakan turuncu-beyaz bir kedi" } },
  },
  rabbit: {
    id: "rabbit",
    label: { en: "Rabbit & small pets", tr: "Tavşan ve küçük dostlar" },
    plural: { en: "rabbits and small pets", tr: "tavşanlar ve küçük dostlar" },
    care: { en: "Rabbits, guinea pigs and hamsters: dental checks, vaccinations and gentle handling.", tr: "Tavşan, kobay ve hamsterlar: diş kontrolü, aşılar ve nazik tutuş." },
    waiting: { en: "Small pets go straight to quiet room 3. Bring a little of their usual hay or food.", tr: "Küçük dostlar doğrudan sessiz 3 numaralı odaya alınır. Alıştıkları ot ya da yemden biraz getirin." },
    photo: { ...unsplash("1585110396000-c9ffd4e4b308", 1200, 1500), focal: { x: 0.55, y: 0.45 }, alt: { en: "A white rabbit sitting in green grass", tr: "Yeşil çimenlerde oturan beyaz bir tavşan" } },
  },
  bird: {
    id: "bird",
    label: { en: "Bird", tr: "Kuş" },
    plural: { en: "birds", tr: "kuşlar" },
    care: { en: "Budgies, canaries and parrots, seen by our avian vet on Tuesdays, Thursdays and Saturdays.", tr: "Muhabbet kuşu, kanarya ve papağanlar; kuş hekimimiz salı, perşembe ve cumartesi günleri bakar." },
    waiting: { en: "Bring your bird in a covered carrier; we see birds in a warm room with the fan off.", tr: "Kuşunuzu üstü örtülü bir taşıma kafesinde getirin; kuşlara vantilatörü kapalı, ılık bir odada bakarız." },
    photo: { ...unsplash("1522858547137-f1dcec554f55", 1200, 1500), focal: { x: 0.45, y: 0.5 }, alt: { en: "A pale blue budgie perched on an open hand", tr: "Açık bir avucun üzerinde duran açık mavi bir muhabbet kuşu" } },
  },
};

// ---------------------------------------------------------------- services per pet

export type ServiceGroup = "routine" | "care" | "surgery";

export const groupNames: Record<ServiceGroup, L> = {
  routine: { en: "Routine visits", tr: "Rutin ziyaretler" },
  care: { en: "Tests & ongoing care", tr: "Tahliller ve takip" },
  surgery: { en: "Surgery & dental", tr: "Cerrahi ve diş" },
};

export interface Service {
  id: string;
  group: ServiceGroup;
  name: L;
  text: L;
  /** Minutes in the room; `null` for day-patient procedures. */
  minutes: number | null;
  fee: string;
  /** "from" price (surgery depends on weight). */
  from?: boolean;
  /** Shown on the home page short list. */
  featured?: boolean;
}

export const services: Record<PetId, Service[]> = {
  dog: [
    { id: "dog-check", group: "routine", featured: true, name: { en: "Health check & consultation", tr: "Sağlık kontrolü ve muayene" }, text: { en: "Nose-to-tail check, weight and a plan written down for you.", tr: "Burundan kuyruğa kontrol, tartı ve size yazılı bir plan." }, minutes: 30, fee: "1250" },
    { id: "dog-vacc", group: "routine", featured: true, name: { en: "Vaccination (DHPPi + rabies)", tr: "Aşı (karma + kuduz)" }, text: { en: "Includes a short check and the next due date in your pet passport.", tr: "Kısa bir kontrol ve bir sonraki tarih pet pasaportuna işlenir." }, minutes: 20, fee: "950" },
    { id: "dog-puppy", group: "routine", featured: true, name: { en: "Puppy course (3 visits)", tr: "Yavru programı (3 ziyaret)" }, text: { en: "Three vaccinations, microchip, worming and a behaviour chat at 8, 12 and 16 weeks.", tr: "8, 12 ve 16. haftalarda üç aşı, mikroçip, parazit uygulaması ve davranış sohbeti." }, minutes: 30, fee: "3600" },
    { id: "dog-chip", group: "routine", name: { en: "Microchip & pet passport", tr: "Mikroçip ve pet pasaportu" }, text: { en: "Registered to you the same day.", tr: "Aynı gün adınıza kaydedilir." }, minutes: 15, fee: "800" },
    { id: "dog-nails", group: "routine", name: { en: "Nail clip & anal glands", tr: "Tırnak kesimi ve anal bez" }, text: { en: "A nurse appointment, often done in the car park for nervous dogs.", tr: "Hemşire randevusu; ürkek köpekler için çoğu zaman otoparkta yapılır." }, minutes: 15, fee: "350" },
    { id: "dog-senior", group: "care", featured: true, name: { en: "Senior blood screen", tr: "Yaşlılık kan taraması" }, text: { en: "Kidney, liver and thyroid panel from age 8, results the same afternoon.", tr: "8 yaşından sonra böbrek, karaciğer ve tiroit paneli; sonuçlar aynı öğleden sonra." }, minutes: 30, fee: "2200" },
    { id: "dog-weight", group: "care", name: { en: "Weight clinic", tr: "Kilo takibi" }, text: { en: "Monthly weigh-in and a feeding plan with our nurse.", tr: "Hemşiremizle aylık tartı ve beslenme planı." }, minutes: 20, fee: "450" },
    { id: "dog-xray", group: "care", name: { en: "X-ray & ultrasound", tr: "Röntgen ve ultrason" }, text: { en: "Usually the same day as the consultation that asks for it.", tr: "Genellikle isteyen muayeneyle aynı gün." }, minutes: 45, fee: "2900", from: true },
    { id: "dog-dental", group: "surgery", name: { en: "Dental scale & polish", tr: "Diş taşı temizliği ve cila" }, text: { en: "Under general anaesthetic as a day patient; home by 17:00.", tr: "Genel anestezi altında, günübirlik; 17:00’de evde." }, minutes: null, fee: "6400", from: true },
    { id: "dog-neuter", group: "surgery", name: { en: "Neutering (keyhole spay or castration)", tr: "Kısırlaştırma (kapalı yöntem)" }, text: { en: "Price by weight; includes the pre-op check, pain relief and two re-checks.", tr: "Fiyat kiloya göre; ameliyat öncesi kontrol, ağrı kesici ve iki kontrol dahil." }, minutes: null, fee: "7200", from: true },
  ],
  cat: [
    { id: "cat-check", group: "routine", featured: true, name: { en: "Cat-friendly consultation", tr: "Kedi dostu muayene" }, text: { en: "A quiet room, the carrier lid off, and as long as your cat needs.", tr: "Sessiz bir oda, taşıma çantasının kapağı açık ve kediniz ne kadar isterse o kadar süre." }, minutes: 30, fee: "1250" },
    { id: "cat-vacc", group: "routine", featured: true, name: { en: "Vaccination (tricat + rabies)", tr: "Aşı (üçlü karma + kuduz)" }, text: { en: "Includes a short check and the next due date in the passport.", tr: "Kısa bir kontrol ve bir sonraki tarih pasaporta işlenir." }, minutes: 20, fee: "900" },
    { id: "cat-kitten", group: "routine", featured: true, name: { en: "Kitten course (2 visits)", tr: "Yavru kedi programı (2 ziyaret)" }, text: { en: "Two vaccinations, microchip, worming and a feeding talk at 9 and 12 weeks.", tr: "9 ve 12. haftalarda iki aşı, mikroçip, parazit uygulaması ve beslenme sohbeti." }, minutes: 30, fee: "2600" },
    { id: "cat-chip", group: "routine", name: { en: "Microchip & pet passport", tr: "Mikroçip ve pet pasaportu" }, text: { en: "Registered to you the same day.", tr: "Aynı gün adınıza kaydedilir." }, minutes: 15, fee: "800" },
    { id: "cat-senior", group: "care", featured: true, name: { en: "Senior screen (kidney & thyroid)", tr: "Yaşlılık taraması (böbrek ve tiroit)" }, text: { en: "Blood, urine and blood pressure from age 10, explained the same day.", tr: "10 yaşından sonra kan, idrar ve tansiyon; aynı gün açıklanır." }, minutes: 30, fee: "2400" },
    { id: "cat-bp", group: "care", name: { en: "Blood pressure re-check", tr: "Tansiyon kontrolü" }, text: { en: "A nurse appointment in the cat room, carrier on your lap.", tr: "Kedi odasında hemşire randevusu; çanta kucağınızda." }, minutes: 20, fee: "500" },
    { id: "cat-dental", group: "surgery", name: { en: "Dental scale & polish", tr: "Diş taşı temizliği ve cila" }, text: { en: "Day patient, dental X-rays included.", tr: "Günübirlik; diş röntgenleri dahil." }, minutes: null, fee: "5900", from: true },
    { id: "cat-neuter", group: "surgery", name: { en: "Neutering", tr: "Kısırlaştırma" }, text: { en: "Castration from 4.800 ₺, spay from 6.200 ₺; home the same evening.", tr: "Erkek 4.800 ₺, dişi 6.200 ₺’den başlar; aynı akşam evde." }, minutes: null, fee: "4800", from: true },
  ],
  rabbit: [
    { id: "rab-check", group: "routine", featured: true, name: { en: "Small-pet health check", tr: "Küçük dost sağlık kontrolü" }, text: { en: "Teeth, weight, skin and diet for rabbits, guinea pigs and hamsters.", tr: "Tavşan, kobay ve hamsterlar için diş, kilo, deri ve beslenme." }, minutes: 30, fee: "1100" },
    { id: "rab-vacc", group: "routine", featured: true, name: { en: "Rabbit vaccination (Myxo-RHD)", tr: "Tavşan aşısı (Myxo-RHD)" }, text: { en: "Once a year, from five weeks old.", tr: "Yılda bir; beş haftalıktan itibaren." }, minutes: 20, fee: "1050" },
    { id: "rab-teeth", group: "care", featured: true, name: { en: "Teeth check & trim", tr: "Diş kontrolü ve törpüleme" }, text: { en: "Overgrown incisors trimmed with a burr, never clipped.", tr: "Uzamış ön dişler kesilmez, törpüyle düzeltilir." }, minutes: 30, fee: "1700" },
    { id: "rab-nails", group: "routine", name: { en: "Nail clip", tr: "Tırnak kesimi" }, text: { en: "With a nurse, wrapped in a towel if your pet prefers.", tr: "Hemşireyle; isterse bir havluya sarılarak." }, minutes: 15, fee: "250" },
    { id: "rab-gp", group: "care", featured: true, name: { en: "Guinea pig & hamster visit", tr: "Kobay ve hamster muayenesi" }, text: { en: "Short, warm and quiet; we weigh in grams.", tr: "Kısa, ılık ve sessiz; gram hassasiyetinde tartarız." }, minutes: 20, fee: "750" },
    { id: "rab-neuter", group: "surgery", name: { en: "Rabbit neutering", tr: "Tavşan kısırlaştırma" }, text: { en: "Day patient with rabbit-specific anaesthesia and a recovery hutch.", tr: "Tavşana özel anesteziyle günübirlik; dinlenme kafesiyle." }, minutes: null, fee: "5400", from: true },
  ],
  bird: [
    { id: "bird-check", group: "routine", featured: true, name: { en: "Avian consultation", tr: "Kuş muayenesi" }, text: { en: "Weight, feathers, beak and droppings, with Dr Okan Erten.", tr: "Dr. Okan Erten ile kilo, tüy, gaga ve dışkı kontrolü." }, minutes: 40, fee: "1500" },
    { id: "bird-trim", group: "routine", featured: true, name: { en: "Beak & nail trim", tr: "Gaga ve tırnak düzeltme" }, text: { en: "Only when needed — we will show you perches that help.", tr: "Yalnızca gerektiğinde — yardımcı olacak tünekleri de gösteririz." }, minutes: 20, fee: "450" },
    { id: "bird-faecal", group: "care", featured: true, name: { en: "Droppings & crop test", tr: "Dışkı ve kursak testi" }, text: { en: "Microscope check while you wait.", tr: "Siz beklerken mikroskop kontrolü." }, minutes: 20, fee: "900" },
    { id: "bird-dna", group: "care", name: { en: "DNA sexing", tr: "DNA ile cinsiyet tayini" }, text: { en: "From a feather sample; results in five working days.", tr: "Tüy örneğinden; sonuç beş iş günü içinde." }, minutes: 15, fee: "1200" },
    { id: "bird-ring", group: "care", featured: true, name: { en: "Leg ring removal", tr: "Ayak halkası çıkarma" }, text: { en: "For a tight or damaged ring, under light sedation if needed.", tr: "Sıkan ya da hasarlı halkalar için; gerekirse hafif sedasyonla." }, minutes: 30, fee: "1400" },
  ],
};

export const serviceById = (pet: PetId, id: string) => services[pet].find((s) => s.id === id);

/** First-year visits shown on the services page, per species. */
export const firstYear: Record<PetId, { when: L; what: L }[]> = {
  dog: [
    { when: { en: "8 weeks", tr: "8. hafta" }, what: { en: "First vaccination, microchip, worming", tr: "İlk aşı, mikroçip, parazit" } },
    { when: { en: "12 weeks", tr: "12. hafta" }, what: { en: "Second vaccination, flea plan", tr: "İkinci aşı, pire planı" } },
    { when: { en: "16 weeks", tr: "16. hafta" }, what: { en: "Rabies, passport, behaviour chat", tr: "Kuduz, pasaport, davranış sohbeti" } },
    { when: { en: "6 months", tr: "6. ay" }, what: { en: "Neutering talk, dental check", tr: "Kısırlaştırma görüşmesi, diş kontrolü" } },
    { when: { en: "15 months", tr: "15. ay" }, what: { en: "First yearly booster", tr: "İlk yıllık rapel" } },
  ],
  cat: [
    { when: { en: "9 weeks", tr: "9. hafta" }, what: { en: "First vaccination, microchip", tr: "İlk aşı, mikroçip" } },
    { when: { en: "12 weeks", tr: "12. hafta" }, what: { en: "Second vaccination, rabies", tr: "İkinci aşı, kuduz" } },
    { when: { en: "5 months", tr: "5. ay" }, what: { en: "Neutering", tr: "Kısırlaştırma" } },
    { when: { en: "15 months", tr: "15. ay" }, what: { en: "First yearly booster", tr: "İlk yıllık rapel" } },
  ],
  rabbit: [
    { when: { en: "5 weeks", tr: "5. hafta" }, what: { en: "Myxo-RHD vaccination", tr: "Myxo-RHD aşısı" } },
    { when: { en: "4 months", tr: "4. ay" }, what: { en: "Teeth and diet check", tr: "Diş ve beslenme kontrolü" } },
    { when: { en: "5 months", tr: "5. ay" }, what: { en: "Neutering", tr: "Kısırlaştırma" } },
    { when: { en: "Every 12 months", tr: "Her 12 ayda" }, what: { en: "Booster and teeth check", tr: "Rapel ve diş kontrolü" } },
  ],
  bird: [
    { when: { en: "First week home", tr: "Evdeki ilk hafta" }, what: { en: "Avian consultation and droppings test", tr: "Kuş muayenesi ve dışkı testi" } },
    { when: { en: "3 months", tr: "3. ay" }, what: { en: "Weight and feather check", tr: "Kilo ve tüy kontrolü" } },
    { when: { en: "Every 12 months", tr: "Her 12 ayda" }, what: { en: "Yearly avian check", tr: "Yıllık kuş kontrolü" } },
  ],
};

// ---------------------------------------------------------------- team

export interface Vet {
  id: string;
  title?: L;
  name: string;
  role: L;
  focus: L;
  bio: L;
  pets: PetId[];
  /** 1 = Monday … 6 = Saturday, 0 = Sunday. */
  days: number[];
  photo: { src: string; width: number; height: number; focal?: { x: number; y: number }; alt: L };
}

export const team: Vet[] = [
  {
    id: "arikan",
    title: { en: "Dr", tr: "Vet. Hek." },
    name: "Deniz Arıkan",
    role: { en: "Clinical director", tr: "Klinik direktörü" },
    focus: { en: "Soft-tissue surgery · keyhole neutering", tr: "Yumuşak doku cerrahisi · kapalı kısırlaştırma" },
    bio: { en: "Opened Pawbridge in 2015 after eight years in a referral hospital. Operates on Mondays and Wednesdays.", tr: "Bir sevk hastanesinde sekiz yılın ardından Pawbridge’i 2015’te açtı. Pazartesi ve çarşamba ameliyat yapar." },
    pets: ["dog", "cat"],
    days: [1, 2, 3, 5],
    photo: { ...unsplash("1612531386530-97286d97c2d2", 800, 1000), alt: { en: "Dr Deniz Arıkan with a stethoscope, arms folded", tr: "Stetoskobuyla, kollarını kavuşturmuş Vet. Hek. Deniz Arıkan" } },
  },
  {
    id: "korkmaz",
    title: { en: "Dr", tr: "Vet. Hek." },
    name: "Selin Korkmaz",
    role: { en: "Veterinary surgeon", tr: "Veteriner hekim" },
    focus: { en: "Feline medicine · senior cats", tr: "Kedi hekimliği · yaşlı kediler" },
    bio: { en: "Runs the cat-only floor and the senior screening clinic. Shares her flat with two elderly tabbies.", tr: "Kedilere ayrılan katı ve yaşlılık taraması polikliniğini yürütür. Evini iki yaşlı tekir kediyle paylaşıyor." },
    pets: ["cat"],
    days: [2, 3, 4, 6],
    photo: { ...unsplash("1544005313-94ddf0286df2", 800, 1000), alt: { en: "Dr Selin Korkmaz, smiling, in a striped top", tr: "Çizgili üstüyle gülümseyen Vet. Hek. Selin Korkmaz" } },
  },
  {
    id: "erten",
    title: { en: "Dr", tr: "Vet. Hek." },
    name: "Okan Erten",
    role: { en: "Veterinary surgeon, exotics", tr: "Veteriner hekim, egzotik hayvanlar" },
    focus: { en: "Birds · rabbits · small mammals", tr: "Kuşlar · tavşanlar · küçük memeliler" },
    bio: { en: "Our avian and rabbit vet; brings a gram scale and endless patience to every appointment.", tr: "Kuş ve tavşan hekimimiz; her randevuya gram terazisi ve bitmez bir sabır getirir." },
    pets: ["rabbit", "bird", "dog"],
    days: [2, 4, 6],
    photo: { ...unsplash("1472099645785-5658abf4ff4e", 800, 1000), alt: { en: "Dr Okan Erten in a dark green polo shirt", tr: "Koyu yeşil polo tişörtlü Vet. Hek. Okan Erten" } },
  },
  {
    id: "tan",
    name: "Melis Tan",
    role: { en: "Head veterinary nurse", tr: "Sorumlu veteriner hemşire" },
    focus: { en: "Weight clinics · puppy & kitten visits", tr: "Kilo takibi · yavru ziyaretleri" },
    bio: { en: "Runs the nurse clinics and answers the out-of-hours phone one week in three.", tr: "Hemşire polikliniklerini yürütür; üç haftada bir mesai dışı telefona bakar." },
    pets: ["dog", "cat", "rabbit"],
    days: [1, 2, 3, 4, 5],
    photo: { ...unsplash("1488426862026-3ee34a7d66df", 800, 1000), alt: { en: "Melis Tan, dark hair tied up, in a denim jacket", tr: "Saçları toplu, kot ceketli Melis Tan" } },
  },
];

export const photos = {
  room: { ...unsplash("1628009368231-7bb7cfcb0def", 1400, 1750), alt: { en: "A vet gently examining a tabby cat on the table", tr: "Masada bir tekir kediyi nazikçe muayene eden veteriner" } },
  dogs: { ...unsplash("1548199973-03cce0bbc87b", 1600, 1067), alt: { en: "Two small dogs running towards the camera on a path", tr: "Bir patikada kameraya doğru koşan iki küçük köpek" } },
};

// ---------------------------------------------------------------- place

export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "08:30", close: "20:00" }],
    tue: [{ open: "08:30", close: "20:00" }],
    wed: [{ open: "08:30", close: "20:00" }],
    thu: [{ open: "08:30", close: "20:00" }],
    fri: [{ open: "08:30", close: "20:00" }],
    sat: [{ open: "09:00", close: "17:00" }],
    sun: [{ open: "10:00", close: "14:00" }],
  },
};

const streetSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f3f4f1'/>" +
  "<g fill='#e4e7e1'>" +
  Array.from({ length: 30 }, (_, i) => `<rect x='${(i % 6) * 200 + 14}' y='${Math.floor(i / 6) * 180 + 14}' width='172' height='152' rx='10'/>`).join("") +
  "</g><path d='M-20 560 C300 520 520 640 1220 470' fill='none' stroke='#ffffff' stroke-width='26' stroke-linecap='round'/>" +
  "<path d='M420 -20 C450 300 380 600 470 920' fill='none' stroke='#ffffff' stroke-width='20' stroke-linecap='round'/>" +
  "<ellipse cx='930' cy='230' rx='170' ry='110' fill='#dfe6db'/></svg>";
export const streetMap = { src: `data:image/svg+xml,${encodeURIComponent(streetSvg)}`, width: 1200, height: 900, alt: "" };

export function branch(t: (v: Localized<string>) => string): Branch {
  return {
    name: "Pawbridge Vets",
    address: { line: "Çınarlı Sokak 12", district: "Caferağa Mahallesi", city: "Kadıköy", region: "İstanbul", postalCode: "34710", country: "TR", geo: { lat: 40.9862, lng: 29.0262 } },
    phone: PHONE,
    email: EMAIL,
    hours,
    mapImage: streetMap,
    notes: t({ en: "Two parking spaces at the door for pets that cannot walk far. Step-free entrance; cats use the side door to the stairs.", tr: "Yürümekte zorlanan dostlar için kapının önünde iki park yeri. Basamaksız giriş; kediler yan kapıdan merdivene çıkar." }),
  };
}
