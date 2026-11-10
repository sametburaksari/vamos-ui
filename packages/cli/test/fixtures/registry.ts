import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { RegistryIndex, RegistryItem } from "../../src/core/types";

const docs = (slug: string) => `https://ui.vamos.ist/docs/components/${slug}`;

const files = {
  "styles.css": `@import "./styles/base.css";\n\n:root {\n  --accent-base: oklch(0.89 0.21 122);\n}\n`,
  "styles/base.css": `.vui-focus { outline: 2px solid var(--ring); }\n`,
  "lib/cn.ts": `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n`,
  "lib/public.ts": `export { cn } from "./cn";\n`,
  "lib/labels.ts": `import { en } from "../locales/en";\n\nexport function useLabels() {\n  return en;\n}\n`,
  "locales/en.ts": `export const en = { close: "Close" };\n`,
  "components/tooltip.tsx": `import * as React from "react";\nimport { cn } from "../lib/cn";\n\nexport function Tooltip({ children }: { children: React.ReactNode }) {\n  return <span className={cn("vui-tooltip")}>{children}</span>;\n}\n`,
  "components/button.tsx": `import * as React from "react";\nimport { cn } from "../lib/cn";\nimport { Tooltip } from "./tooltip";\n\nexport function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {\n  return <button {...props} className={cn("bg-accent text-accent-fg", props.className)} />;\n}\n\nexport function IconButton({ label, ...props }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {\n  return <Tooltip><Button aria-label={label} {...props} /></Tooltip>;\n}\n`,
  "components/dialog.tsx": `import * as React from "react";\nimport { Dialog as DialogPrimitive } from "radix-ui";\nimport { useLabels } from "../lib/labels";\nimport { IconButton } from "./button";\n\nexport const Dialog = DialogPrimitive.Root;\nexport function DialogClose() {\n  const t = useLabels();\n  return <IconButton label={t.close}>x</IconButton>;\n}\n`,
  "data-table/data-table.tsx": `import * as React from "react";\nimport { useReactTable } from "@tanstack/react-table";\nimport { Button } from "../components/button";\nimport { cn } from "../lib/cn";\nimport type { DataTableProps } from "./types";\n\nexport function DataTable<T>(props: DataTableProps<T>) {\n  void useReactTable;\n  return <div className={cn("vui-table")}><Button>Export</Button>{props.data.length}</div>;\n}\n`,
  "data-table/types.ts": `export interface DataTableProps<T> {\n  data: T[];\n}\n`,
};

function item(partial: Partial<RegistryItem> & Pick<RegistryItem, "name" | "type">, paths: (keyof typeof files)[]): RegistryItem {
  return {
    title: partial.name,
    description: `${partial.name} fixture`,
    docs: docs(partial.name),
    dependencies: [],
    registryDependencies: [],
    ...partial,
    files: paths.map((p) => ({ path: p, content: files[p] })),
  };
}

export function fixtureItems(): RegistryItem[] {
  return [
    item({ name: "styles", type: "style", title: "Styles", description: "Tokens and component CSS" }, ["styles.css", "styles/base.css"]),
    item({ name: "lib-cn", type: "lib", tags: ["base"], dependencies: ["clsx@^2.1.1", "tailwind-merge@^3.3.1"] }, ["lib/cn.ts", "lib/public.ts"]),
    item({ name: "lib-labels", type: "lib" }, ["lib/labels.ts", "locales/en.ts"]),
    item({ name: "tooltip", type: "component", group: "Overlays", title: "Tooltip", description: "Short hint on hover and focus", registryDependencies: ["lib-cn"] }, ["components/tooltip.tsx"]),
    item(
      { name: "button", type: "component", group: "Actions", title: "Button", description: "Buttons and icon buttons", tags: ["action", "düğme"], registryDependencies: ["lib-cn", "tooltip"], dependencies: ["radix-ui@^1.4.3"], usage: `import { Button } from "@vamos-ui/react";\n\n<Button>Save</Button>` },
      ["components/button.tsx"],
    ),
    item(
      { name: "dialog", type: "component", group: "Overlays", title: "Dialog", description: "Modal dialog with focus trap", registryDependencies: ["button", "lib-labels"], dependencies: ["radix-ui@^1.4.3"] },
      ["components/dialog.tsx"],
    ),
    item(
      { name: "data-table", type: "component", group: "Data", title: "Data table", description: "Sortable, filterable table", registryDependencies: ["button", "lib-cn"], dependencies: ["@tanstack/react-table@^9.3.1"] },
      ["data-table/data-table.tsx", "data-table/types.ts"],
    ),
    {
      name: "dashboard-01",
      type: "block",
      category: "Dashboards",
      title: "Dashboard",
      description: "KPI dashboard",
      docs: "https://ui.vamos.ist/blocks/dashboard-01",
      dependencies: [],
      registryDependencies: ["button", "data-table"],
      files: [
        { path: "blocks/dashboard-01/page.tsx", content: `import { Button } from "@vamos-ui/react";\nimport { DataTable } from "@vamos-ui/react/data-table";\nimport { Stats } from "./components/stats";\n\nexport default function Page() {\n  return <main><Stats /><Button>New</Button><DataTable data={[]} /></main>;\n}\n` },
        { path: "blocks/dashboard-01/components/stats.tsx", content: `export function Stats() {\n  return <section className="text-fg-muted">Stats</section>;\n}\n` },
      ],
    },
  ];
}

/** Writes the fixture registry (index.json + <name>.json) into `dir`. */
export function writeFixtureRegistry(dir: string, items = fixtureItems()): string {
  mkdirSync(dir, { recursive: true });
  const index: RegistryIndex = {
    name: "vamos-ui",
    version: "0.2.0",
    homepage: "https://ui.vamos.ist",
    items: items.map(({ name, type, title, description, group, category, tags, docs }) => ({ name, type, title, description, docs, ...(group ? { group } : {}), ...(category ? { category } : {}), ...(tags ? { tags } : {}) })),
  };
  writeFileSync(path.join(dir, "index.json"), JSON.stringify(index, null, 2));
  for (const it of items) writeFileSync(path.join(dir, `${it.name}.json`), JSON.stringify(it, null, 2));
  return dir;
}
