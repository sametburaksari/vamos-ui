// Candidates for the Senior Backend Engineer role (openRoles r-1 in _shared/hr), with the
// scorecard, assessment and offer facts the compare view lines up. All people are fictional.
import type { L } from "../../_shared/l10n";
import { openRoles } from "../../_shared/hr";
import { person } from "../../_shared/people";
import { day } from "../../_shared/time";

export const role = openRoles.find((r) => r.id === "r-1")!;
export const hiringManager = person(role.hiringManagerId);

/** Monthly gross salary band, TRY. */
export const band = { min: 165_000, max: 210_000 };

export type Stage = "screen" | "onsite" | "final" | "offer" | "rejected";
export const stageLabels: Record<Stage, L> = {
  screen: { en: "Phone screen", tr: "Ön görüşme" },
  onsite: { en: "Technical interviews", tr: "Teknik mülakatlar" },
  final: { en: "Final round", tr: "Son tur" },
  offer: { en: "Offer", tr: "Teklif" },
  rejected: { en: "Rejected", tr: "Elendi" },
};

export type WorkModel = "office" | "hybrid" | "remote";
export const workModelLabels: Record<WorkModel, L> = {
  office: { en: "Office", tr: "Ofis" },
  hybrid: { en: "Hybrid", tr: "Hibrit" },
  remote: { en: "Remote", tr: "Uzaktan" },
};

export type Recommendation = "strong-yes" | "yes" | "no";

export const competencies: Array<{ key: string; label: L }> = [
  { key: "design", label: { en: "System design", tr: "Sistem tasarımı" } },
  { key: "backend", label: { en: "Backend depth (Go, Postgres)", tr: "Backend derinliği (Go, Postgres)" } },
  { key: "ops", label: { en: "Production & on-call", tr: "Canlı ortam ve nöbet" } },
  { key: "communication", label: { en: "Communication", tr: "İletişim" } },
  { key: "ownership", label: { en: "Ownership", tr: "Sahiplenme" } },
];

export interface Candidate {
  id: string;
  name: string;
  current: L;
  location: string;
  workModel: WorkModel;
  years: number;
  stage: Stage;
  source: L;
  /** 1–4 per competency (averaged across interviewers). */
  scores: Record<string, number>;
  takeHome: number;
  interviews: number;
  recommendations: Recommendation[];
  /** Monthly gross, TRY. */
  salary: number;
  noticeWeeks: number;
  references: "done" | "pending" | "not-started";
  languages: string[];
  /** CEFR level from the English interview. */
  english: "B2" | "C1" | "C2";
  /** Hired as an employee in Türkiye or through an employer of record abroad. */
  contract: "employee" | "eor";
  onCall: boolean;
  strengths: L;
  concerns: L;
  appliedOn: string;
}

