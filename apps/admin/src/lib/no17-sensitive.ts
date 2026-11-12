"use client";

import * as React from "react";
import { MEMBERS, type Member } from "./no17-data";

// Admin oturumundayken TC/telefonu çalışma anında getirir (/api/admin/members).
// Public pakette bu değerler yok; yalnızca giriş yapmış admin'e teslim edilir.

type Sensitive = Record<string, { tc: string; phone: string }>;

let cache: Sensitive | null = null;
let inflight: Promise<Sensitive> | null = null;

function load(): Promise<Sensitive> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/admin/members")
      .then((r) => (r.ok ? r.json() : { members: [] }))
      .then((d) => {
        const map: Sensitive = {};
        for (const m of d.members ?? []) map[m.key] = { tc: m.tc || "", phone: m.phone || "" };
        cache = map;
        return map;
      })
      .catch(() => ({}) as Sensitive);
  }
  return inflight;
}

export function useSensitive(): Sensitive {
  const [map, setMap] = React.useState<Sensitive>(() => cache ?? {});
  React.useEffect(() => {
    let on = true;
    load().then((m) => on && setMap(m));
    return () => {
      on = false;
    };
  }, []);
  return map;
}

/** Public MEMBERS + admin'den gelen tc/phone. */
export function useMembersFull(): Member[] {
  const s = useSensitive();
  return React.useMemo(
    () => MEMBERS.map((m) => ({ ...m, tc: s[m.key]?.tc ?? "", phone: s[m.key]?.phone ?? "" })),
    [s],
  );
}

export function useMemberFull(key: string): Member | undefined {
  const s = useSensitive();
  return React.useMemo(() => {
    const base = MEMBERS.find((m) => m.key === key);
    return base ? { ...base, tc: s[key]?.tc ?? "", phone: s[key]?.phone ?? "" } : undefined;
  }, [s, key]);
}
