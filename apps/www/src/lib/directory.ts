export type DirectoryCategory = "Components" | "Blocks" | "Charts" | "Locale";
export type DirectoryStatus = "first-party" | "verified" | "open-slot";

export interface DirectoryEntry {
  name: string;
  description: string;
  category: DirectoryCategory;
  status: DirectoryStatus;
  install?: string;
  href?: string;
}

/** First-party registries plus open slots. Third-party entries are added after review. */
export const directory: DirectoryEntry[] = [
  { name: "@vamos/ui", description: "The core kit: foundations, forms, pickers, overlays, navigation, layouts and data display.", category: "Components", status: "first-party", install: "npx vamos-ui add button", href: "/docs/components" },
  { name: "@vamos/blocks", description: "Full screens built from the kit: app shells, dashboards, CRM, HR and CMS screens, site sections.", category: "Blocks", status: "first-party", href: "/blocks" },
  { name: "@vamos/charts", description: "Chart frame, area, bar, line, donut, funnel, gauge and heatmap — token colours, locale formatting.", category: "Charts", status: "first-party", href: "/charts" },
  { name: "@vamos/locale-tr", description: "Turkish strings plus TCKN/VKN/IBAN validation, KDV rules, public holidays and provinces.", category: "Locale", status: "first-party", href: "/docs/localization" },
  { name: "Your registry here", description: "Component registries that pass the review checklist are listed here.", category: "Components", status: "open-slot", href: "#submit" },
  { name: "Your registry here", description: "Block and template registries built on Vamos UI tokens.", category: "Blocks", status: "open-slot", href: "#submit" },
  { name: "Your registry here", description: "Locale packs for more languages and countries.", category: "Locale", status: "open-slot", href: "#submit" },
];
