"use client";

import * as React from "react";
import { BlockEditor } from "@vamos-cms/ui/editor";
import { renderDoc } from "@vamos-cms/ui/render";
import type { VamosDoc } from "@vamos-cms/ui/blocks/schema";
import { siteBlocks } from "./_blocks";

const initial: VamosDoc = {
  version: 1,
  lang: "en",
  blocks: [
    { id: "b_r_h2_01", type: "heading", props: { level: 2 }, content: [{ text: "Opening our " }, { text: "Kadıköy", marks: [{ type: "italic" }] }, { text: " clinic" }] },
    { id: "b_r_p_001", type: "paragraph", content: [{ text: "From 2 December we see patients six days a week at Moda Caddesi 41. Existing bookings move automatically; nobody needs to call us." }] },
    { id: "b_r_faq01", type: "faq", v: 1, props: { title: "Good to *know*", items: [{ q: "Is there parking?", a: { type: "doc", content: [{ type: "paragraph", content: [{ text: "Yes, two free spaces in front of the building." }] }] } }] } },
  ],
};

// Left: the editor. Right: the same VamosDoc through renderDoc — what the site ships (no editor code).
export default function RenderSideBySide() {
  const [doc, setDoc] = React.useState(initial);
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <div className="min-w-0 overflow-hidden rounded-ui-lg border border-line">
        <p className="border-b border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">Editor</p>
        <BlockEditor value={doc} onChange={setDoc} registry={siteBlocks} variant="document" aria-label="Announcement" />
      </div>
      <div className="min-w-0 overflow-hidden rounded-ui-lg border border-line bg-scene">
        <p className="border-b border-line px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">renderDoc — site output</p>
        <div className="py-6">{renderDoc(doc, { registry: siteBlocks, locale: "en" })}</div>
      </div>
    </div>
  );
}
