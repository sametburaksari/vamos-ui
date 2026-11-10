"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { IconButton, ResizableGroup, ResizableHandle, ResizablePanel, useResizablePanelRef } from "@vamos-cms/ui";

const people = ["Elif Kaya — Engineering manager", "Mert Aydın — SRE", "Sofia Rossi — Designer", "Omar Haddad — Recruiter", "Emma Clarke — Payroll"];

// HR directory: drag the pane past its minimum (or press Enter on the handle) to collapse it.
export default function ResizableCollapsible() {
  const panel = useResizablePanelRef();
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <ResizableGroup className="h-72 w-full max-w-3xl overflow-hidden rounded-ui-lg border border-line">
      <ResizablePanel
        id="people"
        panelRef={panel}
        defaultSize="30%"
        minSize="200px"
        collapsible
        collapsedSize="0%"
        onResize={(size) => setCollapsed(size.asPercentage === 0)}
      >
        <ul className="flex h-full flex-col overflow-y-auto p-2 text-[13px]">
          {people.map((p) => (
            <li key={p} className="truncate rounded-ui-sm px-2 py-1.5 hover:bg-hover">
              {p}
            </li>
          ))}
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize people list" />
      <ResizablePanel id="profile" minSize="40%">
        <div className="flex h-full flex-col gap-3 p-4">
          <IconButton
            label={collapsed ? "Show people list" : "Hide people list"}
            size="sm"
            onClick={() => (collapsed ? panel.current?.expand() : panel.current?.collapse())}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </IconButton>
          <div>
            <p className="font-semibold">Elif Kaya</p>
            <p className="text-[13px] text-fg-muted">Engineering manager · Istanbul office · 6 direct reports</p>
          </div>
        </div>
      </ResizablePanel>
    </ResizableGroup>
  );
}
