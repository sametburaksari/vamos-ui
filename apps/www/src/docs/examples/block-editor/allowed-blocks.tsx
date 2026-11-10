"use client";

import { BlockEditor } from "@vamos-cms/ui/editor";
import type { VamosDoc } from "@vamos-cms/ui/blocks/schema";

// A CRM quote description: text, lists and a table only. Page blocks are not offered.
const scope: VamosDoc = {
  version: 1,
  blocks: [
    { id: "b_q_h2_01", type: "heading", props: { level: 2 }, content: [{ text: "Scope of work" }] },
    { id: "b_q_p_001", type: "paragraph", content: [{ text: "Migration of 14 clinic calendars to Harbor, with two training sessions for front-desk staff." }] },
    {
      id: "b_q_tab01",
      type: "table",
      slots: {
        items: [
          { id: "b_q_r0001", type: "table-row", slots: { items: [{ id: "b_q_c0001", type: "table-cell", props: { header: true }, content: [{ text: "Phase" }] }, { id: "b_q_c0002", type: "table-cell", props: { header: true }, content: [{ text: "Weeks" }] }, { id: "b_q_c0003", type: "table-cell", props: { header: true }, content: [{ text: "Owner" }] }] } },
          { id: "b_q_r0002", type: "table-row", slots: { items: [{ id: "b_q_c0004", type: "table-cell", content: [{ text: "Data import" }] }, { id: "b_q_c0005", type: "table-cell", content: [{ text: "2" }] }, { id: "b_q_c0006", type: "table-cell", content: [{ text: "Harbor" }] }] } },
          { id: "b_q_r0003", type: "table-row", slots: { items: [{ id: "b_q_c0007", type: "table-cell", content: [{ text: "Training" }] }, { id: "b_q_c0008", type: "table-cell", content: [{ text: "1" }] }, { id: "b_q_c0009", type: "table-cell", content: [{ text: "Clinic leads" }] }] } },
        ],
      },
    },
  ],
};

export default function AllowedBlocks() {
  return (
    <div className="w-full overflow-hidden rounded-ui-lg border border-line">
      <BlockEditor defaultValue={scope} variant="document" allowedBlocks={["paragraph", "heading", "list", "table"]} aria-label="Quote description" placeholder="Describe the scope. Type / for lists and tables." />
    </div>
  );
}
