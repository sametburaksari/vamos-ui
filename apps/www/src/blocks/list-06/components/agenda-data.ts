// Room bookings at Kestrel Works, a fictional coworking space in Moda, Istanbul. Members are the
// shared fictional companies, so a CRM account and a coworking member can be the same firm.
import type { L } from "../../_shared/l10n";
import { at, day } from "../../_shared/time";

export type BookingStatus = "confirmed" | "tentative" | "checked-in" | "cancelled";
export type Extra = "coffee" | "lunch" | "screen" | "recording" | "whiteboard";

export interface Room {
  id: string;
  name: string;
  floor: L;
  seats: number;
  /** Credits per hour. */
  rate: number;
  /** Token colour of the room's rail. */
  tone: "bg-chart-1" | "bg-chart-2" | "bg-chart-3" | "bg-chart-4" | "bg-chart-5" | "bg-chart-6";
}

export interface RoomBooking {
  id: string;
  /** ISO (+03:00). */
  start: string;
  end: string;
  title: L;
  host: string;
  company: string;
  roomId: string;
  guests: number;
  status: BookingStatus;
  extras: Extra[];
  /** Visitors to register at the front desk. */
  visitors?: string[];
  note?: L;
}

export const rooms: Room[] = [
  { id: "rm-bos", name: "Bosphorus", floor: { en: "4th floor · boardroom", tr: "4. kat · toplantı salonu" }, seats: 14, rate: 6, tone: "bg-chart-1" },
  { id: "rm-ate", name: "Atelier", floor: { en: "3rd floor · workshop room", tr: "3. kat · atölye odası" }, seats: 8, rate: 4, tone: "bg-chart-2" },
  { id: "rm-s3", name: "Studio 3", floor: { en: "3rd floor · huddle room", tr: "3. kat · küçük toplantı odası" }, seats: 4, rate: 2, tone: "bg-chart-3" },
  { id: "rm-pod", name: "Podcast booth", floor: { en: "2nd floor · sound-treated", tr: "2. kat · ses yalıtımlı" }, seats: 3, rate: 3, tone: "bg-chart-4" },
  { id: "rm-hall", name: "Garden hall", floor: { en: "Ground floor · events", tr: "Zemin kat · etkinlik" }, seats: 60, rate: 12, tone: "bg-chart-5" },
];
export const roomsById: Record<string, Room> = Object.fromEntries(rooms.map((r) => [r.id, r]));

export const statusLabels: Record<BookingStatus, L> = {
  confirmed: { en: "Confirmed", tr: "Onaylı" },
  tentative: { en: "Tentative", tr: "Ön rezervasyon" },
  "checked-in": { en: "Checked in", tr: "Giriş yapıldı" },
  cancelled: { en: "Cancelled", tr: "İptal" },
};
export const statusTone: Record<BookingStatus, "neutral" | "info" | "success" | "warning"> = {
  confirmed: "info",
  tentative: "warning",
  "checked-in": "success",
  cancelled: "neutral",
};

export const extraLabels: Record<Extra, L> = {
  coffee: { en: "Coffee & tea", tr: "Kahve ve çay" },
  lunch: { en: "Lunch for the room", tr: "Oda için öğle yemeği" },
  screen: { en: "Screen & video call kit", tr: "Ekran ve video görüşme seti" },
  recording: { en: "Recording engineer", tr: "Kayıt teknisyeni" },
  whiteboard: { en: "Extra whiteboards", tr: "Ek beyaz tahta" },
};

type Row = [id: string, d: number, s: string, e: string, en: string, tr: string, host: string, company: string, room: string, guests: number, status?: BookingStatus, extras?: Extra[], visitors?: string[]];

