import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Page builder shell",
  description:
    "CMS editor chrome for building pages from sections: a layers outline with reorder and hide, a live canvas that switches between desktop, tablet and phone widths, and an inspector with content and style tabs. Undo / redo, autosave status, add-section library and publish. Panels fold into sheets on smaller screens with a bottom toolbar on phones.",
  category: "App shells",
  order: 120,
  tags: ["cms", "site"],
  files: [
    "shell-12/page.tsx",
    "shell-12/components/builder.tsx",
    "shell-12/components/canvas.tsx",
    "shell-12/components/panels.tsx",
    "shell-12/components/data.ts",
  ],
};

export default meta;
