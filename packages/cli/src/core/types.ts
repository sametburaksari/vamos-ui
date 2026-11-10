export type ItemType = "component" | "block" | "lib" | "style";

export interface RegistryIndexItem {
  name: string;
  type: ItemType;
  title: string;
  description: string;
  group?: string;
  category?: string;
  tags?: string[];
  docs: string;
}

export interface RegistryIndex {
  name: string;
  version: string;
  homepage: string;
  items: RegistryIndexItem[];
}

export interface RegistryFile {
  path: string;
  content: string;
}

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface RegistryItem extends RegistryIndexItem {
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  usage?: string;
  props?: { component: string; props: PropRow[] }[];
  examples?: { title: string; description?: string; code: string }[];
  guidance?: { whenToUse: string[]; avoidWhen: string[]; related: string[]; a11y?: string[] };
}

export interface ThemeConfig {
  theme?: "light" | "dark";
  material?: string;
  accent?: string;
  density?: string;
  font?: string;
}

export interface VamosConfig {
  $schema?: string;
  registry: string;
  uiDir: string;
  blocksDir: string;
  css: string;
  importAlias: string;
  tsx: boolean;
  theme?: ThemeConfig;
}

export class CliError extends Error {
  constructor(
    message: string,
    public hint?: string,
  ) {
    super(message);
    this.name = "CliError";
  }
}
