// Fixture data for the 2FA enrolment block. Account, secret and codes come from the shared
// admin fixtures so this screen matches the settings and sign-in blocks.
import { backupCodes, me, totpSecret, totpUri, type L } from "../../_shared";

export const account = { name: me.name, email: me.email };
export const otpauth = totpUri(me.email);
/** The secret in groups of four, the way people type it into an app by hand. */
export const secretGroups = totpSecret.match(/.{1,4}/g) ?? [totpSecret];
export const initialCodes = backupCodes;

/** Second batch for "New codes" (deterministic, so the demo looks the same on every render). */
export const regeneratedCodes = ["H4QX-2MZP", "T7CN-W9EB", "3KDV-RJ6U", "Y8LA-5PQS", "N2GF-X7TE", "C9WR-K3HM", "6PZB-DV4Y", "E5JT-Q8NA", "R3MU-H6XC", "K7SE-B2WD"];

export const steps: Array<{ id: string; title: L; hint: L }> = [
  { id: "scan", title: { en: "Scan the code", tr: "Kodu okutun" }, hint: { en: "Link an authenticator app", tr: "Doğrulama uygulamasını bağlayın" } },
  { id: "verify", title: { en: "Enter a code", tr: "Kodu girin" }, hint: { en: "Prove the link works", tr: "Bağlantının çalıştığını doğrulayın" } },
  { id: "save", title: { en: "Save backup codes", tr: "Yedek kodları saklayın" }, hint: { en: "For when your phone isn’t around", tr: "Telefonunuz yanınızda olmadığında" } },
];

export const apps: L[] = [
  { en: "Any authenticator app that shows 6-digit codes", tr: "6 haneli kod gösteren herhangi bir doğrulama uygulaması" },
  { en: "A password manager with one-time codes", tr: "Tek kullanımlık kod üretebilen bir parola yöneticisi" },
];

/** Demo rule: 000000 and 123123 are "wrong"; any other six digits pass. */
export const isValidCode = (code: string) => /^\d{6}$/.test(code) && code !== "000000" && code !== "123123";
