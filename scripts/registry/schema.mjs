// @ts-check
/**
 * JSON Schemas published next to the registry, and the theme-axes document.
 *   r/schema.json        RegistryItem (r/<name>.json)
 *   r/index-schema.json  r/index.json
 *   r/config-schema.json vamos.json in a user project
 *   r/axes.json          the five theme axes
 */

const BASE = "https://ui.vamos.ist/r";
const NAME_PATTERN = "^[a-z0-9][a-z0-9-]*$";

export const AXES = [
  {
    name: "theme",
    attribute: "class",
    values: ["light", "dark"],
    default: "light",
    description: 'Colour scheme. Add class "dark" for dark; no class (or "light") for light. Never use dark: variants — tokens switch automatically.',
  },
  {
    name: "material",
    attribute: "data-material",
    values: ["solid", "glass"],
    default: "solid",
    description: "Surface material. glass = translucent Liquid Glass surfaces with backdrop blur (sidebar, top bar and the topmost layer only).",
  },
  {
    name: "accent",
    attribute: "data-accent",
    values: ["lime", "ocean", "ember", "rose", "graphite"],
    default: "lime",
    description: "Accent colour. Every accent token is derived from --accent-base; set it yourself for a brand colour.",
  },
  {
    name: "density",
    attribute: "data-density",
    values: ["comfortable", "compact"],
    default: "comfortable",
    description: "Control heights, radius, gaps and table rows. compact suits data-heavy admin screens.",
  },
  {
    name: "font",
    attribute: "data-font",
    values: ["editorial", "grotesk", "corporate", "system"],
    default: "editorial",
    description: "Type pairing (UI, heading, code) plus heading character: weight, tracking, <em> style and display scale.",
  },
];

export function axesDocument() {
  return {
    target: "html",
    note: "Set axes on <html> or on any element; each subtree can override them independently.",
    axes: AXES.map((a) => ({ ...a, values: [...a.values] })),
    example: '<html class="dark" data-material="glass" data-accent="ocean" data-density="compact" data-font="grotesk">',
  };
}

const str = { type: "string" };
const strList = { type: "array", items: str };

const indexItemProps = {
  name: { type: "string", pattern: NAME_PATTERN, description: "Unique item name; also the file name r/<name>.json." },
  type: { enum: ["component", "block", "lib", "style"] },
  title: { type: "string", minLength: 1 },
  description: { type: "string" },
  group: { type: "string", description: "Docs group (components)." },
  category: { type: "string", description: "Block category." },
  tags: strList,
  docs: { type: "string", format: "uri", pattern: "^https?://" },
};

export function itemSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${BASE}/schema.json`,
    title: "Vamos UI registry item",
    type: "object",
    additionalProperties: false,
    required: ["name", "type", "title", "description", "docs", "dependencies", "registryDependencies", "files"],
    properties: {
      ...indexItemProps,
      dependencies: { type: "array", items: { type: "string", pattern: "^(@[a-z0-9._-]+/)?[a-z0-9._-]+(@.+)?$" }, description: 'npm packages with version ranges, e.g. "radix-ui@^1.8.1".' },
      registryDependencies: { type: "array", items: { type: "string", pattern: NAME_PATTERN }, description: "Other registry items this item needs." },
      files: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["path", "content"],
          properties: {
            path: { type: "string", pattern: "^(?!/)(?!.*\\.\\./).+$", description: 'Relative to the kit source root ("components/button.tsx") or "blocks/<name>/<file>".' },
            content: str,
          },
        },
      },
      usage: str,
      props: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["component", "props"],
          properties: {
            component: str,
            props: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "type", "description"],
                properties: { name: str, type: str, default: str, description: str },
              },
            },
          },
        },
      },
      examples: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "code"],
          properties: { title: str, description: str, code: str },
        },
      },
      guidance: {
        type: "object",
        additionalProperties: false,
        required: ["whenToUse", "avoidWhen", "related"],
        properties: { whenToUse: strList, avoidWhen: strList, related: strList, a11y: strList },
      },
    },
  };
}

export function indexSchema() {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${BASE}/index-schema.json`,
    title: "Vamos UI registry index",
    type: "object",
    additionalProperties: false,
    required: ["name", "version", "homepage", "items"],
    properties: {
      name: { const: "vamos-ui" },
      version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+" },
      homepage: { type: "string", pattern: "^https?://" },
      items: {
        type: "array",
        items: { type: "object", additionalProperties: false, required: ["name", "type", "title", "description", "docs"], properties: indexItemProps },
      },
    },
  };
}

export function configSchema() {
  const axisProps = Object.fromEntries(AXES.map((a) => [a.name, { enum: [...a.values], description: a.description }]));
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `${BASE}/config-schema.json`,
    title: "vamos.json",
    description: "Vamos UI project configuration, written by `npx vamos-ui init`.",
    type: "object",
    required: ["registry", "uiDir", "blocksDir", "css", "importAlias"],
    properties: {
      $schema: str,
      registry: { type: "string", default: BASE, description: "Registry URL or local directory." },
      uiDir: { type: "string", default: "src/components/vamos", description: "Where kit files are written (packages/ui/src structure is kept)." },
      blocksDir: { type: "string", default: "src/components/blocks", description: "Where block folders are written." },
      css: { type: "string", default: "src/app/globals.css", description: "Stylesheet that imports styles.css." },
      importAlias: { type: "string", default: "@/components/vamos", description: '"@vamos-ui/react" imports are rewritten to this alias.' },
      tsx: { type: "boolean", default: true },
      theme: { type: "object", additionalProperties: false, properties: axisProps, description: "Theme axes chosen with `npx vamos-ui theme`." },
    },
  };
}
