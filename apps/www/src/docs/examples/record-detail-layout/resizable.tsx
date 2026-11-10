"use client";

import * as React from "react";
import { RecordLayout } from "@vamos-ui/react";
import { ContactAside, ContactHeader, ContactMain } from "./contact";

// Drag the side column's edge, or focus it and use ←/→ (Shift for bigger steps), Home/End; double-click resets.
export default function RecordLayoutResizable() {
  const [width, setWidth] = React.useState(340);
  return (
    <div className="grid w-full gap-3">
      <p className="tabular text-[13px] text-fg-muted">Side column: {width}px</p>
      <div className="rounded-ui-lg border border-line bg-scene p-6">
        <RecordLayout resizable asideWidth={width} onAsideWidthChange={setWidth} defaultAsideWidth={340} minAsideWidth={280} maxAsideWidth={480}>
          <ContactHeader />
          <ContactMain />
          <ContactAside />
        </RecordLayout>
      </div>
    </div>
  );
}
