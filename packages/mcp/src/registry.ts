import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Axis, RegistryIndex, RegistryIndexItem, RegistryItem, Token } from "./types.js";

export const DEFAULT_REGISTRY = "https://ui.vamos.ist/r";

/** Built-in axis definitions, used when the registry has no axes.json. */
export const BUILTIN_AXES: Axis[] = [
  {
    name: "theme",
    attribute: "class",
    values: ["light", "dark"],
    default: "light",
    description: 'Light or dark. Set class="dark" on <html> (or a subtree); class="light" re-lights a subtree inside a dark page.',
  },
  {
    name: "material",
    attribute: "data-material",
    values: ["solid", "glass"],
    default: "solid",
    description: "Surface material: opaque solid, or translucent Liquid Glass with blur over a soft colour scene.",
  },
  {
    name: "accent",
    attribute: "data-accent",
    values: ["lime", "ocean", "ember", "rose", "graphite"],
    default: "lime",
    description: "The single accent colour. Everything accent-related (fill, soft tint, ink, focus ring, chart-1) derives from --accent-base.",
  },
  {
    name: "density",
    attribute: "data-density",
    values: ["comfortable", "compact"],
    default: "comfortable",
    description: "Control height, radius, gaps and table row height. Compact for data-heavy back-office screens.",
  },
  {
    name: "font",
    attribute: "data-font",
    values: ["editorial", "grotesk", "corporate", "system"],
    default: "editorial",
    description: "Type pairing for UI text, headings and code. Display headings change weight, tracking and scale with it.",
  },  {
    name: "radius",
    attribute: "data-radius",
    values: ["default", "sharp", "round"],
    default: "default",
    description: "Corners. Absent = default (14px, compact 10px); sharp = 6px (4px), round = 20px (14px). Scales --radius, so everything on rounded-ui / rounded-ui-sm / rounded-ui-lg or var(--radius) follows: buttons, inputs, selects, checkboxes, cards, dialogs, sheets, popovers, menus, tooltips, toasts, tabs, tables, square badges, calendars, chart tooltips and site blocks. rounded-full shapes stay round on purpose: pill badges and buttons, avatars, switches, radio dots, slider thumbs and progress bars (and small fixed details such as chart bars and event chips). Works with every accent, material and density.",
  },
];

export interface RegistryOptions {
  /** URL (https://…/r) or a local directory (path or file:// URL). Defaults to VAMOS_REGISTRY or the public registry. */
  source?: string;
  /** Remote fetch timeout, ms. */
  timeoutMs?: number;
  /** How long remote JSON stays cached, ms. Local directories are re-read after the same TTL. */
  ttlMs?: number;
  /** Injectable fetch (tests). */
  fetch?: typeof fetch;
}

type Source = { kind: "remote"; base: string } | { kind: "local"; dir: string };

export class RegistryError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "unreachable" | "invalid",
  ) {
    super(message);
    this.name = "RegistryError";
  }
}

