"use client";

import * as React from "react";
import { Container, Section, SectionHeader, type BlockComponentProps } from "@vamos-ui/react/blocks";
import { z, f, defineBlock, createRegistry, type VamosDoc } from "@vamos-ui/react/blocks/schema";
import { BlockEditor, BlockEditorBubbleMenu, BlockEditorContent, BlockEditorDragHandle, BlockEditorSlashMenu, BlockInserter, BlockInspector } from "@vamos-ui/react/editor";

// 1. The component: a plain server-compatible React component the site renders.
type StatsProps = BlockComponentProps<{ title: string; stats: { value: string; label: string }[]; source?: string }>;

function Stats({ id = "stats", title, stats, source, headingLevel = 2, theme, anchor, editMode }: StatsProps) {
  const hid = `${id}-title`;
  return (
    <Section theme={theme} anchor={anchor} headingId={hid} blockId={id} blockType="stats" editMode={editMode}>
      <Container className="flex flex-col gap-8">
        <SectionHeader title={title} headingLevel={headingLevel} headingId={hid} editMode={editMode} />
        <dl className="grid gap-x-8 gap-y-6 border-t border-line pt-6 @2xl:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <dt className="order-2 text-small text-fg-muted">{s.label}</dt>
              <dd className="order-1 tabular font-display text-display-m text-fg">{s.value}</dd>
            </div>
          ))}
        </dl>
        {source ? <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-subtle">{source}</p> : null}
      </Container>
    </Section>
  );
}

// 2. The definition: schema (validation + inspector), defaults, preview copy, version.
const statsBlock = defineBlock({
  type: "stats",
  version: 1,
  title: "Key figures",
  description: "Three numbers with labels and a source line.",
  category: "proof",
  icon: "sparkles",
  keywords: ["numbers", "metrics", "results"],
  schema: z.object({
    title: f.heading({ max: 70, label: "Title" }),
    stats: f.list(f.group({ value: f.text({ max: 12, localized: false, label: "Figure" }), label: f.text({ max: 60, label: "Label" }) }), { min: 1, max: 3, label: "Figures", itemLabel: "Figure {n}" }),
    source: f.text({ max: 80, label: "Source" }).optional(),
  }),
  preview: {
    props: {
      title: "A year on *Harbor*",
      stats: [
        { value: "41%", label: "fewer no-shows across 120 clinics" },
        { value: "6 min", label: "median time to refill a cancelled slot" },
        { value: "$2.1M", label: "chair time recovered in 2026" },
      ],
      source: "Harbor customer data, Jan–Oct 2026",
    },
  },
  component: Stats,
});

// 3. A registry: the site and the editor import the same one.
const registry = createRegistry([statsBlock]);

const initial: VamosDoc = {
  version: 1,
  blocks: [
    { id: "b_intro01", type: "paragraph", content: [{ text: "Harbor’s first full year with clinics across Istanbul and Izmir, in three numbers." }] },
    { id: "b_stats01", type: "stats", v: 1, props: statsBlock.sample() as Record<string, unknown> },
  ],
};

export default function CustomBlock() {
  return (
    <BlockEditor defaultValue={initial} registry={registry} variant="canvas" canvasTheme={{ accent: "ocean" }}>
      <div className="grid w-full overflow-hidden rounded-ui-lg border border-line lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 bg-scene">
          <BlockEditorContent />
          <BlockInserter />
        </div>
        <aside aria-label="Block settings" className="border-line bg-surface-2 p-4 max-lg:border-t lg:border-s">
          <BlockInspector />
        </aside>
      </div>
      <BlockEditorBubbleMenu />
      <BlockEditorSlashMenu />
      <BlockEditorDragHandle />
    </BlockEditor>
  );
}
