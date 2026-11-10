"use client";

import * as React from "react";
import { Button, EditorBar, EditorCanvas, EditorLayout, EditorPanel, EditorPanelSection, Select, SaveStatus } from "@vamos-cms/ui";

// HR job posting: focus mode hides the panel and fades the bar until the pointer moves.
// In an app, hide the App shell sidebar from onFocusModeChange. ⌘/Ctrl+Shift+F toggles, Esc leaves.
export default function EditorLayoutFocusMode() {
  const [focus, setFocus] = React.useState(false);
  return (
    <div className="h-[520px] w-full overflow-hidden rounded-ui-lg border border-line bg-scene">
      <EditorLayout scroll="panes" focusMode={focus} onFocusModeChange={setFocus}>
        <EditorBar
          back={{ href: "/hr/jobs", label: "Job postings" }}
          title="Senior product designer"
          status={<SaveStatus state="saved" guard={false} />}
          focusToggle
          actions={<Button size="sm" variant="primary">Publish posting</Button>}
        />
        <EditorCanvas width="prose" tone={focus ? "scene" : "surface"}>
          <h2 className="font-display text-[length:calc(32px*var(--display-scale))] leading-tight">Senior product designer</h2>
          <p className="text-[16px] leading-[1.75] text-fg-muted">
            You'll own the design of our scheduling product end to end — from the first sketch with a customer to the last pixel in production.
            We're a team of nine designers across Istanbul, Lisbon and remote, and we ship every week.
          </p>
          <p className="text-[16px] leading-[1.75] text-fg-muted">
            You have five or more years of product design experience, a portfolio that shows how you think, and you're comfortable presenting to customers.
          </p>
        </EditorCanvas>
        <EditorPanel>
          <EditorPanelSection id="focus-details" title="Posting details" summary="Design · Hybrid" defaultOpen>
            <Select aria-label="Team" size="sm" defaultValue="design" items={[{ value: "design", label: "Design" }, { value: "eng", label: "Engineering" }]} />
            <Select aria-label="Work model" size="sm" defaultValue="hybrid" items={[{ value: "hybrid", label: "Hybrid" }, { value: "remote", label: "Remote" }, { value: "office", label: "Office" }]} />
          </EditorPanelSection>
        </EditorPanel>
      </EditorLayout>
    </div>
  );
}