const rows: Row[] = [
  ["b-01", -1, "09:00", "10:00", "Weekly product sync", "Haftalık ürün toplantısı", "Priya Menon", "Larkspur Analytics", "rm-s3", 4, "checked-in", ["coffee"]],
  ["b-02", -1, "14:00", "17:00", "Brand workshop", "Marka atölyesi", "Mads Kjær", "Tessellate Architects", "rm-ate", 7, "checked-in", ["whiteboard", "coffee"]],
  ["b-03", 0, "08:30", "09:30", "Investor breakfast", "Yatırımcı kahvaltısı", "Jordan Reyes", "Calderwood Labs", "rm-bos", 6, "checked-in", ["coffee", "screen"], ["Selin Yücel", "Marc Olsen"]],
  ["b-04", 0, "09:30", "10:00", "Episode 41 recording", "41. bölüm kaydı", "Ebru Taş", "Kuzey Outdoor", "rm-pod", 2, "checked-in", ["recording"]],
  ["b-05", 0, "10:30", "12:00", "Quarterly business review", "Çeyrek iş değerlendirmesi", "Gökhan Bal", "Tidewell Logistics", "rm-bos", 11, "confirmed", ["screen", "coffee"], ["Arzu Kaplan", "Tim Becker", "Oya Sarp"]],
  ["b-06", 0, "11:00", "11:30", "Candidate interview", "Aday görüşmesi", "Nur Şimşek", "Tidewell Logistics", "rm-s3", 2, "confirmed", [], ["Bora Ilgın"]],
  ["b-07", 0, "13:00", "14:30", "Design critique", "Tasarım değerlendirmesi", "Mads Kjær", "Tessellate Architects", "rm-ate", 6, "tentative", ["whiteboard"]],
  ["b-08", 0, "15:00", "16:00", "Supplier call", "Tedarikçi görüşmesi", "Ozan Bilgin", "Halcyon Ferments", "rm-s3", 3, "confirmed", ["screen"]],
  ["b-09", 0, "18:30", "21:00", "Founders' evening: pricing", "Kurucular buluşması: fiyatlama", "Nehir Aydın", "Kestrel Works", "rm-hall", 48, "confirmed", ["coffee", "screen"]],
  ["b-10", 1, "09:00", "12:00", "Sprint planning", "Sprint planlaması", "Priya Menon", "Larkspur Analytics", "rm-ate", 8, "confirmed", ["whiteboard", "coffee"]],
  ["b-11", 1, "10:00", "10:45", "Bookkeeping clinic", "Ön muhasebe danışma saati", "Pınar Ilgaz", "Velvet Anchor Hotels", "rm-s3", 2, "confirmed"],
  ["b-12", 1, "13:30", "14:30", "Episode 42 recording", "42. bölüm kaydı", "Ebru Taş", "Kuzey Outdoor", "rm-pod", 3, "tentative", ["recording"]],
  ["b-13", 1, "15:00", "16:30", "Legal review: lease", "Hukuki inceleme: kira sözleşmesi", "Levent Aydemir", "Orchard & Oak Furniture", "rm-bos", 5, "cancelled", ["screen"]],
  ["b-14", 2, "09:30", "11:00", "Client pitch rehearsal", "Müşteri sunumu provası", "Harriet Moss", "Northpaw Pet Supply", "rm-bos", 9, "confirmed", ["screen", "coffee"]],
  ["b-15", 2, "11:30", "12:30", "1:1 coaching", "Birebir koçluk", "Elif Sarı", "Quillfeather Books", "rm-s3", 2, "confirmed"],
  ["b-16", 2, "14:00", "17:30", "Hiring panel", "İşe alım paneli", "Cem Arıkan", "Lodestar Freight", "rm-ate", 5, "tentative", ["lunch"], ["Deniz Uslu", "Can Aral", "Ela Kurt"]],
  ["b-17", 3, "10:00", "11:00", "Board prep", "Yönetim kurulu hazırlığı", "Femke de Vries", "Brightwater Optics", "rm-s3", 3, "confirmed", ["screen"]],
  ["b-18", 3, "12:00", "14:00", "Offsite: strategy day", "Şirket dışı strateji günü", "Kaan Toprak", "Velvet Anchor Hotels", "rm-bos", 12, "confirmed", ["lunch", "screen", "whiteboard"]],
  ["b-19", 3, "16:00", "16:30", "Episode 43 recording", "43. bölüm kaydı", "Ebru Taş", "Kuzey Outdoor", "rm-pod", 2, "confirmed", ["recording"]],
  ["b-20", 4, "09:00", "18:00", "Hackathon day", "Hackathon günü", "Nehir Aydın", "Kestrel Works", "rm-hall", 36, "confirmed", ["lunch", "coffee", "screen"]],
  ["b-21", 4, "10:30", "11:30", "Partner onboarding", "İş ortağı oryantasyonu", "Serkan Ateş", "Pinewood Learning Centre", "rm-ate", 6, "tentative", ["screen"]],
  ["b-22", 7, "09:30", "10:30", "Weekly product sync", "Haftalık ürün toplantısı", "Priya Menon", "Larkspur Analytics", "rm-s3", 4, "confirmed", ["coffee"]],
  ["b-23", 7, "11:00", "13:00", "Contract signing", "Sözleşme imzası", "Volkan Ergin", "Yelken Marine Supply", "rm-bos", 6, "confirmed", ["coffee"], ["Mert Aksu"]],
  ["b-24", 7, "14:00", "15:30", "Photo shoot: autumn line", "Fotoğraf çekimi: sonbahar serisi", "Ebru Taş", "Kuzey Outdoor", "rm-ate", 4, "confirmed"],
  ["b-25", 8, "10:00", "12:00", "Data team retro", "Veri ekibi retrosu", "Priya Menon", "Larkspur Analytics", "rm-ate", 7, "tentative", ["whiteboard"]],
];

export const initialBookings: RoomBooking[] = rows.map(([id, d, s, e, en, tr, host, company, roomId, guests, status = "confirmed", extras = [], visitors]) => ({
  id,
  start: at(d, s),
  end: at(d, e),
  title: { en, tr },
  host,
  company,
  roomId,
  guests,
  status,
  extras,
  visitors,
}));

/** Opening hours of the rooms (for utilisation): 08:00–20:00. */
export const OPEN_MINUTES = 12 * 60;

export const dayKeyOf = (iso: string) => iso.slice(0, 10);
export const minutesOf = (iso: string) => Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16));
export const durationOf = (b: RoomBooking) => minutesOf(b.end) - minutesOf(b.start);

/** The days the agenda covers (yesterday … a week from tomorrow). */
export const agendaDays = Array.from({ length: 10 }, (_, i) => day(i - 1));
