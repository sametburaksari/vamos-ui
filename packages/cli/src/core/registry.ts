import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CliError, type RegistryIndex, type RegistryIndexItem, type RegistryItem } from "./types";

export const DEFAULT_REGISTRY = "https://ui.vamos.ist/r";

/**
 * Registry location precedence: --registry flag, VAMOS_REGISTRY, vamos.json, default.
 * A value that is not an http(s) URL is treated as a local directory (relative to cwd).
 */
export function resolveRegistryLocation(opts: { flag?: string; config?: string; cwd: string; env?: NodeJS.ProcessEnv }): string {
  const env = opts.env ?? process.env;
  const raw = opts.flag || env.VAMOS_REGISTRY || opts.config || DEFAULT_REGISTRY;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  if (raw.startsWith("file://")) return fileURLToPath(raw);
  return path.resolve(opts.cwd, raw);
}

export function isRemote(location: string): boolean {
  return /^https?:\/\//i.test(location);
}

export class Registry {
  private cache = new Map<string, Promise<unknown>>();

  constructor(public readonly location: string) {}

  /** Reads a registry file by its path relative to the registry root. */
  async text(rel: string): Promise<string> {
    if (isRemote(this.location)) {
      const url = `${this.location}/${rel}`;
      let res: Response;
      try {
        res = await fetch(url, { headers: { accept: "application/json, text/plain" } });
      } catch (err) {
        throw new CliError(`Could not reach the registry at ${url}.`, `Check your connection, or point to a local copy with --registry <dir> or VAMOS_REGISTRY. (${(err as Error).message})`);
      }
      if (res.status === 404) throw new NotFound(rel);
      if (!res.ok) throw new CliError(`Registry request failed: ${res.status} ${res.statusText} (${url}).`);
      return res.text();
    }
    const file = path.join(this.location, rel);
    try {
      return await readFile(file, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new NotFound(rel);
      throw err;
    }
  }

  async json<T>(rel: string): Promise<T> {
    let hit = this.cache.get(rel) as Promise<T> | undefined;
    if (!hit) {
      hit = this.text(rel).then((t) => {
        try {
          return JSON.parse(t) as T;
        } catch {
          throw new CliError(`The registry returned invalid JSON for ${rel}.`);
        }
      });
      this.cache.set(rel, hit);
      hit.catch(() => this.cache.delete(rel));
    }
    return hit;
  }

  async index(): Promise<RegistryIndex> {
    try {
      return await this.json<RegistryIndex>("index.json");
    } catch (err) {
      if (err instanceof NotFound) {
        throw new CliError(`No registry index found at ${this.location}.`, isRemote(this.location) ? undefined : "Build it with `node scripts/build-registry.mjs` or pass the right --registry directory.");
      }
      throw err;
    }
  }

  async item(name: string): Promise<RegistryItem> {
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) throw new CliError(`"${name}" is not a valid item name.`);
    try {
      return await this.json<RegistryItem>(`${name}.json`);
    } catch (err) {
      if (err instanceof NotFound) {
        const index = await this.index().catch(() => null);
        const close = index ? suggest(name, index.items) : [];
        throw new CliError(`"${name}" is not in the registry.`, close.length ? `Did you mean ${close.map((c) => `"${c}"`).join(", ")}? Run \`vamos-ui list\` to see everything.` : "Run `vamos-ui list` to see everything.");
      }
      throw err;
    }
  }
}

/**
 * The kit's own index files (kit-relative path → source) from barrels.json, used to build a
 * project's index files. Older registries do not have it; callers then fall back to `export *`.
 */
export async function loadBarrels(registry: Registry): Promise<Record<string, string> | undefined> {
  try {
    const doc = await registry.json<{ files?: { path: string; content: string }[] }>("barrels.json");
    if (!Array.isArray(doc.files)) return undefined;
    return Object.fromEntries(doc.files.map((f) => [f.path, f.content]));
  } catch {
    return undefined;
  }
}

export class NotFound extends Error {
  constructor(public rel: string) {
    super(`Not found: ${rel}`);
  }
}

/** Lower-case and fold Turkish/diacritic characters so "Tarih" finds "tarih" and "ı" finds "i". */
export function fold(s: string): string {
  return s
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length]!;
}

export function suggest(name: string, items: RegistryIndexItem[], max = 3): string[] {
  const q = fold(name);
  return items
    .map((i) => ({ name: i.name, d: i.name.includes(q) || q.includes(i.name) ? 0 : distance(q, i.name) }))
    .filter((x) => x.d <= Math.max(2, Math.floor(q.length / 3)))
    .sort((a, b) => a.d - b.d || a.name.localeCompare(b.name))
    .slice(0, max)
    .map((x) => x.name);
}

/** Ranked search over name, title, description, tags, group and category. */
export function searchItems(items: RegistryIndexItem[], query: string): RegistryIndexItem[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = items.map((item) => {
    const name = fold(item.name);
    const title = fold(item.title);
    const desc = fold(item.description);
    const meta = fold([...(item.tags ?? []), item.group ?? "", item.category ?? ""].join(" "));
    let score = 0;
    for (const t of terms) {
      let s = 0;
      if (name === t) s = 100;
      else if (name.startsWith(t)) s = 60;
      else if (name.includes(t)) s = 40;
      if (title.includes(t)) s = Math.max(s, title.split(/\s+/).includes(t) ? 35 : 25);
      if (meta.includes(t)) s = Math.max(s, 20);
      if (desc.includes(t)) s = Math.max(s, 10);
      if (s === 0) return { item, score: 0 };
      score += s;
    }
    return { item, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .map((s) => s.item);
}
