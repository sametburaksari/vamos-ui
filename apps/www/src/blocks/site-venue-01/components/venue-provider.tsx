"use client";

import * as React from "react";
import type { LayoutId, SpaceId } from "./content";

interface VenueContextValue {
  layout: LayoutId;
  guests: number;
  /** Spaces picked for the enquiry. */
  picked: SpaceId[];
  setLayout: (l: LayoutId) => void;
  setGuests: (n: number) => void;
  setPicked: (ids: SpaceId[]) => void;
  toggle: (id: SpaceId) => void;
}

const VenueContext = React.createContext<VenueContextValue | null>(null);

export function useVenue() {
  const ctx = React.useContext(VenueContext);
  if (!ctx) throw new Error("useVenue must be used inside <VenueProvider>.");
  return ctx;
}

/** Layout, head-count and picked spaces, shared by the finder, the spaces page and the enquiry (and both languages). */
export function VenueProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = React.useState<LayoutId>("banquet");
  const [guests, setGuests] = React.useState(120);
  const [picked, setPicked] = React.useState<SpaceId[]>([]);
  const value = React.useMemo<VenueContextValue>(
    () => ({ layout, guests, picked, setLayout, setGuests, setPicked, toggle: (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])) }),
    [layout, guests, picked],
  );
  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>;
}
