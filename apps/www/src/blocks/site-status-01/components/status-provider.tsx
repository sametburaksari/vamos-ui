"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { incidents } from "./content";

interface StatusContextValue {
  /** Incident shown on the detail page. */
  incident: string;
  open: (id: string) => void;
}

const StatusContext = React.createContext<StatusContextValue | null>(null);

export function useStatus() {
  const ctx = React.useContext(StatusContext);
  if (!ctx) throw new Error("useStatus must be used inside <StatusProvider>.");
  return ctx;
}

/** The opened incident — above the locale switch, so changing language keeps it. */
export function StatusProvider({ children }: { children: React.ReactNode }) {
  const { navigate } = useSiteShell();
  const [incident, setIncident] = React.useState(incidents[0]!.id);
  const open = React.useCallback(
    (id: string) => {
      setIncident(id);
      navigate({ page: "incident" });
    },
    [navigate],
  );
  const value = React.useMemo(() => ({ incident, open }), [incident, open]);
  return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
}

/** A link to an incident's detail page (works without JS as a plain page link). */
export function IncidentLink({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  const { open } = useStatus();
  const { hrefFor } = useSiteShell();
  return (
    <a
      href={hrefFor("incident")}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        open(id);
      }}
    >
      {children}
    </a>
  );
}
