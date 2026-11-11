import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureStylesImport, type CssResult } from "./css";
import { refreshIndexes, type IndexResult } from "./indexes";
import { ownedFiles, recordItem, sha256, type Lockfile } from "./lockfile";
import { collectDependencies } from "./resolve";
import { targetPath, transformFile } from "./transform";
import { itemKey, type RegistryItem, type VamosConfig } from "./types";

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
      const key = itemKey(item);
      claimed.set(rel, key);
      const content = transformFile(file.content, config);
      const abs = path.join(root, rel);
      let action: FileAction = "create";
      if (existsSync(abs)) {
        const current = await readFile(abs, "utf8");
        const currentHash = sha256(current);
        if (currentHash === sha256(content)) action = "identical";
        else {
          const owner = Object.entries(lock.items).find(([, it]) => rel in it.files);
          const recorded = owner?.[1].files[rel];
          // A third-party item never silently replaces a file another item installed.
          const foreign = !!item.source && !!owner && owner[0] !== key;
          action = opts.overwrite || (recorded === currentHash && !foreign) ? "update" : "conflict";
        }
      }
      files.push({ item: key, path: rel, content, action });
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
    const key = itemKey(item);
    const prev = lock.items[key]?.files ?? {};
    const files: Record<string, string> = {};
    for (const f of plan.files.filter((x) => x.item === key)) {
      // A kept conflicting file keeps its previous hash, so diff/upgrade still see it as edited.
      files[f.path] = f.action === "conflict" && prev[f.path] ? prev[f.path]! : sha256(f.content);
    }
    recordItem(lock, key, { version, type: item.type, files, source: item.source?.url });
  }

  const indexes = await refreshIndexes(root, config.uiDir, { barrels, owned: ownedFiles(lock) });
  const hasStyles = existsSync(path.join(root, config.uiDir, "styles.css"));
  const css = hasStyles ? await ensureStylesImport(root, config.css, config.uiDir) : null;
  return { written, skipped, indexes, css };
}
