import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Side-by-side compare",
  description:
    "Compare up to four candidates for one role in aligned columns: profile, a 1–4 scorecard drawn as pips, take-home and interviewer recommendations, salary against the band, notice period and notes. Switch to differences only, mark the best value per row, pick a baseline to see deltas, add or remove columns, shortlist, and move one candidate to offer with a confirmation and undo. On phones each row label sits above its values and the columns scroll sideways.",
  category: "Detail pages",
  order: 130,
  tags: ["hr", "any"],
  files: [
    "detail-13/page.tsx",
    "detail-13/components/compare-view.tsx",
    "detail-13/components/compare-rows.tsx",
    "detail-13/components/compare-data.ts",
    "_shared/hr.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
