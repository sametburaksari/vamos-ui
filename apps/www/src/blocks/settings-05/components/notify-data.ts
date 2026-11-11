// Notification preferences: the shared events × channels matrix plus a few personal events,
// where each channel delivers to, and a sample message per event for the preview.
import { notifyChannels, notifyEvents, type NotifyChannel } from "../../_shared/account";
import type { L } from "../../_shared/l10n";
import { me } from "../../_shared/people";

export { notifyChannels, type NotifyChannel };

export interface NotifyEvent {
  key: string;
  group: L;
  label: L;
  /** One line under the label: when exactly it fires. */
  hint: L;
  defaults: NotifyChannel[];
  /** Channels that can't be turned off for this event. */
  locked?: NotifyChannel[];
  /** Channels this event can't use at all. */
  unavailable?: NotifyChannel[];
  sample: { title: L; body: L };
}

const extra: Record<string, Pick<NotifyEvent, "hint" | "sample" | "unavailable">> = {
  "order.new": {
    hint: { en: "Every paid order, from any channel.", tr: "Her kanaldan gelen her ödenmiş sipariş." },
    sample: { title: { en: "New order KL-10482 · ₺1,840.00", tr: "Yeni sipariş KL-10482 · ₺1.840,00" }, body: { en: "Leyla Arıkan · 2 items · Web store · ships from Istanbul DC", tr: "Leyla Arıkan · 2 ürün · Web mağaza · İstanbul deposundan çıkar" } },
  },
  "order.refund": {
    hint: { en: "A customer asks for money back.", tr: "Müşteri iade talep ettiğinde." },
    sample: { title: { en: "Refund requested on KL-10466", tr: "KL-10466 için iade talebi" }, body: { en: "“Arrived in the wrong colour.” ₺920.00 · decide within 3 days", tr: "“Yanlış renk geldi.” ₺920,00 · 3 gün içinde karar verin" } },
  },
  "stock.low": {
    hint: { en: "On-hand drops below the reorder point.", tr: "Eldeki stok yeniden sipariş seviyesinin altına düştüğünde." },
    sample: { title: { en: "Linen duvet cover, M — 6 left", tr: "Keten nevresim, M — 6 adet kaldı" }, body: { en: "Reorder point is 20. Next PO arrives Nov 24.", tr: "Yeniden sipariş seviyesi 20. Sonraki sipariş 24 Kasım'da geliyor." } },
  },
  "ticket.assigned": {
    hint: { en: "Someone routes a support ticket to you.", tr: "Biri size destek talebi yönlendirdiğinde." },
    sample: { title: { en: "#4821 assigned to you", tr: "#4821 size atandı" }, body: { en: "“Courier says delivered, nothing at the door” · High priority", tr: "“Kargo teslim edildi diyor, kapıda yok” · Yüksek öncelik" } },
  },
  "ticket.sla": {
    hint: { en: "30 minutes before a first-reply SLA breaks.", tr: "İlk yanıt SLA'sı dolmadan 30 dakika önce." },
    sample: { title: { en: "SLA breaks in 30 min · #4817", tr: "SLA 30 dk içinde doluyor · #4817" }, body: { en: "Velvet Anchor Hotels · waiting 3 h 30 min for a first reply", tr: "Velvet Anchor Hotels · 3 sa 30 dk'dır ilk yanıt bekliyor" } },
  },
  "security.signin": {
    hint: { en: "Your account signs in on a device we haven't seen.", tr: "Hesabınız daha önce görmediğimiz bir cihazdan giriş yaptığında." },
    sample: { title: { en: "New sign-in from Frankfurt", tr: "Frankfurt'tan yeni giriş" }, body: { en: "Firefox on Linux · 192.0.2.77 · not you? Sign out everywhere.", tr: "Linux'ta Firefox · 192.0.2.77 · siz değil misiniz? Her yerden çıkış yapın." } },
  },
  "billing.invoice": {
    hint: { en: "The monthly invoice is ready to download.", tr: "Aylık fatura indirilmeye hazır olduğunda." },
    sample: { title: { en: "Invoice KL-202610-04210 · $390.00", tr: "Fatura KL-202610-04210 · 390,00 $" }, body: { en: "Paid with the card ending 4242. PDF attached.", tr: "4242 ile biten kartla ödendi. PDF ekte." } },
    unavailable: ["sms", "push"],
  },
};

