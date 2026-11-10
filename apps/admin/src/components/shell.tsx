"use client";

import * as React from "react";
import { Search, Bell, Plus, ExternalLink } from "lucide-react";
import { Button, IconButton } from "@vamos-cms/ui";
import { Sidebar } from "./sidebar";
import { ThemeControls } from "./theme-controls";

export function Shell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="relative z-10 flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-[color-mix(in_srgb,var(--scene)_72%,transparent)] px-6 backdrop-blur-xl">
          <button className="flex h-8 w-72 items-center gap-2 rounded-full border border-field-border bg-field px-3 text-[13px] text-fg-subtle hover:border-field-border-hover focus-ring">
            <Search className="size-3.5" />
            <span className="flex-1 text-start">Search or run a command…</span>
            <kbd className="rounded border border-line px-1 font-mono text-[10.5px]">⌘K</kbd>
          </button>
          <div className="flex-1" />
          <ThemeControls />
          <span className="mx-1 h-5 w-px bg-line" />
          <Button variant="ghost" size="sm"><ExternalLink /> View site</Button>
          <IconButton size="sm" label="Notifications"><Bell /></IconButton>
          <Button variant="primary" size="sm"><Plus /> New</Button>
          <span className="ms-1 grid size-8 place-items-center rounded-full bg-fg text-[12px] font-semibold text-scene">SB</span>
        </header>
        <main className="flex-1 px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
