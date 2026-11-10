"use client";

import { Alert, Button, EditorBar, EditorCanvas, EditorLayout, EditorPanel, EditorPanelSection, Input, SaveStatus } from "@vamos-cms/ui";

// Narrow container: the panel opens as a non-modal sheet from the bar; the bar keeps the primary
// action and moves the rest into "⋯". The read-only variant locks the panel and hides actions.
export default function EditorLayoutMobile() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-6">
      <div className="h-[560px] w-[380px] max-w-full overflow-hidden rounded-[28px] border border-line bg-scene">
        <EditorLayout scroll="panes" shortcuts={false} defaultPanelOpen={false}>
          <EditorBar
            back={{ href: "/prm/contracts", label: "Contracts" }}
            title="Atlas reseller agreement"
            status={<SaveStatus state="dirty" guard={false} />}
            secondaryActions={<Button size="sm" variant="ghost">Compare</Button>}
            actions={<Button size="sm" variant="primary">Send</Button>}
            menu={[{ id: "compare", label: "Compare versions" }, { id: "pdf", label: "Download PDF" }]}
          />
          <EditorCanvas>
            <h2 className="font-display text-[24px] leading-tight">Reseller agreement</h2>
            <p className="text-[15px] leading-relaxed text-fg-muted">
              1. Territory. Atlas Distribution is appointed as a non-exclusive reseller of the Products in the EMEA region for an initial term of 24 months.
            </p>
          </EditorCanvas>
          <EditorPanel>
            <EditorPanelSection id="mobile-terms" title="Commercial terms" summary="20% margin · Net 30" defaultOpen>
              <Input aria-label="Margin" defaultValue="20" addonEnd="%" size="sm" />
            </EditorPanelSection>
          </EditorPanel>
        </EditorLayout>
      </div>
      <div className="h-[560px] w-[380px] max-w-full overflow-hidden rounded-[28px] border border-line bg-scene">
        <EditorLayout scroll="panes" shortcuts={false} readOnly defaultPanelOpen={false}>
          <EditorBar back={{ href: "/prm/contracts", label: "Contracts" }} title="Version 3 · signed" actions={<Button size="sm" variant="primary">Send</Button>} />
          <EditorCanvas notice={<Alert tone="info" title="You're viewing a locked version">Signed on Oct 14, 2026. Restore it to make changes.</Alert>}>
            <p className="text-[15px] leading-relaxed text-fg-muted">1. Territory. Atlas Distribution is appointed as a non-exclusive reseller…</p>
          </EditorCanvas>
          <EditorPanel>
            <EditorPanelSection id="mobile-locked" title="Commercial terms" summary="20% margin · Net 30">
              <Input aria-label="Margin (locked)" defaultValue="20" addonEnd="%" size="sm" />
            </EditorPanelSection>
          </EditorPanel>
        </EditorLayout>
      </div>
    </div>
  );
}
