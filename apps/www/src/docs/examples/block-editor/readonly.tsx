"use client";

import { BlockEditor, BlockEditorContent, BlockEditorOutline } from "@vamos-ui/react/editor";
import type { VamosDoc } from "@vamos-ui/react/blocks/schema";

// An HR policy, published and locked: readable, outlined, not editable.
const policy: VamosDoc = {
  version: 1,
  lang: "en",
  blocks: [
    { id: "b_hr_h2_1", type: "heading", props: { level: 2 }, content: [{ text: "Remote work policy" }] },
    { id: "b_hr_p_01", type: "paragraph", content: [{ text: "Effective 1 January 2027. Applies to every full-time employee after their probation period." }] },
    { id: "b_hr_h3_1", type: "heading", props: { level: 3 }, content: [{ text: "Eligibility" }] },
    { id: "b_hr_l_01", type: "list", props: { ordered: true }, slots: { items: [{ id: "b_hr_li01", type: "list-item", content: [{ text: "Agree the days with your manager in the HR portal." }] }, { id: "b_hr_li02", type: "list-item", content: [{ text: "Work from a location with a stable connection and no customer data on screen in public." }] }] } },
    { id: "b_hr_h3_2", type: "heading", props: { level: 3 }, content: [{ text: "Equipment" }] },
    { id: "b_hr_p_02", type: "paragraph", content: [{ text: "The company provides a laptop and a monitor. A home-office allowance of " }, { text: "₺2,500 per year", marks: [{ type: "bold" }] }, { text: " is paid with the January payroll." }] },
    { id: "b_hr_q_01", type: "quote", props: { cite: "People team" }, content: [{ text: "Questions go to people@harbor.example, answered within two working days." }] },
  ],
};

export default function ReadOnlyPolicy() {
  return (
    <BlockEditor defaultValue={policy} readOnly aria-label="Remote work policy">
      <div className="grid w-full overflow-hidden rounded-ui-lg border border-line md:grid-cols-[minmax(0,1fr)_14rem]">
        <BlockEditorContent />
        <div className="border-line bg-surface-2 p-4 max-md:border-t md:border-s">
          <BlockEditorOutline />
        </div>
      </div>
    </BlockEditor>
  );
}
