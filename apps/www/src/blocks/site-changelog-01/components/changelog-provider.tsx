"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { KINDS, releases, type Kind } from "./content";

interface ChangelogContextValue {
  /** Kinds shown in the list (feature / improvement / fix). */
  kinds: Kind[];
  setKinds: (kinds: Kind[]) => void;
  /** Version shown on the entry page. */
  version: string;
  /** Open one release on the entry page. */
  open: (version: string) => void;
}

const ChangelogContext = React.createContext<ChangelogContextValue | null>(null);

export function useChangelog() {
  const ctx = React.useContext(ChangelogContext);
  if (!ctx) throw new Error("useChangelog must be used inside <ChangelogProvider>.");
  return ctx;
}

/** Filters and the opened release — above the locale switch, so switching language keeps both. */
export function ChangelogProvider({ children }: { children: React.ReactNode }) {
  const { navigate } = useSiteShell();
  const [kinds, setKinds] = React.useState<Kind[]>(KINDS);
  const [version, setVersion] = React.useState(releases[0]!.version);
  const open = React.useCallback(
    (v: string) => {
      setVersion(v);
      navigate({ page: "entry" });
    },
    [navigate],
  );
  const value = React.useMemo(() => ({ kinds, setKinds, version, open }), [kinds, version, open]);
  return <ChangelogContext.Provider value={value}>{children}</ChangelogContext.Provider>;
}
