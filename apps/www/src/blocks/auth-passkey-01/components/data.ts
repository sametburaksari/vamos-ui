// Passkeys on Defne's account. Device and provider names are generic on purpose.
import { day, me, minutesFromNow, type L } from "../../_shared";

export const account = { name: me.name, email: me.email };

export type PasskeyKind = "synced" | "device" | "security-key";

export interface Passkey {
  id: string;
  name: string;
  kind: PasskeyKind;
  created: string;
  lastUsed?: string;
  /** Where the sign-in came from last time. */
  lastCity?: string;
}

export const kindLabels: Record<PasskeyKind, L> = {
  synced: { en: "Synced across your devices", tr: "Cihazlarınız arasında eşitlenir" },
  device: { en: "Only on this device", tr: "Yalnızca bu cihazda" },
  "security-key": { en: "Hardware security key", tr: "Donanım güvenlik anahtarı" },
};

export const initialPasskeys: Passkey[] = [
  { id: "pk-1", name: "Work laptop", kind: "synced", created: day(-212), lastUsed: minutesFromNow(-12), lastCity: "Istanbul" },
  { id: "pk-2", name: "Phone", kind: "synced", created: day(-150), lastUsed: minutesFromNow(-2880), lastCity: "Ankara" },
  { id: "pk-3", name: "USB-C security key", kind: "security-key", created: day(-401), lastUsed: day(-63) },
];

/** What this browser would call itself in the "Add a passkey" dialog. */
export const thisDevice = "Office desktop";
