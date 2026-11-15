import type { Preset } from "@/lib/theme-codec";

export interface CuratedPreset {
  name: string;
  /** What kind of product the preset suits. */
  note: string;
  preset: Preset;
}

/** Starting points on /themes. Fictional brands. */
export const curatedPresets: CuratedPreset[] = [
  { name: "Lime House", note: "The house default", preset: { theme: "light", material: "glass", accent: "lime", density: "comfortable", font: "editorial", radius: "default", scene: "neutral" } },
  { name: "Harbour Ops", note: "Dispatch console", preset: { theme: "dark", material: "glass", accent: "ocean", density: "compact", font: "grotesk", radius: "default", scene: "neutral" } },
  { name: "Ledger & Kemp", note: "Accounting firm", preset: { theme: "light", material: "solid", accent: "graphite", density: "compact", font: "corporate", radius: "sharp", scene: "neutral" } },
  { name: "Saltwater Spa", note: "Booking site", preset: { theme: "light", material: "glass", accent: "rose", density: "comfortable", font: "editorial", radius: "round", scene: "neutral" } },
  { name: "Kiln Studio", note: "Ceramics shop", preset: { theme: "dark", material: "solid", accent: "ember", density: "comfortable", font: "grotesk", radius: "default", scene: "neutral" } },
  { name: "Northline Freight", note: "Brand colour", preset: { theme: "light", material: "solid", accent: "#3b4bd8", density: "compact", font: "system", radius: "sharp", scene: "neutral" } },
  { name: "Gazette Hall", note: "Broadsheet archive", preset: { theme: "light", material: "solid", accent: "#9a3b16", density: "compact", font: "bookish", radius: "none", scene: "paper" } },
  { name: "Night Shift FM", note: "Music and video", preset: { theme: "dark", material: "solid", accent: "#19e3c4", density: "compact", font: "neon", radius: "pill", scene: "ink" } },
  { name: "Olive Press", note: "Recipe CMS", preset: { theme: "dark", material: "glass", accent: "#c9a227", density: "comfortable", font: "editorial", radius: "round", scene: "neutral" } },
];