const shared: NotifyEvent[] = notifyEvents.map((e) => ({ ...e, ...extra[e.key]! }));

/** Personal events that only make sense for one person, not the workspace. */
const personal: NotifyEvent[] = [
  {
    key: "comment.mention",
    group: { en: "Collaboration", tr: "İş birliği" },
    label: { en: "Mentioned in a comment", tr: "Bir yorumda bahsedildiğimde" },
    hint: { en: "Someone writes @Defne on an order, ticket or product.", tr: "Biri sipariş, talep veya üründe @Defne yazdığında." },
    defaults: ["in-app", "push"],
    sample: { title: { en: "Ruth Adeyemi mentioned you", tr: "Ruth Adeyemi sizden bahsetti" }, body: { en: "“@Defne can we split this order across two warehouses?”", tr: "“@Defne bu siparişi iki depoya bölebilir miyiz?”" } },
  },
  {
    key: "leave.request",
    group: { en: "Collaboration", tr: "İş birliği" },
    label: { en: "Leave request to approve", tr: "Onay bekleyen izin talebi" },
    hint: { en: "A direct report asks for time off.", tr: "Size bağlı biri izin istediğinde." },
    defaults: ["in-app", "email"],
    sample: { title: { en: "Baran Çelik asks for 3 days off", tr: "Baran Çelik 3 gün izin istiyor" }, body: { en: "Dec 22 – Dec 24 · annual leave · 9 days left after this", tr: "22 – 24 Aralık · yıllık izin · sonrasında 9 gün kalır" } },
  },
];

export const events: NotifyEvent[] = [...shared.slice(0, 5), ...personal, ...shared.slice(5)];

/** Where each channel goes. SMS starts unverified so the column shows the verify flow. */
export const destinations: Record<NotifyChannel, { to: L; detail: L; verified: boolean }> = {
  "in-app": { to: { en: "Bell in the top bar", tr: "Üst çubuktaki zil" }, detail: { en: "Kept 30 days", tr: "30 gün saklanır" }, verified: true },
  email: { to: { en: me.email, tr: me.email }, detail: { en: "Verified", tr: "Doğrulandı" }, verified: true },
  push: { to: { en: "2 devices", tr: "2 cihaz" }, detail: { en: "Phone · Work laptop", tr: "Telefon · İş bilgisayarı" }, verified: true },
  sms: { to: { en: "+90 216 000 00 14", tr: "+90 216 000 00 14" }, detail: { en: "Not verified", tr: "Doğrulanmadı" }, verified: false },
};

export type Matrix = Record<string, NotifyChannel[]>;
export const defaultMatrix: Matrix = Object.fromEntries(events.map((e) => [e.key, e.defaults]));
/** What this person has saved (differs from the defaults a little). */
export const savedMatrix: Matrix = { ...defaultMatrix, "order.new": ["in-app"], "stock.low": ["in-app", "email", "push"], "ticket.sla": ["in-app", "push"] };

export interface DeliveryRules {
  quiet: boolean;
  quietFrom: string;
  quietTo: string;
  /** Let urgent events (SLA, security) through quiet hours. */
  urgentThrough: boolean;
  digest: "instant" | "hourly" | "daily";
}
export const savedRules: DeliveryRules = { quiet: true, quietFrom: "22:00", quietTo: "07:30", urgentThrough: true, digest: "instant" };
export const urgentEvents = ["ticket.sla", "security.signin"];
