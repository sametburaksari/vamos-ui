/**
 * The registry snapshot bundled with the CLI: a copy of https://ui.vamos.ist/r taken at build time
 * (packages/cli/scripts/snapshot-registry.mjs), used when the network is not available.
 *
 * File format (snapshot/registry.json.br): brotli of
 *
 *   <meta JSON, one line>\n<files JSON>
 *
 * where meta is { format, name, version, builtAt, source, files, sha256 } and sha256 is the hex
 * digest of the UTF-8 bytes of <files JSON>. <files JSON> maps registry-relative paths to their
 * content: parsed JSON for .json files (written back with 2-space indent, exactly as the site
 * serves them) and plain text for everything else (skills/vamos-ui/*.md).
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, brotliDecompressSync, constants as zlib } from "node:zlib";
import { CliError } from "./types";

export const SNAPSHOT_FORMAT = 1;
export const SNAPSHOT_FILE = "registry.json.br";

export interface SnapshotMeta {
  format: number;
  /** Registry name from index.json ("vamos-ui"). */
  name: string;
  /** Registry version from index.json. */
  version: string;
  /** ISO timestamp of the build. */
  builtAt: string;
  /** The registry this is a copy of. */
  source: string;
  /** Number of files. */
  files: number;
  sha256: string;
}

export interface Snapshot {
  meta: SnapshotMeta;
  files: Record<string, unknown>;
}

const stableJson = (value: unknown) => JSON.stringify(value, null, 2) + "\n";

/** The text of a snapshot file, as the registry serves it. */
export function snapshotText(snapshot: Snapshot, rel: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(snapshot.files, rel)) return undefined;
  const value = snapshot.files[rel];
  return rel.endsWith(".json") ? stableJson(value) : String(value);
}

/** Encodes a snapshot. `files` maps registry-relative paths to file text. */
export function encodeSnapshot(files: Record<string, string>, opts: { source: string; builtAt?: string; quality?: number }): Buffer {
  const parsed: Record<string, unknown> = {};
  for (const rel of Object.keys(files).sort()) parsed[rel] = rel.endsWith(".json") ? JSON.parse(files[rel]!) : files[rel];
  const index = parsed["index.json"] as { name?: string; version?: string } | undefined;
  if (!index) throw new Error("A registry snapshot needs index.json.");
  const body = JSON.stringify(parsed);
  const meta: SnapshotMeta = {
    format: SNAPSHOT_FORMAT,
    name: index.name ?? "vamos-ui",
    version: index.version ?? "0.0.0",
    builtAt: opts.builtAt ?? new Date().toISOString(),
    source: opts.source,
    files: Object.keys(parsed).length,
    sha256: createHash("sha256").update(body).digest("hex"),
  };
  const raw = Buffer.from(`${JSON.stringify(meta)}\n${body}`);
  return brotliCompressSync(raw, {
    params: { [zlib.BROTLI_PARAM_QUALITY]: opts.quality ?? 10, [zlib.BROTLI_PARAM_LGWIN]: 24, [zlib.BROTLI_PARAM_SIZE_HINT]: raw.length },
  });
}

/** Decodes and checks a snapshot. Throws a CliError when it is damaged. */
export function decodeSnapshot(data: Buffer, origin = "the bundled registry"): Snapshot {
  let raw: Buffer;
  try {
    raw = brotliDecompressSync(data);
  } catch {
    throw new CliError(`${origin} is damaged (not a brotli stream).`, "Reinstall vamos-ui, or point to a registry copy with --registry <dir>.");
  }
  const nl = raw.indexOf(0x0a);
  if (nl === -1) throw new CliError(`${origin} is damaged (no header).`);
  let meta: SnapshotMeta;
  try {
    meta = JSON.parse(raw.subarray(0, nl).toString("utf8")) as SnapshotMeta;
  } catch {
    throw new CliError(`${origin} is damaged (bad header).`);
  }
  if (meta.format !== SNAPSHOT_FORMAT) throw new CliError(`${origin} has format ${meta.format}; this CLI reads format ${SNAPSHOT_FORMAT}.`);
  const body = raw.subarray(nl + 1);
  if (createHash("sha256").update(body).digest("hex") !== meta.sha256) throw new CliError(`${origin} is damaged (checksum mismatch).`, "Reinstall vamos-ui, or point to a registry copy with --registry <dir>.");
  const files = JSON.parse(body.toString("utf8")) as Record<string, unknown>;
  if (Object.keys(files).length !== meta.files) throw new CliError(`${origin} is damaged (file count mismatch).`);
  return { meta, files };
}

/** Where the bundled snapshot sits: <package>/snapshot/registry.json.br, from dist/ or src/core/. */
export function bundledSnapshotPath(): string | undefined {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const up of ["..", "../.."]) {
    const file = path.resolve(here, up, "snapshot", SNAPSHOT_FILE);
    if (existsSync(file)) return file;
  }
  return undefined;
}

const loaded = new Map<string, Promise<Snapshot>>();

/** Reads a snapshot file once per process. */
export function loadSnapshot(file: string): Promise<Snapshot> {
  let hit = loaded.get(file);
  if (!hit) {
    hit = readFile(file).then((data) => decodeSnapshot(data, `The bundled registry (${file})`));
    loaded.set(file, hit);
    hit.catch(() => loaded.delete(file));
  }
  return hit;
}

/** "v0.4.3, built 2026-11-15" */
export function describeSnapshot(meta: SnapshotMeta): string {
  return `v${meta.version}, built ${meta.builtAt.slice(0, 10)}`;
}

/** Writes every file of the snapshot to `outDir`, as the registry serves them. */
export async function exportSnapshot(snapshot: Snapshot, outDir: string): Promise<{ files: number; bytes: number }> {
  let bytes = 0;
  const root = path.resolve(outDir);
  for (const rel of Object.keys(snapshot.files).sort()) {
    const abs = path.resolve(root, rel);
    if (!abs.startsWith(root + path.sep)) throw new CliError(`The bundled registry has an unsafe path: ${rel}`);
    const text = snapshotText(snapshot, rel)!;
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, text);
    bytes += Buffer.byteLength(text);
  }
  return { files: Object.keys(snapshot.files).length, bytes };
}
