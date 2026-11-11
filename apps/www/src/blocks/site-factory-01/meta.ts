import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Manufacturer website",
  description:
    "Precision-machining plant in steel and signal orange: the hero laid out as a drawing sheet with zone markers and a title block, figures, product families drawn in section, capabilities, industries, drawing-to-series steps, an RFQ form and the plant map; a product catalogue with spec tables, a metric / imperial switch, a drawing that follows the selected size and a CSV datasheet download; and a quality page with a live SPC chart, quality gates and certificates. EN / TR.",
  category: "Website pages",
  order: 90,
  tags: ["site"],
  files: [
    "site-factory-01/page.tsx",
    "site-factory-01/components/factory-site.tsx",
    "site-factory-01/components/home-parts.tsx",
    "site-factory-01/components/catalogue.tsx",
    "site-factory-01/components/quality-parts.tsx",
    "site-factory-01/components/drawing.tsx",
    "site-factory-01/components/factory-type.tsx",
    "site-factory-01/components/content.ts",
  ],
};

export default meta;
