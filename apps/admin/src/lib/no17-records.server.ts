import "server-only";
import raw from "@/data/no17-records.json";

/**
 * NO:17 kalıcı kayıtlar (M2): bağış kampanyaları + katkılar + maç katılımları.
 * localStorage yerine sunucu tarafı — her cihazda aynı, üye kendi /ben'inde görür.
 * (Canlı admin düzenlemesi için deploy'da Vercel KV/Postgres'e bağlanacak; şema aynı.)
 */
export type CampaignType = "okul" | "pankart" | "cenaze" | "diger";
export type Campaign = { id: string; title: string; type: CampaignType; target?: number | null; story?: string; createdAt?: string };
export type ContribStatus = "paid" | "pledged";
export type Contribution = { amount: number; status: ContribStatus; date?: string };
export type Attend = { went: boolean; guests?: number };

type RecordsShape = {
  campaigns: Campaign[];
  contrib: Record<string, Record<string, Contribution>>;
  attendance: Record<string, Record<string, Attend>>;
};

const DATA = raw as RecordsShape;

export const CAMPAIGNS: Campaign[] = DATA.campaigns;
export const CAMPAIGN_BY_ID: Record<string, Campaign> = Object.fromEntries(CAMPAIGNS.map((c) => [c.id, c]));

/** Bir kampanyanın toplamları (ödenen / söz / katkı sayısı). */
export function campaignTotals(id: string) {
  const rows = Object.values(DATA.contrib[id] ?? {});
  const paid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const pledged = rows.filter((r) => r.status === "pledged").reduce((s, r) => s + r.amount, 0);
  return { paid, pledged, total: paid + pledged, count: rows.length };
}

/** Bir kampanyadaki tüm katkı verenler (tutara göre azalan). */
export function campaignContributors(id: string) {
  return Object.entries(DATA.contrib[id] ?? {})
    .map(([key, c]) => ({ key, ...c }))
    .sort((a, b) => b.amount - a.amount);
}

/** Bir üyenin tüm kampanyalardaki katkıları. */
export function memberContributions(key: string) {
  const out: { campaignId: string; title: string; type: CampaignType; amount: number; status: ContribStatus; date?: string }[] = [];
  for (const c of CAMPAIGNS) {
    const row = DATA.contrib[c.id]?.[key];
    if (row) out.push({ campaignId: c.id, title: c.title, type: c.type, amount: row.amount, status: row.status, date: row.date });
  }
  return out;
}

/** Bir üyenin katıldığı maçlar (misafir sayısıyla). */
export function memberAttendance(key: string) {
  const out: { matchId: string; guests: number }[] = [];
  for (const [matchId, rows] of Object.entries(DATA.attendance)) {
    const a = rows[key];
    if (a?.went) out.push({ matchId, guests: a.guests ?? 0 });
  }
  return out;
}

/** Bir maça kimler girdi (admin görünümü için). */
export function matchAttendance(matchId: string) {
  return Object.entries(DATA.attendance[matchId] ?? {})
    .filter(([, a]) => a.went)
    .map(([key, a]) => ({ key, guests: a.guests ?? 0 }));
}

/** Tüm kayıt (admin): kampanyalar + katkılar + katılım. */
export function allRecords() {
  return { campaigns: CAMPAIGNS, contrib: DATA.contrib, attendance: DATA.attendance };
}
