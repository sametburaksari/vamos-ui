import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_REGISTRY } from "./registry";
import { CliError, type VamosConfig } from "./types";

export const CONFIG_FILE = "vamos.json";
export const CONFIG_SCHEMA = "https://ui.vamos.ist/r/config-schema.json";

export const DEFAULT_CONFIG: VamosConfig = {
  $schema: CONFIG_SCHEMA,
  registry: DEFAULT_REGISTRY,
  uiDir: "src/components/vamos",
  blocksDir: "src/components/blocks",
  css: "src/app/globals.css",
  importAlias: "@/components/vamos",
  tsx: true,
};

/** Walks up from `cwd` to the nearest directory with vamos.json (or package.json as a fallback). */
export function findProjectRoot(cwd: string): string {
  let dir = path.resolve(cwd);
  let pkg: string | null = null;
  for (;;) {
    if (existsSync(path.join(dir, CONFIG_FILE))) return dir;
    if (!pkg && existsSync(path.join(dir, "package.json"))) pkg = dir;
    const parent = path.dirname(dir);
    if (parent === dir) return pkg ?? path.resolve(cwd);
    dir = parent;
  }
}

export async function readConfig(root: string): Promise<VamosConfig | null> {
  const file = path.join(root, CONFIG_FILE);
  if (!existsSync(file)) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    throw new CliError(`${CONFIG_FILE} is not valid JSON.`, (err as Error).message);
  }
  return validateConfig(raw);
}

export async function requireConfig(root: string): Promise<VamosConfig> {
  const config = await readConfig(root);
  if (!config) throw new CliError(`No ${CONFIG_FILE} found in ${root}.`, "Run `npx vamos-ui init` first.");
  return config;
}

export function validateConfig(raw: unknown): VamosConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new CliError(`${CONFIG_FILE} must contain a JSON object.`);
  const c = { ...DEFAULT_CONFIG, ...(raw as Partial<VamosConfig>) };
  for (const key of ["registry", "uiDir", "blocksDir", "css", "importAlias"] as const) {
    if (typeof c[key] !== "string" || !c[key]) throw new CliError(`${CONFIG_FILE}: "${key}" must be a non-empty string.`);
  }
  if (typeof c.tsx !== "boolean") throw new CliError(`${CONFIG_FILE}: "tsx" must be true or false.`);
  for (const key of ["uiDir", "blocksDir", "css"] as const) {
    if (path.isAbsolute(c[key]) || c[key].split(/[\\/]/).includes("..")) {
      throw new CliError(`${CONFIG_FILE}: "${key}" must be a path inside the project.`);
    }
  }
  c.importAlias = c.importAlias.replace(/\/+$/, "");
  if (c.registries !== undefined) {
    if (!c.registries || typeof c.registries !== "object" || Array.isArray(c.registries)) throw new CliError(`${CONFIG_FILE}: "registries" must be an object like { "@acme": "https://acme.dev/r/{name}.json" }.`);
    for (const [ns, url] of Object.entries(c.registries)) {
      if (!/^@[a-z0-9][a-z0-9._-]*$/.test(ns)) throw new CliError(`${CONFIG_FILE}: registries key "${ns}" must look like "@acme" (lower case).`);
      if (typeof url !== "string" || !url.includes("{name}")) throw new CliError(`${CONFIG_FILE}: registries["${ns}"] must be a URL containing {name}, e.g. "https://acme.dev/r/{name}.json".`);
    }
  }
  return c;
}

export async function writeConfig(root: string, config: VamosConfig): Promise<void> {
  const ordered: VamosConfig = {
    $schema: config.$schema ?? CONFIG_SCHEMA,
    registry: config.registry,
    uiDir: config.uiDir,
    blocksDir: config.blocksDir,
    css: config.css,
    importAlias: config.importAlias,
    tsx: config.tsx,
    ...(config.theme ? { theme: config.theme } : {}),
    ...(config.registries && Object.keys(config.registries).length ? { registries: config.registries } : {}),
  };
  await writeFile(path.join(root, CONFIG_FILE), JSON.stringify(ordered, null, 2) + "\n");
}
