"use client";

import * as React from "react";

/**
 * The visitor's chosen gift, shared by the home-page builder and the donate page inside one
 * visit (both languages): pick ₺600 monthly on home, land on the donate page with it selected.
 */
export interface GiftChoice {
  frequency: "once" | "monthly";
  /** A preset value as a string ("600") or "other". */
  preset: string;
  /** The amount typed into "Other". */
  other: number | null;
}

let state: GiftChoice = { frequency: "once", preset: "1500", other: null };
const listeners = new Set<() => void>();

export function setGift(next: Partial<GiftChoice>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const read = () => state;

export function useGift(): GiftChoice {
  return React.useSyncExternalStore(subscribe, read, read);
}

/** The amount the choice stands for (0 while "Other" is empty). */
export const giftAmount = (g: GiftChoice) => (g.preset === "other" ? (g.other ?? 0) : Number(g.preset));
