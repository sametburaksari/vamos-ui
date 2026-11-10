"use client";

import * as React from "react";
import { MediaLibrary } from "@vamos-cms/ui/media";
import { createDemoMedia } from "./sample-media";

// Bulk actions: Shift + click or Shift + arrows selects a range, Ctrl/⌘ + A selects all.
// The bar offers Move to folder, Download and Delete (with a confirm).
export default function MediaLibraryBulk() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [selected, setSelected] = React.useState<string[]>(["m_lobby", "m_bistro", "m_meeting"]);
  return (
    <div className="grid w-full gap-3">
      <MediaLibrary adapter={adapter} selected={selected} onSelectedChange={setSelected} detailsPanel={false} height="24rem" />
      <p className="text-[12.5px] text-fg-muted">
        <span className="tabular">{selected.length}</span> selected: {selected.join(", ") || "none"}
      </p>
    </div>
  );
}
