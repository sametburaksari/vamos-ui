import type { ComponentType } from "react";

export interface Example {
  id: string;
  title: string;
  description?: string;
  /** File under src/docs/examples — the Code tab reads this file. */
  file: string;
  Component: ComponentType;
}

export interface Prop {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface DocEntry {
  slug: string;
  title: string;
  group: string;
  description: string;
  /** Source file(s) under packages/ui/src. */
  source: string[];
  /** Underlying primitive (Radix etc.). */
  basedOn?: string;
  usage: string;
  demo: Example;
  examples: Example[];
  api: { name: string; props: Prop[] }[];
  notes?: string[];
  /** Exact inventory names (apps/www/src/lib/inventory.ts) this page documents — marks them "ready". */
  covers: string[];
}

export const ex = (id: string, title: string, file: string, Component: ComponentType, description?: string): Example => ({ id, title, file, Component, description });