export const candidates: Candidate[] = [
  {
    id: "cd-1",
    name: "Ezgi Tanrıverdi",
    current: { en: "Backend Engineer · Lumen Parcel", tr: "Backend Geliştirici · Lumen Parcel" },
    location: "Istanbul",
    workModel: "hybrid",
    years: 7,
    stage: "final",
    source: { en: "Referral · Yusuf Erdem", tr: "Tavsiye · Yusuf Erdem" },
    scores: { design: 3.5, backend: 3.8, ops: 3.4, communication: 3.2, ownership: 3.6 },
    takeHome: 88,
    interviews: 4,
    recommendations: ["strong-yes", "yes", "yes", "yes"],
    salary: 195_000,
    noticeWeeks: 4,
    references: "done",
    languages: ["Turkish", "English"],
    english: "C1",
    contract: "employee",
    onCall: true,
    strengths: { en: "Rebuilt a parcel-routing service that handles 2M events a day; clear, careful trade-offs in the design round.", tr: "Günde 2 milyon olay işleyen paket yönlendirme servisini yeniden yazdı; tasarım turunda net ve dikkatli ödünleşimler." },
    concerns: { en: "Has not led people yet; asked about a staff path within two years.", tr: "Henüz ekip yönetmedi; iki yıl içinde staff yolunu sordu." },
    appliedOn: day(-29),
  },
  {
    id: "cd-2",
    name: "Marek Wójcik",
    current: { en: "Senior Engineer · Ledgerfox Payments", tr: "Kıdemli Mühendis · Ledgerfox Payments" },
    location: "Kraków",
    workModel: "remote",
    years: 10,
    stage: "final",
    source: { en: "Careers page", tr: "Kariyer sayfası" },
    scores: { design: 3.9, backend: 3.6, ops: 3.8, communication: 3.0, ownership: 3.4 },
    takeHome: 92,
    interviews: 4,
    recommendations: ["strong-yes", "yes", "yes", "no"],
    salary: 228_000,
    noticeWeeks: 12,
    references: "pending",
    languages: ["Polish", "English"],
    english: "C1",
    contract: "eor",
    onCall: true,
    strengths: { en: "Deep on-call experience with payment ledgers; best system-design session this quarter.", tr: "Ödeme defterlerinde derin nöbet deneyimi; bu çeyreğin en iyi sistem tasarımı oturumu." },
    concerns: { en: "Above the band; three-month notice; one interviewer found feedback discussions terse.", tr: "Bandın üstünde; üç ay ihbar süresi; bir mülakatçı geri bildirim konuşmalarını kısa buldu." },
    appliedOn: day(-33),
  },
  {
    id: "cd-3",
    name: "Selim Akarsu",
    current: { en: "Software Engineer · Pusulam Haritalar", tr: "Yazılım Mühendisi · Pusulam Haritalar" },
    location: "Ankara",
    workModel: "hybrid",
    years: 5,
    stage: "onsite",
    source: { en: "Sourced · outreach", tr: "Kaynak · doğrudan ulaşım" },
    scores: { design: 3.0, backend: 3.5, ops: 2.8, communication: 3.7, ownership: 3.5 },
    takeHome: 84,
    interviews: 3,
    recommendations: ["yes", "yes", "yes"],
    salary: 172_000,
    noticeWeeks: 4,
    references: "not-started",
    languages: ["Turkish", "English", "German"],
    english: "C1",
    contract: "employee",
    onCall: true,
    strengths: { en: "Strongest communicator in the loop; mentors two juniors and writes the team’s RFCs.", tr: "Süreçteki en güçlü iletişimci; iki yeni mezuna mentorluk yapıyor ve ekibin RFC’lerini yazıyor." },
    concerns: { en: "Little production on-call; would need a ramp-up on incident work.", tr: "Canlı ortam nöbet deneyimi az; olay yönetiminde alışma süresi gerekir." },
    appliedOn: day(-21),
  },
  {
    id: "cd-4",
    name: "Thandiwe Mokoena",
    current: { en: "Platform Engineer · Wattfield Grid", tr: "Platform Mühendisi · Wattfield Grid" },
    location: "Lisbon",
    workModel: "remote",
    years: 8,
    stage: "onsite",
    source: { en: "Agency · Brindle Talent", tr: "Ajans · Brindle Talent" },
    scores: { design: 3.4, backend: 3.2, ops: 3.9, communication: 3.5, ownership: 3.8 },
    takeHome: 79,
    interviews: 2,
    recommendations: ["yes", "strong-yes"],
    salary: 205_000,
    noticeWeeks: 8,
    references: "not-started",
    languages: ["English", "Portuguese"],
    english: "C2",
    contract: "eor",
    onCall: true,
    strengths: { en: "Owns the Kubernetes platform for 40 services; calm and precise under the incident drill.", tr: "40 servislik Kubernetes platformunun sahibi; olay tatbikatında sakin ve net." },
    concerns: { en: "Go is a second language; two interviews still to come.", tr: "Go ikinci dili; iki mülakat daha var." },
    appliedOn: day(-17),
  },
  {
    id: "cd-5",
    name: "Arda Yalçınkaya",
    current: { en: "Backend Developer · Fırınkapı Studio", tr: "Backend Geliştirici · Fırınkapı Studio" },
    location: "Izmir",
    workModel: "office",
    years: 4,
    stage: "screen",
    source: { en: "Careers page", tr: "Kariyer sayfası" },
    scores: { design: 2.6, backend: 3.1, ops: 2.5, communication: 3.3, ownership: 3.0 },
    takeHome: 71,
    interviews: 1,
    recommendations: ["yes"],
    salary: 150_000,
    noticeWeeks: 2,
    references: "not-started",
    languages: ["Turkish", "English"],
    english: "B2",
    contract: "employee",
    onCall: false,
    strengths: { en: "Quick learner; shipped a booking API from zero in four months.", tr: "Hızlı öğreniyor; dört ayda sıfırdan bir rezervasyon API’si çıkardı." },
    concerns: { en: "Closer to mid-level for this role.", tr: "Bu rol için orta seviyeye daha yakın." },
    appliedOn: day(-9),
  },
];

export const referenceLabels: Record<Candidate["references"], L> = {
  done: { en: "Checked", tr: "Kontrol edildi" },
  pending: { en: "In progress", tr: "Sürüyor" },
  "not-started": { en: "Not started", tr: "Başlamadı" },
};

export const contractLabels: Record<Candidate["contract"], L> = {
  employee: { en: "Employee · Türkiye", tr: "Bordrolu · Türkiye" },
  eor: { en: "Employer of record", tr: "Yurt dışı işveren hizmeti (EoR)" },
};