export function resolveSource(input?: string): Source {
  const raw = (input ?? process.env.VAMOS_REGISTRY ?? DEFAULT_REGISTRY).trim();
  if (/^https?:\/\//i.test(raw)) return { kind: "remote", base: raw.replace(/\/+$/, "") };
  if (/^file:\/\//i.test(raw)) return { kind: "local", dir: fileURLToPath(raw) };
  return { kind: "local", dir: path.resolve(raw) };
}

interface CacheEntry<T> {
  at: number;
  value: Promise<T>;
}

export class Registry {
  readonly source: Source;
  private readonly timeoutMs: number;
  private readonly ttlMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(options: RegistryOptions = {}) {
    this.source = resolveSource(options.source);
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.ttlMs = options.ttlMs ?? 10 * 60_000;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  /** Human-readable location, also what `--registry` should receive. */
  get location(): string {
    return this.source.kind === "remote" ? this.source.base : this.source.dir;
  }

  get isDefault(): boolean {
    return this.source.kind === "remote" && this.source.base === DEFAULT_REGISTRY;
  }

  async index(): Promise<RegistryIndex> {
    const data = await this.json<RegistryIndex>("index.json");
    if (!data || !Array.isArray(data.items)) {
      throw new RegistryError(`index.json at ${this.location} has no "items" array.`, "invalid");
    }
    return data;
  }

  async items(): Promise<RegistryIndexItem[]> {
    return (await this.index()).items;
  }

  async find(name: string): Promise<RegistryIndexItem | undefined> {
    const key = normalizeName(name);
    return (await this.items()).find((item) => item.name === key);
  }

  async item(name: string): Promise<RegistryItem> {
    const key = normalizeName(name);
    if (!/^[a-z0-9][a-z0-9._-]*$/.test(key)) {
      throw new RegistryError(`"${name}" is not a valid item name.`, "not_found");
    }
    const listed = await this.find(key);
    if (!listed) throw new RegistryError(`No registry item named "${name}".`, "not_found");
    const item = await this.json<RegistryItem>(`${key}.json`);
    return {
      ...listed,
      ...item,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      files: item.files ?? [],
    };
  }

  /** Loads full items for many names with bounded concurrency; failures are skipped. */
  async manyItems(names: string[], concurrency = 8): Promise<Map<string, RegistryItem>> {
    const out = new Map<string, RegistryItem>();
    let cursor = 0;
    const worker = async () => {
      while (cursor < names.length) {
        const name = names[cursor++]!;
        try {
          out.set(name, await this.item(name));
        } catch {
          // A single broken item must not break search or planning.
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, names.length) }, worker));
    return out;
  }

  /** Every item the registry has already loaded — no network. */
  cachedItems(): RegistryItem[] {
    return [...this.settled.values()];
  }

  async tokens(): Promise<Token[]> {
    const data = await this.optionalJson<unknown>("tokens.json");
    return parseTokens(data);
  }

  async axes(): Promise<Axis[]> {
    const data = await this.optionalJson<unknown>("axes.json");
    const parsed = parseAxes(data);
    return parsed.length ? parsed : BUILTIN_AXES;
  }

  /** Clears the in-memory cache (next call re-reads the registry). */
  clear(): void {
    this.cache.clear();
    this.settled.clear();
  }

  // ---------------------------------------------------------------------------

  private readonly settled = new Map<string, RegistryItem>();

  private async optionalJson<T>(file: string): Promise<T | undefined> {
    try {
      return await this.json<T>(file);
    } catch (error) {
      if (error instanceof RegistryError && error.code === "not_found") return undefined;
      throw error;
    }
  }

  private json<T>(file: string): Promise<T> {
    const hit = this.cache.get(file);
    if (hit && Date.now() - hit.at < this.ttlMs) return hit.value as Promise<T>;
    const value = this.load<T>(file);
    this.cache.set(file, { at: Date.now(), value });
    value.then(
      (data) => {
        const item = data as unknown as RegistryItem;
        if (file !== "index.json" && item && typeof item === "object" && Array.isArray(item.files)) {
          this.settled.set(item.name, item);
        }
      },
      () => this.cache.delete(file),
    );
    return value;
  }

  private async load<T>(file: string): Promise<T> {
    let text: string;
    if (this.source.kind === "local") {
      const full = path.join(this.source.dir, file);
      try {
        text = await readFile(full, "utf8");
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code === "ENOENT") {
          throw new RegistryError(`${file} not found in ${this.source.dir}.`, "not_found");
        }
        throw new RegistryError(`Cannot read ${full}: ${(error as Error).message}`, "unreachable");
      }
    } else {
      const url = `${this.source.base}/${file}`;
      let res: Response;
      try {
        res = await this.fetchImpl(url, {
          headers: { accept: "application/json", "user-agent": "vamos-ui-mcp" },
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch (error) {
        throw new RegistryError(`Cannot reach ${url}: ${(error as Error).message}`, "unreachable");
      }
      if (res.status === 404) throw new RegistryError(`${url} returned 404.`, "not_found");
      if (!res.ok) throw new RegistryError(`${url} returned HTTP ${res.status}.`, "unreachable");
      text = await res.text();
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new RegistryError(`${file} is not valid JSON.`, "invalid");
    }
  }
}

export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\.json$/, "")
    .replace(/^@vamos-ui\/react\//, "");
}

// --- lenient parsers (the registry builder owns the exact shape) ---------------

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.length) return value;
  }
  return undefined;
}

export function parseTokens(data: unknown): Token[] {
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.tokens)) list = obj.tokens;
    else if (Array.isArray(obj.items)) list = obj.items;
    else
      list = Object.entries(obj)
        .filter(([key]) => key.startsWith("--"))
        .map(([name, value]) => (typeof value === "object" ? { name, ...(value as object) } : { name, light: value }));
  }
  const tokens: Token[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const name = pickString(obj, "name", "token", "property");
    if (!name) continue;
    tokens.push({
      name: name.startsWith("--") ? name : `--${name}`,
      light: pickString(obj, "light", "lightValue", "value", "default"),
      dark: pickString(obj, "dark", "darkValue"),
      description: pickString(obj, "description", "comment"),
    });
  }
  return tokens;
}

export function parseAxes(data: unknown): Axis[] {
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.axes)) list = obj.axes;
    else
      list = Object.entries(obj)
        .filter(([, value]) => value && typeof value === "object")
        .map(([name, value]) => (Array.isArray(value) ? { name, values: value } : { name, ...(value as object) }));
  }
  const axes: Axis[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const name = pickString(obj, "name", "id", "axis");
    const values = Array.isArray(obj.values) ? obj.values.map(String) : [];
    if (!name || !values.length) continue;
    const builtin = BUILTIN_AXES.find((axis) => axis.name === name || axis.attribute === name);
    axes.push({
      name: builtin?.name ?? name,
      attribute: pickString(obj, "attribute", "attr") ?? builtin?.attribute ?? `data-${name}`,
      values,
      default: pickString(obj, "default", "defaultValue") ?? builtin?.default ?? values[0]!,
      description: pickString(obj, "description") ?? builtin?.description,
    });
  }
  return axes;
}
