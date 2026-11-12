"use client";

import * as React from "react";

/**
 * NO:17 — Bağış / kampanya ("para hikayeleri") mağazası.
 * Köy okulu, pankart, cenaze/vefa yardımı gibi toplamalar; her üyenin katkısı.
 * Katılım mağazasıyla (no17-store) aynı desen: localStorage + external store.
 */

export type CampaignType = "okul" | "pankart" | "cenaze" | "diger";

export type Campaign = {
  id: string;
  title: string;
  type: CampaignType;
  story: string; // "hikaye" — ne için toplandığı
  target?: number; // hedef tutar (TL), opsiyonel
  createdAt: string; // YYYY-MM-DD
  closed?: boolean;
};

/** campaignId -> memberKey -> katkı (TL) */
export type ContribMap = Record<string, Record<string, number>>;

export type CampaignState = { campaigns: Campaign[]; contrib: ContribMap };

export const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
  { value: "okul", label: "Köy okulu" },
  { value: "pankart", label: "Pankart / koreografi" },
  { value: "cenaze", label: "Cenaze / vefa yardımı" },
  { value: "diger", label: "Diğer" },
];

export const campaignTypeLabel = (t: CampaignType) =>
  CAMPAIGN_TYPES.find((x) => x.value === t)?.label ?? "Diğer";

const LS = "no17-campaigns-v1";

/** İlk örnek — kullanıcı kendi kampanyalarını ekleyene kadar yapıyı gösterir. */
function buildSeed(): CampaignState {
  return {
    campaigns: [
      {
        id: "c_koyokulu",
        title: "Köy Okulu — sıra & kırtasiye",
        type: "okul",
        story:
          "NO:17 olarak bir köy okuluna sıra, kırtasiye ve kışlık ihtiyaç desteği için toplama yapıyoruz. Toplanan tutar ve kimlerin katkı verdiği burada tutulur.",
        target: 50000,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ],
    contrib: {},
  };
}

const SEED: CampaignState = buildSeed();

let store: CampaignState = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist(next: CampaignState) {
  store = next;
  try {
    localStorage.setItem(LS, JSON.stringify(next));
  } catch {
    /* private mode / blocked storage — stay in memory */
  }
  emit();
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  // 1) Yerel taslak (anında göster)
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CampaignState>;
      store = { campaigns: parsed.campaigns ?? SEED.campaigns, contrib: parsed.contrib ?? {} };
      emit();
    }
  } catch {
    /* ignore */
  }
  // 2) Sunucu kaydı (asıl kaynak — admin ise döner)
  fetch("/api/admin/records")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d?.ok) return;
      const contrib: ContribMap = {};
      for (const [cid, rows] of Object.entries((d.contrib ?? {}) as Record<string, Record<string, { amount: number }>>)) {
        contrib[cid] = {};
        for (const [key, c] of Object.entries(rows)) contrib[cid][key] = c.amount;
      }
      const campaigns: Campaign[] = (d.campaigns ?? SEED.campaigns).map((c: Partial<Campaign>) => ({
        id: c.id!,
        title: c.title ?? "",
        type: (c.type ?? "diger") as CampaignType,
        story: c.story ?? "",
        target: c.target ?? undefined,
        createdAt: c.createdAt ?? "",
        closed: c.closed,
      }));
      store = { campaigns, contrib };
      emit();
    })
    .catch(() => {
      /* offline / yetkisiz — yerel kalır */
    });
}

function newId() {
  return "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function useCampaigns() {
  const snap = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => store,
    () => SEED,
  );

  React.useEffect(() => hydrate(), []);

  return React.useMemo(() => {
    const campaigns = snap.campaigns;

    const get = (id: string) => campaigns.find((c) => c.id === id);

    const create = (input: Omit<Campaign, "id" | "createdAt"> & { createdAt?: string }) => {
      const id = newId();
      const c: Campaign = {
        id,
        createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10),
        title: input.title,
        type: input.type,
        story: input.story,
        target: input.target,
        closed: input.closed,
      };
      persist({ ...store, campaigns: [c, ...store.campaigns] });
      return id;
    };

    const update = (id: string, patch: Partial<Campaign>) =>
      persist({ ...store, campaigns: store.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

    const remove = (id: string) => {
      const contrib = { ...store.contrib };
      delete contrib[id];
      persist({ campaigns: store.campaigns.filter((c) => c.id !== id), contrib });
    };

    const setContribution = (id: string, key: string, amount: number) => {
      const forId = { ...(store.contrib[id] ?? {}) };
      if (!amount || amount <= 0) delete forId[key];
      else forId[key] = amount;
      persist({ ...store, contrib: { ...store.contrib, [id]: forId } });
    };

    const contributionOf = (id: string, key: string) => snap.contrib[id]?.[key] ?? 0;

    /** Bir kampanyanın katkı verenleri (tutar > 0), tutara göre azalan. */
    const contributorsOf = (id: string) =>
      Object.entries(snap.contrib[id] ?? {})
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key, amount]) => ({ key, amount }));

    const totalOf = (id: string) => contributorsOf(id).reduce((s, x) => s + x.amount, 0);

    const countOf = (id: string) => contributorsOf(id).length;

    /** Bir üyenin tüm kampanyalardaki katkıları (tutar > 0). */
    const contributionsForMember = (key: string) =>
      campaigns
        .map((c) => ({ campaign: c, amount: snap.contrib[c.id]?.[key] ?? 0 }))
        .filter((x) => x.amount > 0)
        .sort((a, b) => b.amount - a.amount);

    const memberTotal = (key: string) =>
      contributionsForMember(key).reduce((s, x) => s + x.amount, 0);

    const grandTotal = () => campaigns.reduce((s, c) => s + totalOf(c.id), 0);

    return {
      campaigns,
      get,
      create,
      update,
      remove,
      setContribution,
      contributionOf,
      contributorsOf,
      totalOf,
      countOf,
      contributionsForMember,
      memberTotal,
      grandTotal,
    };
  }, [snap]);
}
