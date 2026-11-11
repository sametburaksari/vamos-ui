// Field service app data: the shared field jobs plus the rest of one technician's route,
// job checklists and the dispatch inbox. Times are relative to the fixtures' NOW (10:24).
import type { L } from "../../_shared/l10n";
import { fieldJobs, istanbulBounds, jobStatusLabels, technicianPositions, type FieldJob, type JobStatus } from "../../_shared/geo";
import { person, type Person } from "../../_shared/people";
import { minutesFromNow } from "../../_shared/time";

export { istanbulBounds, jobStatusLabels, technicianPositions };
export type { FieldJob, JobStatus };

/** The technician using the app. */
export const tech: Person = person("p-malik");
export const dispatcher: Person = person("p-defne");

export interface Job extends FieldJob {
  ref: string;
  address: string;
  phone: string;
  /** Minutes on site, planned. */
  duration: number;
  note: L;
  checklist: Array<{ id: string; label: L; done: boolean }>;
  parts: Array<{ sku: string; name: L; qty: number }>;
  /** Signed off by the customer. */
  signed?: boolean;
}

const check = (...items: Array<[string, string]>) => items.map(([en, tr], i) => ({ id: `c${i}`, label: { en, tr }, done: false }));

const extra: Record<string, Pick<Job, "ref" | "address" | "phone" | "duration" | "note" | "checklist" | "parts" | "signed">> = {
  "jb-1": {
    ref: "FS-20418",
    address: "Ergenekon Cd. 112, D:6, Şişli",
    phone: "+90 216 000 00 41",
    duration: 90,
    note: { en: "Three pendants over the dining table. Ceiling is concrete — bring the long anchors. Customer works from home, ring once.", tr: "Yemek masasının üstüne üç sarkıt lamba. Tavan beton, uzun dübelleri getir. Müşteri evden çalışıyor, bir kez çal." },
    checklist: check(["Power off at the breaker", "Sigortayı kapat"], ["Mount the canopy plates", "Tavan göbeklerini monte et"], ["Hang and level all three", "Üçünü de as ve hizala"], ["Test each light and the dimmer", "Her lambayı ve dimmer'ı test et"], ["Photo of the finished install", "Bitmiş montajın fotoğrafı"]),
    parts: [{ sku: "LT-PND-03", name: { en: "Pendant, smoked glass", tr: "Sarkıt lamba, füme cam" }, qty: 3 }, { sku: "AN-10X80", name: { en: "Ceiling anchor 10×80", tr: "Tavan dübeli 10×80" }, qty: 6 }],
  },
  "jb-5": {
    ref: "FS-20402",
    address: "Cendere Cd. 24, Kağıthane",
    phone: "+90 216 000 00 42",
    duration: 30,
    note: { en: "Collect the boxed side table from the concierge.", tr: "Kutulu sehpayı danışmadan teslim al." },
    checklist: check(["Check the item against the return", "Ürünü iade kaydıyla karşılaştır"], ["Photo of the packaging", "Ambalajın fotoğrafı"]),
    parts: [],
    signed: true,
  },
  "jb-7": {
    ref: "FS-20431",
    address: "Büyükdere Cd. 201, Kat 4, Levent",
    phone: "+90 216 000 00 43",
    duration: 60,
    note: { en: "Office reception: wall shelves behind the desk. Building security needs the van plate 30 minutes ahead.", tr: "Ofis resepsiyonu: masa arkasına duvar rafları. Bina güvenliği araç plakasını 30 dakika önceden istiyor." },
    checklist: check(["Send plate to security", "Plakayı güvenliğe gönder"], ["Find studs and mark the line", "Dikmeleri bul ve hattı işaretle"], ["Fix brackets and shelves", "Konsolları ve rafları sabitle"], ["Load test each shelf", "Her rafa yük testi yap"]),
    parts: [{ sku: "SH-OAK-120", name: { en: "Oak shelf 120 cm", tr: "Meşe raf 120 cm" }, qty: 3 }, { sku: "BR-STL-B", name: { en: "Steel bracket, black", tr: "Çelik konsol, siyah" }, qty: 6 }],
  },
  "jb-8": {
    ref: "FS-20436",
    address: "Nispetiye Cd. 58, Etiler",
    phone: "+90 216 000 00 44",
    duration: 45,
    note: { en: "Swap the cracked mirror for the replacement (in the van since Monday).", tr: "Çatlak aynayı yedeğiyle değiştir (pazartesiden beri araçta)." },
    checklist: check(["Remove the old mirror safely", "Eski aynayı güvenle sök"], ["Fit the replacement", "Yenisini tak"], ["Customer sign-off", "Müşteri onayı"]),
    parts: [{ sku: "MR-ARC-90", name: { en: "Arched mirror 90 cm", tr: "Kemerli ayna 90 cm" }, qty: 1 }],
  },
};

