import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Rail & flyout shell",
  description:
    "A 60px icon rail whose icons open flyout panels with each section's navigation; pin a panel beside the page or let it float and close on Escape. Shown with a website media library: folders and smart collections, multi-select with move and undoable delete, simulated uploads, and an inspector for alt text that saves optimistically.",
  category: "App shells",
  order: 50,
  tags: ["cms", "site"],
  files: [
    "shell-05/page.tsx",
    "shell-05/components/rail.tsx",
    "shell-05/components/media-library.tsx",
    "shell-05/components/asset-inspector.tsx",
    "shell-05/data.ts",
  ],
};

export default meta;
