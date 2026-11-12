// Doğum günü yardımcıları — hassas değil, hem client (giriş formu) hem sunucu (doğrulama) kullanır.

export const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

const fold = (s: string) =>
  s.toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/[şŞ]/g, "s").replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g").replace(/[üÜ]/g, "u").replace(/[öÖ]/g, "o");

const MONTH_INDEX: Record<string, number> = Object.fromEntries(
  TR_MONTHS.map((m, i) => [fold(m), i]),
);

/**
 * "22 Haziran" / "13 Şubat 1998" → kanonik "gun-ayIndex" ("22-5"), yıl yok sayılır.
 * Eşleşmezse null. Giriş doğrulaması bu kanonik biçim üzerinden yapılır.
 */
export function normalizeBday(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const dayM = raw.match(/\d{1,2}/);
  if (!dayM) return null;
  const day = parseInt(dayM[0], 10);
  if (day < 1 || day > 31) return null;
  let monthIdx = -1;
  for (const [name, idx] of Object.entries(MONTH_INDEX)) {
    if (fold(raw).includes(name)) { monthIdx = idx; break; }
  }
  if (monthIdx < 0) return null;
  return `${day}-${monthIdx}`;
}

/** Form seçiminden (gün numarası + ay index) kanonik biçim. */
export function bdayKey(day: number, monthIdx: number): string {
  return `${day}-${monthIdx}`;
}