const mine: Job[] = [
  { ...fieldJobs.find((j) => j.id === "jb-5")!, ...extra["jb-5"]! },
  { ...fieldJobs.find((j) => j.id === "jb-1")!, ...extra["jb-1"]! },
  {
    id: "jb-7",
    title: { en: "Fit reception shelving", tr: "Resepsiyon rafı montajı" },
    customer: "Northpine Studio",
    district: "Beşiktaş",
    lat: 41.081,
    lng: 29.011,
    status: "unassigned",
    technicianId: "p-malik",
    windowStart: minutesFromNow(96),
    windowEnd: minutesFromNow(156),
    ...extra["jb-7"]!,
  },
  {
    id: "jb-8",
    title: { en: "Replace mirror", tr: "Ayna değişimi" },
    customer: "Derin Aydemir",
    district: "Beşiktaş",
    lat: 41.071,
    lng: 29.033,
    status: "unassigned",
    technicianId: "p-malik",
    windowStart: minutesFromNow(216),
    windowEnd: minutesFromNow(276),
    ...extra["jb-8"]!,
  },
];

/** Status steps a technician moves a job through. "unassigned" reads as "Scheduled" in the app. */
export const steps: JobStatus[] = ["unassigned", "en-route", "on-site", "done"];
export const stepLabels: Record<JobStatus, L> = { ...jobStatusLabels, unassigned: { en: "Scheduled", tr: "Planlandı" } };

/** The rest of the team's jobs today (map and Jobs tab), from the shared fixture. */
const teamJobs: Job[] = fieldJobs
  .filter((j) => !mine.some((m) => m.id === j.id))
  .map((j, i) => ({
    ...j,
    ref: `FS-2042${i}`,
    address: `${j.district}`,
    phone: "+90 216 000 00 50",
    duration: 60,
    note: { en: "", tr: "" },
    checklist: [],
    parts: [],
  }));

export const initialJobs = (): Job[] => [...mine, ...teamJobs].map((j) => ({ ...j, checklist: j.checklist.map((c) => ({ ...c })) }));
export const isMine = (j: Job) => j.technicianId === tech.id;

export interface DispatchMessage {
  id: string;
  fromId: string;
  at: string;
  subject: L;
  body: L;
  jobId?: string;
  unread: boolean;
}

export const initialMessages: DispatchMessage[] = [
  { id: "dm-1", fromId: "p-defne", at: minutesFromNow(-8), subject: { en: "Levent job moved up", tr: "Levent işi öne alındı" }, body: { en: "Northpine asked for 12:00 instead of 14:00. I've swapped it with the Etiler mirror — security has your plate.", tr: "Northpine 14:00 yerine 12:00'yi istedi. Etiler aynasıyla yer değiştirdim, güvenlikte plakan var." }, jobId: "jb-7", unread: true },
  { id: "dm-2", fromId: "p-ruth", at: minutesFromNow(-55), subject: { en: "Shelf brackets restocked", tr: "Raf konsolları tamamlandı" }, body: { en: "Twelve black brackets added to your van stock. Scan them when you load at Esenyurt.", tr: "Araç stoğuna on iki siyah konsol eklendi. Esenyurt'ta yüklerken okut." }, unread: true },
  { id: "dm-3", fromId: "p-selin", at: minutesFromNow(-140), subject: { en: "Spare dimmer?", tr: "Yedek dimmer?" }, body: { en: "If you have a spare dimmer module, I'm in Üsküdar until 13:00.", tr: "Yedek dimmer modülün varsa 13:00'e kadar Üsküdar'dayım." }, unread: false },
  { id: "dm-4", fromId: "p-defne", at: minutesFromNow(-210), subject: { en: "Shift plan for today", tr: "Bugünün vardiya planı" }, body: { en: "Four stops, around 46 km. Lunch window 13:00–13:45. Drive safe.", tr: "Dört durak, yaklaşık 46 km. Öğle arası 13:00–13:45. İyi yolculuklar." }, unread: false },
];

/** The van's last fix, for the map. */
export const vanPosition = technicianPositions.find((p) => p.personId === tech.id)!;
