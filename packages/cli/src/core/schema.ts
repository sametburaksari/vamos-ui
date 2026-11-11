/**
 * The registry item schema and a tiny validator, mirrored from scripts/registry/schema.mjs and
 * scripts/registry/json-schema.mjs (the build that publishes https://ui.vamos.ist/r). The CLI ships on
 * npm without the monorepo scripts, so it keeps its own copy; test/schema.test.ts fails when the
 * two drift apart.
 */

const BASE = "https://ui.vamos.ist/r";
export const NAME_PATTERN = "^[a-z0-9][a-z0-9-]*$";

type Schema = Record<string, any>;

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

/** Exactly the schema the build validates and publishes as r/schema.json. */
export function itemSchema(): Schema {
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

/**
 * Registry dependencies a third-party item may list: a kit item name ("button"), a sibling in the
 * same registry ("./stat-card"), a namespaced item ("@acme/stat-card"), a GitHub item
 * ("github:owner/repo/stat-card") or a full https URL to an item JSON.
 */
export const EXTERNAL_DEPENDENCY_PATTERN = "^(?:[a-z0-9][a-z0-9-]*|\\./[a-z0-9][a-z0-9-]*|@[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9-]*|github:[^\\s]+|https?://[^\\s]+)$";

/** npm specs a third-party item may list: a name with an optional semver range or dist-tag, nothing else (no git, file or URL specs). */
export const EXTERNAL_NPM_PATTERN = "^(@[a-z0-9._-]+/)?[a-z0-9._-]+(@[\\^~<>=*xX0-9a-zA-Z.\\s|+-]+)?$";

/** The item schema with the wider registryDependencies and stricter npm specs third-party items use. */
export function externalItemSchema(): Schema {
  const s = itemSchema();
  s.properties.registryDependencies = { ...s.properties.registryDependencies, items: { type: "string", pattern: EXTERNAL_DEPENDENCY_PATTERN } };
  s.properties.dependencies = { ...s.properties.dependencies, items: { type: "string", pattern: EXTERNAL_NPM_PATTERN } };
  return s;
}

/** The index a third-party registry publishes next to its items (any name). */
export function externalIndexSchema(): Schema {
  return {
    type: "object",
    additionalProperties: false,
    required: ["name", "version", "homepage", "items"],
    properties: {
      name: { type: "string", pattern: NAME_PATTERN },
      version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+" },
      homepage: { type: "string", pattern: "^https?://" },
      items: {
        type: "array",
        items: { type: "object", additionalProperties: false, required: ["name", "type", "title", "description", "docs"], properties: indexItemProps },
      },
    },
  };
}

/**
 * Tiny JSON Schema validator covering the keywords the schemas use: type, enum, const, required,
 * properties, additionalProperties (false), items, pattern, minLength. Same as the build's.
 */
export function validateSchema(value: unknown, schema: Schema, at = "$"): string[] {
  const errors: string[] = [];
  const typeOf = (v: unknown) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "number" && Number.isInteger(v) ? "integer" : typeof v);
  if ("const" in schema && value !== schema.const) errors.push(`${at}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: must be one of ${schema.enum.map((v: unknown) => JSON.stringify(v)).join(", ")}`);
  if (schema.type) {
    const types: string[] = Array.isArray(schema.type) ? schema.type : [schema.type];
    const t = typeOf(value);
    const ok = types.some((want) => want === t || (want === "number" && t === "integer"));
    if (!ok) {
      errors.push(`${at}: expected ${types.join(" | ")}, got ${t}`);
      return errors;
    }
  }
  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) errors.push(`${at}: shorter than ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) errors.push(`${at}: does not match ${schema.pattern}`);
  }
  if (Array.isArray(value) && schema.items) value.forEach((v, i) => errors.push(...validateSchema(v, schema.items, `${at}[${i}]`)));
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    for (const key of schema.required ?? []) if (!(key in obj)) errors.push(`${at}: missing "${key}"`);
    const props = schema.properties ?? {};
    for (const [key, v] of Object.entries(obj)) {
      if (props[key]) errors.push(...validateSchema(v, props[key], `${at}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${at}: unknown property "${key}"`);
    }
  }
  return errors;
}
