"use client";

import * as React from "react";
import { PER_REFERRAL, WAITING } from "./content";

export interface Referral {
  email: string;
}

interface WaitlistState {
  /** The address that joined; null until the form is sent (the joined page then shows a sample). */
  email: string | null;
  join: (email: string) => void;
  referrals: Referral[];
  addReferral: (email: string) => void;
  /** Where you joined: one after everyone already waiting. */
  startPosition: number;
  /** Where you are now: each referral moves you up PER_REFERRAL places (never above #1). */
  position: number;
}

const WaitlistContext = React.createContext<WaitlistState | null>(null);

export function useWaitlist() {
  const ctx = React.useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be used inside <WaitlistProvider>.");
  return ctx;
}

/** Sign-up and referral state shared by both languages and both pages (in memory only). */
export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = React.useState<string | null>(null);
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const startPosition = WAITING + 1;
  const position = Math.max(1, startPosition - referrals.length * PER_REFERRAL);
  const value = React.useMemo<WaitlistState>(
    () => ({
      email,
      join: (e) => {
        setEmail(e);
        setReferrals([]);
      },
      referrals,
      addReferral: (e) => setReferrals((r) => [{ email: e }, ...r]),
      startPosition,
      position,
    }),
    [email, referrals, startPosition, position],
  );
  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A short, stable invite code from an address ("deniz.k@…" → "deniz-k7m"). */
export function inviteCode(email: string) {
  const name = email.split("@")[0]!.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 12) || "garden";
  let h = 0;
  for (const ch of email) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${name}-${h.toString(36).slice(-3)}`;
}
