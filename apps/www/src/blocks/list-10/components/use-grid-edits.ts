"use client";

import * as React from "react";
import { published, type EditKey, type RowValues } from "./grid-data";

export type CellValue = RowValues[EditKey];
export interface Patch {
  id: string;
  key: EditKey;
  from: CellValue;
  to: CellValue;
}

interface State {
  base: Record<string, RowValues>;
  values: Record<string, RowValues>;
  past: Patch[][];
  future: Patch[][];
}

type Action = { type: "apply"; patches: Array<Omit<Patch, "from">> } | { type: "undo" } | { type: "redo" } | { type: "publish" } | { type: "discard" };

const put = (values: Record<string, RowValues>, patches: Patch[], side: "from" | "to") => {
  const next = { ...values };
  for (const p of patches) next[p.id] = { ...next[p.id]!, [p.key]: p[side] };
  return next;
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "apply": {
      const patches: Patch[] = a.patches.map((p) => ({ ...p, from: s.values[p.id]![p.key] })).filter((p) => p.from !== p.to);
      if (!patches.length) return s;
      return {
        ...s,
        values: put(s.values, patches, "to"),
        past: [...s.past, patches],
        future: [],
      };
    }
    case "undo": {
      const last = s.past.at(-1);
      if (!last) return s;
      return {
        ...s,
        values: put(s.values, last, "from"),
        past: s.past.slice(0, -1),
        future: [last, ...s.future],
      };
    }
    case "redo": {
      const next = s.future[0];
      if (!next) return s;
      return {
        ...s,
        values: put(s.values, next, "to"),
        past: [...s.past, next],
        future: s.future.slice(1),
      };
    }
    case "discard": {
      // Discarding is one more step in the history, so it can be undone too.
      const patches: Patch[] = [];
      for (const id of Object.keys(s.values)) {
        for (const key of Object.keys(s.values[id]!) as EditKey[]) {
          if (s.values[id]![key] !== s.base[id]![key])
            patches.push({
              id,
              key,
              from: s.values[id]![key],
              to: s.base[id]![key],
            });
        }
      }
      if (!patches.length) return s;
      return {
        ...s,
        values: put(s.values, patches, "to"),
        past: [...s.past, patches],
        future: [],
      };
    }
    case "publish":
      return { base: s.values, values: s.values, past: [], future: [] };
  }
}

/** Current values, the published baseline and an undo/redo history of patch groups. */
export function useGridEdits() {
  const [state, dispatch] = React.useReducer(reducer, undefined, (): State => ({
    base: published,
    values: published,
    past: [],
    future: [],
  }));
  const changes = React.useMemo(() => {
    const out: Array<{
      id: string;
      key: EditKey;
      from: CellValue;
      to: CellValue;
    }> = [];
    for (const id of Object.keys(state.values)) {
      for (const key of Object.keys(state.values[id]!) as EditKey[]) {
        const from = state.base[id]![key];
        const to = state.values[id]![key];
        if (from !== to) out.push({ id, key, from, to });
      }
    }
    return out;
  }, [state.values, state.base]);

  return {
    ...state,
    changes,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    apply: (patches: Array<Omit<Patch, "from">>) => dispatch({ type: "apply", patches }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    discard: () => dispatch({ type: "discard" }),
    publish: () => dispatch({ type: "publish" }),
  };
}

/** "1.234,50" (tr) or "1,234.50" (en) → 1234.5. Accepts "+10%" / "-5%" relative to `current`. */
export function parseCell(raw: string, lang: "en" | "tr", current: number): number | null {
  let s = raw.trim().replace(/[₺\s]/g, "");
  const rel = /^([+-])(\d+(?:[.,]\d+)?)%$/.exec(s);
  if (rel) {
    const pct = Number(rel[2]!.replace(",", "."));
    return current * (1 + ((rel[1] === "-" ? -1 : 1) * pct) / 100);
  }
  s = lang === "tr" ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Nearest x,90 — the shop's price ending. */
export const roundTo90 = (n: number) => Math.max(0.9, Math.round(n - 0.9) + 0.9);
export const toMoney = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
