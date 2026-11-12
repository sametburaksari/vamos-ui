"use client";

import * as React from "react";
import { PREFILL } from "./no17-data";

const LS = "no17-attendance-v1";

/** matchId -> memberKey -> going */
export type AttMap = Record<string, Record<string, boolean>>;

function buildSeed(): AttMap {
  const m: AttMap = {};
  for (const [match, keys] of Object.entries(PREFILL)) {
    m[match] = {};
    for (const k of keys) m[match]![k] = true;
  }
  return m;
}

/** Stable reference for SSR + first client render (no hydration mismatch). */
const SEED: AttMap = buildSeed();

let store: AttMap = SEED;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist(next: AttMap) {
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
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      store = JSON.parse(raw) as AttMap;
      emit();
    }
  } catch {
    /* ignore */
  }
  // Sunucudaki gerçek katılım kaydını üzerine bindir (admin ise döner).
  fetch("/api/admin/records")
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d?.ok || !d.attendance) return;
      const merged: AttMap = { ...store };
      for (const [matchId, rows] of Object.entries(d.attendance as Record<string, Record<string, { went: boolean }>>)) {
        merged[matchId] = { ...(merged[matchId] ?? {}) };
        for (const [key, a] of Object.entries(rows)) if (a.went) merged[matchId]![key] = true;
      }
      store = merged;
      emit();
    })
    .catch(() => {
      /* offline / yetkisiz — yerel kalır */
    });
}

export function useAttendance() {
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
    const isGoing = (match: string, key: string) => !!snap[match]?.[key];
    const set = (match: string, key: string, v: boolean) =>
      persist({ ...store, [match]: { ...(store[match] ?? {}), [key]: v } });
    const toggle = (match: string, key: string) => set(match, key, !store[match]?.[key]);
    const goingKeys = (match: string) =>
      Object.entries(snap[match] ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k);
    const countFor = (match: string) => goingKeys(match).length;
    const matchesForMember = (key: string) => Object.keys(snap).filter((m) => snap[m]?.[key]);
    return { isGoing, toggle, set, goingKeys, countFor, matchesForMember };
  }, [snap]);
}
