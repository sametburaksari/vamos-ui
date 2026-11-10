/** Registry shapes — mirror of the static JSON served at https://ui.vamos.ist/r/. */

export type ItemType = "component" | "block" | "lib" | "style";

export interface RegistryIndexItem {
  name: string;
  type: ItemType;
  title: string;
  description: string;
  /** Docs group for components ("Forms & inputs", "Overlays & feedback", …). */
  group?: string;
  /** Block category ("Dashboards", "Authentication", …). */
  category?: string;
  tags?: string[];
  /** Absolute docs URL. */
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

export interface ComponentProps {
  component: string;
  props: PropRow[];
}

export interface RegistryExample {
  title: string;
  description?: string;
  code: string;
}

export interface Guidance {
  whenToUse: string[];
  avoidWhen: string[];
  related: string[];
  a11y?: string[];
}

export interface RegistryItem extends RegistryIndexItem {
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
  usage?: string;
  props?: ComponentProps[];
  examples?: RegistryExample[];
  guidance?: Guidance;
}

export interface Token {
  name: string;
  light?: string;
  dark?: string;
  description?: string;
}

export interface Axis {
  /** Short axis name: theme, material, accent, density, font. */
  name: string;
  /** How it is set: `class="dark"` or the data attribute name. */
  attribute: string;
  values: string[];
  default: string;
  description?: string;
}

/** Same verify contract as `vamos-ui/verify`. */
export interface VerifyIssue {
  rule: string;
  severity: "error" | "warning";
  message: string;
  line: number;
  column: number;
  fix?: string;
}

/** vamos.brand.json — the project's brand profile (schema: https://ui.vamos.ist/r/brand-schema.json). */
export interface Brand {
  $schema?: string;
  name: string;
  colors: { accent: string; accentDark?: string; neutralTint?: string };
  fonts?: { display?: string; body?: string; mono?: string };
  theme?: {
    dark?: boolean;
    material?: "glass" | "solid";
    density?: "comfortable" | "compact";
    radius?: "sharp" | "default" | "round";
  };
  voice?: { tone?: string; rules?: string[]; examples?: { do: string; dont?: string }[] };
  assets?: { path: string; use: string }[];
  source?: { url?: string; importedAt?: string };
}

/** Result of generateAccent() in "vamos-ui/brand". */
export interface GeneratedAccent {
  base: string;
  fg: string;
  inkLight: string;
  inkDark: string;
  /** Dark-mode fill override, when the base would vanish on dark surfaces or accentDark is set. */
  dark?: { base: string; fg: string };
  contrast: { fgOnBase: number; inkLightOnLight: number; inkDarkOnDark: number; darkFgOnBase?: number };
  warnings: string[];
}

/** A brand problem, normalised from checkBrand() or found by the MCP server itself. */
export interface BrandIssue {
  severity: "error" | "warning";
  message: string;
  /** JSON path or file the issue is about, e.g. "colors.accent" or "assets[0].path". */
  path?: string;
}
