import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const LOCK_FILE = ".vamos-lock.json";

export interface LockItem {
  version: string;
  type: string;
  installedAt: string;
  /** Project-relative posix path → sha256 of the content the CLI wrote. */
  files: Record<string, string>;
  /** Fetch URL of a third-party item. */
  source?: string;
}

export interface Lockfile {
  lockfileVersion: 1;
  registry: string;
  items: Record<string, LockItem>;
}

export type FileState = "unchanged" | "modified" | "missing";

export function sha256(content: string): string {
  // Normalise line endings so a git autocrlf checkout does not count as a local edit.
  return createHash("sha256").update(content.replace(/\r\n/g, "\n")).digest("hex");
}

/** Every project-relative file some installed item owns. */
export function ownedFiles(lock: Lockfile): Set<string> {
  return new Set(Object.values(lock.items).flatMap((it) => Object.keys(it.files)));
}

export function emptyLock(registry: string): Lockfile {
  return { lockfileVersion: 1, registry, items: {} };
}

export function lockPath(root: string, uiDir: string): string {
  return path.join(root, uiDir, LOCK_FILE);
}

export async function readLock(root: string, uiDir: string, registry: string): Promise<Lockfile> {
  const file = lockPath(root, uiDir);
  if (!existsSync(file)) return emptyLock(registry);
  try {
    const raw = JSON.parse(await readFile(file, "utf8")) as Partial<Lockfile>;
    return { lockfileVersion: 1, registry: raw.registry ?? registry, items: raw.items ?? {} };
  } catch {
    return emptyLock(registry);
  }
}

export async function writeLock(root: string, uiDir: string, lock: Lockfile): Promise<void> {
  const file = lockPath(root, uiDir);
  await mkdir(path.dirname(file), { recursive: true });
  const items = Object.fromEntries(
    Object.keys(lock.items)
      .sort()
      .map((k) => {
        const it = lock.items[k]!;
        return [k, { ...it, files: Object.fromEntries(Object.keys(it.files).sort().map((f) => [f, it.files[f]!])) }];
      }),
  );
  await writeFile(file, JSON.stringify({ ...lock, items }, null, 2) + "\n");
}

/** Records (or replaces) an item's written files. */
export function recordItem(lock: Lockfile, name: string, entry: { version: string; type: string; files: Record<string, string>; source?: string }, now = new Date()): void {
  lock.items[name] = { version: entry.version, type: entry.type, installedAt: now.toISOString(), files: entry.files, ...(entry.source ? { source: entry.source } : {}) };
}

/** Which item owns a project-relative file, if any. */
export function ownerOf(lock: Lockfile, file: string): string | null {
  for (const [name, it] of Object.entries(lock.items)) if (file in it.files) return name;
  return null;
}

/** Compares the file on disk with the hash recorded at install time. */
export async function fileState(root: string, rel: string, recorded: string | undefined): Promise<FileState> {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return "missing";
  if (!recorded) return "modified";
  return sha256(await readFile(abs, "utf8")) === recorded ? "unchanged" : "modified";
}
