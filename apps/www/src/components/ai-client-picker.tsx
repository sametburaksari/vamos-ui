"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@vamos-ui/react";
import { AiClientIcon, type AiClientIconId } from "./ai-client-icons";

/**
 * Client picker on /ai: WAI-ARIA tabs (arrows, Home/End). The panels are server-rendered children
 * (`TabsContent` with `forceMount`), so every client's setup is in the static HTML. The choice lives
 * only in the URL hash (/ai#cursor) — nothing is stored.
 */
export function AiClientPicker({ clients, children }: { clients: { id: AiClientIconId; label: string }[]; children: React.ReactNode }) {
  const [value, setValue] = React.useState<string>(clients[0]!.id);

  React.useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (clients.some((c) => c.id === id)) setValue(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [clients]);

  const change = (id: string) => {
    setValue(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <Tabs value={value} onValueChange={change} className="gap-6">
      <TabsList variant="pill" overflow="none" aria-label="AI client" className="min-w-0 flex-wrap gap-1.5">
        {clients.map((c) => (
          <TabsTrigger key={c.id} value={c.id} icon={<AiClientIcon id={c.id} />} className="border border-line data-selected:border-transparent">
            {c.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
