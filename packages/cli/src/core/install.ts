import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureStylesImport, type CssResult } from "./css";
import { refreshIndexes, type IndexResult } from "./indexes";
import { ownedFiles, recordItem, sha256, type Lockfile } from "./lockfile";
import { collectDependencies } from "./resolve";
import { targetPath, transformFile } from "./transform";
import type { RegistryItem, VamosConfig } from "./types";

export type FileAction = "create" | "update" | "identical" | "conflict";

export interface PlannedFile {
  item: string;
  /** Project-relative posix path. */
  path: string;
  content: string;
  action: FileAction;
}

export interface InstallPlan {
  files: PlannedFile[];
  items: RegistryItem[];
  dependencies: string[];
}

/**
 * Decides what happens to each file:
 * - create:    not on disk
 * - identical: on disk with the same content
 * - update:    on disk, differs, and is untouched since vamos-ui wrote it (or --overwrite)
 * - conflict:  on disk, differs, and was edited (or never written by vamos-ui)
 */
export async function planInstall(
  root: string,
  config: VamosConfig,
  items: RegistryItem[],
  lock: Lockfile,
  opts: { overwrite?: boolean } = {},
): Promise<InstallPlan> {
  const files: PlannedFile[] = [];
  const claimed = new Map<string, string>();
  for (const item of items) {
    for (const file of item.files ?? []) {
      const rel = targetPath(item, file, config);
      if (claimed.has(rel)) continue; // first item wins when two ship the same file
      claimed.set(rel, item.name);
      const content = transformFile(file.content, config);
      const abs = path.join(root, rel);
      let action: FileAction = "create";
      if (existsSync(abs)) {
        const current = await readFile(abs, "utf8");
        const currentHash = sha256(current);
        if (currentHash === sha256(content)) action = "identical";
        else {
          const recorded = Object.values(lock.items).find((it) => rel in it.files)?.files[rel];
          action = opts.overwrite || recorded === currentHash ? "update" : "conflict";
        }
      }
      files.push({ item: item.name, path: rel, content, action });
    }
  }
  return { files, items, dependencies: collectDependencies(items) };
}

export interface ApplyResult {
  written: PlannedFile[];
  skipped: PlannedFile[];
  indexes: IndexResult;
  css: { result: CssResult; afterTailwind: boolean } | null;
}

/** Writes create/update files, records hashes in the lock, refreshes indexes and the CSS entry. */
export async function applyPlan(
  root: string,
  config: VamosConfig,
  plan: InstallPlan,
  lock: Lockfile,
  version: string,
  barrels?: Record<string, string>,
): Promise<ApplyResult> {
  const written: PlannedFile[] = [];
  const skipped: PlannedFile[] = [];
  for (const f of plan.files) {
    if (f.action === "create" || f.action === "update") {
      const abs = path.join(root, f.path);
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, f.content);
      written.push(f);
    } else if (f.action === "conflict") skipped.push(f);
  }

  for (const item of plan.items) {
    const prev = lock.items[item.name]?.files ?? {};
    const files: Record<string, string> = {};
    for (const f of plan.files.filter((x) => x.item === item.name)) {
      // A kept conflicting file keeps its previous hash, so diff/upgrade still see it as edited.
      files[f.path] = f.action === "conflict" && prev[f.path] ? prev[f.path]! : sha256(f.content);
    }
    recordItem(lock, item.name, { version, type: item.type, files });
  }

  const indexes = await refreshIndexes(root, config.uiDir, { barrels, owned: ownedFiles(lock) });
  const hasStyles = existsSync(path.join(root, config.uiDir, "styles.css"));
  const css = hasStyles ? await ensureStylesImport(root, config.css, config.uiDir) : null;
  return { written, skipped, indexes, css };
}
