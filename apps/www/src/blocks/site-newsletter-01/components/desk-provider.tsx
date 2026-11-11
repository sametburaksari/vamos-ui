"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { issues, type Issue, type TopicId } from "./content";

export type Cadence = "fortnightly" | "monthly";
export interface Subscription {
  email: string;
  cadence: Cadence;
}

export interface ArchiveFilters {
  query: string;
  topic: TopicId | "all";
  year: "all" | "2026" | "2025";
}

interface DeskContextValue {
  subscription: Subscription | null;
  subscribe: (s: Subscription) => void;
  unsubscribe: () => void;
  issue: Issue;
  openIssue: (n: number) => void;
  filters: ArchiveFilters;
  setFilters: React.Dispatch<React.SetStateAction<ArchiveFilters>>;
  /** Home "topic" links: archive pre-filtered. */
  browseTopic: (topic: TopicId) => void;
}

const DeskContext = React.createContext<DeskContextValue | null>(null);

export function useDesk() {
  const ctx = React.useContext(DeskContext);
  if (!ctx) throw new Error("useDesk must be used inside <DeskProvider>.");
  return ctx;
}

/** Subscription, the opened issue and the archive filters for The Slow Desk (above the locale switch). */
export function DeskProvider({ children }: { children: React.ReactNode }) {
  const { navigate } = useSiteShell();
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [n, setN] = React.useState(issues[0]!.n);
  const [filters, setFilters] = React.useState<ArchiveFilters>({ query: "", topic: "all", year: "all" });
  const value = React.useMemo<DeskContextValue>(
    () => ({
      subscription,
      subscribe: setSubscription,
      unsubscribe: () => setSubscription(null),
      issue: issues.find((i) => i.n === n) ?? issues[0]!,
      openIssue: (num) => {
        setN(num);
        navigate({ page: "issue" });
      },
      filters,
      setFilters,
      browseTopic: (topic) => {
        setFilters({ query: "", topic, year: "all" });
        navigate({ page: "archive" });
      },
    }),
    [subscription, n, filters, navigate],
  );
  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}
