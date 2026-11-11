import type { ComponentType } from "react";

/** Where a block is used. Keep this list short and stable; it drives the /blocks filter. */
export const blockCategories = [
  "App shells",
  "Dashboards",
  "Authentication",
  "List pages",
  "Detail pages",
  "Settings & forms",
  "Onboarding",
  "Empty & error states",
  "Website pages",
  "Marketing sections",
] as const;
export type BlockCategory = (typeof blockCategories)[number];

/** Each block folder has meta.ts (default export BlockMeta) and page.tsx (default export component). */
export interface BlockMeta {
  title: string;
  description: string;
  category: BlockCategory;
  /** Files under src/blocks shown in the Code tab, main file first. */
  files: string[];
  /** Lower comes first inside the list. */
  order?: number;
  /** Domain tags for filtering: "cms", "crm", "hr", "ops", "site", "any". */
  tags?: string[];
}

export interface BlockEntry extends BlockMeta {
  name: string;
  /** Loads the block's page module on demand (one chunk per block). */
  load: () => Promise<{ default: ComponentType }>;
}
