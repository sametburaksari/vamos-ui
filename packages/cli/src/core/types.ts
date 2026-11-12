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

/** Where a third-party item came from (see core/sources.ts). */
export interface ItemSource {
  kind: "url" | "github" | "namespace" | "file";
  /** Canonical spec: the lock and resolver key, e.g. "@acme/stat-card" or "github:acme/ui/stat-card". */
  key: string;
  name: string;
  /** Fetch URL, or an absolute path for kind "file". */
  url: string;
  /** Shown to the user before anything is written. */
  host: string;
  github?: { owner: string; repo: string; path: string; ref: string; name: string };
}

export interface RegistryItem extends RegistryIndexItem {
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  usage?: string;
  props?: { component: string; props: PropRow[] }[];
  examples?: { title: string; description?: string; code: string }[];
  guidance?: { whenToUse: string[]; avoidWhen: string[]; related: string[]; a11y?: string[] };
  /** Set by the CLI for third-party items: resolver/lock key (the name otherwise). Not part of the JSON. */
  key?: string;
  /** Set by the CLI for third-party items. Not part of the JSON. */
  source?: Pick<ItemSource, "kind" | "url" | "host">;
}

/** Lock / resolver key of an item: its spec for third-party items, its name otherwise. */
export function itemKey(item: Pick<RegistryItem, "name" | "key">): string {
  return item.key ?? item.name;
}

export interface ThemeConfig {
  theme?: "light" | "dark";
  material?: string;
  accent?: string;
  density?: string;
  font?: string;
  /** Corners → data-radius. "default" (or absent) leaves the attribute out. */
  radius?: "default" | "sharp" | "round";
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
  /** Namespaced third-party registries: { "@acme": "https://acme.dev/r/{name}.json" }. */
  registries?: Record<string, string>;
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
