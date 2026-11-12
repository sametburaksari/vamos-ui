import "server-only";
import ticketsRaw from "@/data/no17-tickets.generated.json";

/**
 * Real Sociedad (K) bilet dağıtımı — no17-fener bilet sistemiyle AYNI digest'ler.
 * Digest = HMAC-SHA256(TICKET_LOOKUP_SECRET, "ticket:"+TC). Ham TC burada YOK.
 * Üye girişliyken kendi TC'sinden digest hesaplanır, buradan koltukları bulunur,
 * no17-fener'in bilet-indir ucu için aynı imzalı kısa ömürlü token üretilir.
 *
 * İsim + koltuk + digest kişisel olduğu için repoya GİRMEZ: derleme öncesi
 * NO17_PRIVATE_B64 env'inden `no17-tickets.generated.json` üretilir
 * (scripts/gen-no17-private.mjs), dosya .gitignore'da.
 */
export const TICKET_EVENT = "Fenerbahçe - Real Sociedad (K) · 11.11.2026 20:00 · Maraton Üst D Blok";

export type TicketRow = { digest: string; name: string; seats: string[]; pages: number };

export const TICKETS: TicketRow[] = ticketsRaw as TicketRow[];

export const TICKET_BY_DIGEST: Record<string, TicketRow> = Object.fromEntries(TICKETS.map((t) => [t.digest, t]));
