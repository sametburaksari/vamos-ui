"use client";

import { Button, EditorBar, EditorCanvas, EditorLayout, EditorPanel, EditorPanelContent, EditorPanelSection, Input, SaveStatus, Select, Switch } from "@vamos-ui/react";

// Email template editor: "Document" and "Block" tabs in the panel, each with its own sections.
export default function EditorLayoutPanelTabs() {
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-ui-lg border border-line bg-scene">
      <EditorLayout scroll="panes" shortcuts={false}>
        <EditorBar
          back={{ href: "/crm/templates", label: "Templates" }}
          title="Renewal reminder — 30 days"
          status={<SaveStatus state="saved" guard={false} />}
          actions={<Button size="sm" variant="primary">Save template</Button>}
        />
        <EditorCanvas width="prose" tone="scene">
          <article className="surface rounded-ui-lg p-8 text-[15px] leading-relaxed">
            <p className="text-fg-subtle">Hi {"{{first_name}}"},</p>
            <p className="mt-3">Your Northwind plan renews on {"{{renewal_date}}"}. Nothing changes unless you want it to — here's a summary of what you're using today.</p>
            <div className="mt-5 rounded-ui bg-accent-soft px-4 py-3 text-[14px] text-accent-ink" data-selected-block>
              <strong>12 seats · Analytics add-on</strong> — $36,000 per year
            </div>
            <p className="mt-5">Reply to this email or book a call with {"{{owner_name}}"} if you'd like to review your plan.</p>
          </article>
        </EditorCanvas>
        <EditorPanel
          defaultValue="block"
          tabs={[
            { id: "document", label: "Document" },
            { id: "block", label: "Block" },
          ]}
        >
          <EditorPanelContent value="document">
            <EditorPanelSection id="tabs-subject" title="Subject & sender" summary="Your plan renews soon" defaultOpen>
              <Input aria-label="Subject" defaultValue="Your plan renews soon" size="sm" />
              <Select aria-label="Sender" size="sm" defaultValue="owner" items={[{ value: "owner", label: "Account owner" }, { value: "team", label: "Northwind team" }]} />
            </EditorPanelSection>
            <EditorPanelSection id="tabs-tracking" title="Tracking" summary="Opens and clicks">
              <label className="flex items-center justify-between gap-3">
                Track opens <Switch defaultChecked />
              </label>
            </EditorPanelSection>
          </EditorPanelContent>
          <EditorPanelContent value="block">
            <EditorPanelSection id="tabs-callout" title="Callout" summary="Accent · Rounded" defaultOpen>
              <Select aria-label="Callout style" size="sm" defaultValue="accent" items={[{ value: "accent", label: "Accent" }, { value: "neutral", label: "Neutral" }, { value: "warning", label: "Warning" }]} />
              <label className="flex items-center justify-between gap-3">
                Hide on mobile <Switch />
              </label>
            </EditorPanelSection>
          </EditorPanelContent>
        </EditorPanel>
      </EditorLayout>
    </div>
  );
}
