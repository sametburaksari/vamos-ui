"use client";

import * as React from "react";

const LS = "no17-lists-v1";

export type SavedList = {
  id: string;
  name: string;
  note?: string;
  keys: string[];
  createdAt: number;
};

const EMPTY: SavedList[] = [];
let store: SavedList[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist(next: SavedList[]) {
  store = next;
  try {
    localStorage.setItem(LS, JSON.stringify(next));
  } catch {
    /* blocked storage — stay in memory */
  }
  emit();
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(LS);
    if (raw) {
      store = JSON.parse(raw) as SavedList[];
      emit();
    }
  } catch {
    /* ignore */
  }
}

function newId() {
  return `l_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function useLists() {
  const lists = React.useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => store,
    () => EMPTY,
  );

  React.useEffect(() => hydrate(), []);

  return React.useMemo(() => {
    const get = (id: string) => lists.find((l) => l.id === id);
    const create = (name: string, keys: string[], note?: string) => {
      const id = newId();
      persist([{ id, name: name.trim() || "Adsız liste", keys, note: note?.trim() || undefined, createdAt: Date.now() }, ...store]);
      return id;
    };
    const update = (id: string, patch: Partial<Omit<SavedList, "id" | "createdAt">>) =>
      persist(store.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    const remove = (id: string) => persist(store.filter((l) => l.id !== id));
    return { lists, get, create, update, remove };
  }, [lists]);
}
