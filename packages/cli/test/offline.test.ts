import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { brotliCompressSync, brotliDecompressSync } from "node:zlib";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { DEFAULT_REGISTRY, isOffline, Registry } from "../src/core/registry";
import { itemSchema, validateSchema } from "../src/core/schema";
import { bundledSnapshotPath, decodeSnapshot, encodeSnapshot, loadSnapshot, type Snapshot } from "../src/core/snapshot";
import type { RegistryIndex, RegistryItem } from "../src/core/types";
import { writeFixtureRegistry } from "./fixtures/registry";

const pkgDir = path.resolve(__dirname, "..");
let tmp: string;
let fixtureSnapshot: string;

/** Every file of a registry folder, as { rel: text }. */
function readTree(dir: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const rel of readdirSync(dir, { recursive: true }).map(String)) {
    if (/\.(json|md)$/.test(rel)) files[rel.split(path.sep).join("/")] = readFileSync(path.join(dir, rel), "utf8");
  }
  return files;
}

/** A global fetch that fails like an unreachable network, counting calls. */
function failingFetch(error: Error = Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } })) {
  const fn = vi.fn(async () => {
    throw error;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-offline-"));
  const dir = writeFixtureRegistry(path.join(tmp, "fixture-registry"));
  fixtureSnapshot = path.join(tmp, "fixture.json.br");
  writeFileSync(fixtureSnapshot, encodeSnapshot(readTree(dir), { source: DEFAULT_REGISTRY, builtAt: "2026-03-14T09:00:00.000Z", quality: 4 }));
});

afterEach(() => vi.unstubAllGlobals());
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("Registry: bundled copy as fallback", () => {
  it("uses the bundled copy when fetch fails, with one notice, and stops trying the network", async () => {
    const fetchSpy = failingFetch();
    const notices: string[] = [];
    const registry = new Registry(DEFAULT_REGISTRY, { snapshot: fixtureSnapshot, notice: (m) => notices.push(m) });
    const index = await registry.index();
    expect(index.items.map((i) => i.name)).toContain("button");
    const [button, dialog] = await Promise.all([registry.item("button"), registry.item("dialog")]);
    expect(button.files[0]!.path).toBe("components/button.tsx");
    expect(dialog.registryDependencies).toContain("button");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(notices).toEqual(["Could not reach ui.vamos.ist (fetch failed); using the bundled registry (v0.2.0, built 2026-03-14)."]);
    expect(registry.bundled?.version).toBe("0.2.0");
    expect(registry.location).toBe(DEFAULT_REGISTRY); // the lockfile still records the real registry
  });

  it("falls back on a proxy error and on a non-JSON answer, but not on a 404", async () => {
    vi.stubGlobal("fetch", async () => new Response("Proxy Authentication Required", { status: 407, statusText: "Proxy Authentication Required" }));
    const notices: string[] = [];
    await new Registry(DEFAULT_REGISTRY, { snapshot: fixtureSnapshot, notice: (m) => notices.push(m) }).index();
    expect(notices[0]).toContain("(407 Proxy Authentication Required)");

    vi.stubGlobal("fetch", async () => new Response("<html>Sign in to the guest network</html>", { status: 200 }));
    await new Registry(DEFAULT_REGISTRY, { snapshot: fixtureSnapshot, notice: (m) => notices.push(m) }).index();
    expect(notices[1]).toContain("the answer was not registry JSON");

    vi.stubGlobal("fetch", async () => new Response("not found", { status: 404, statusText: "Not Found" }));
    const registry = new Registry(DEFAULT_REGISTRY, { snapshot: fixtureSnapshot, notice: (m) => notices.push(m) });
    await expect(registry.json("no-such-file.json")).rejects.toThrow("Not found");
    expect(notices).toHaveLength(2);
    expect(registry.bundled).toBeNull();
  });

  it("gives up on a hanging network after the timeout", async () => {
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) => new Promise((_, reject) => init.signal!.addEventListener("abort", () => reject(init.signal!.reason))));
    const notices: string[] = [];
    const started = Date.now();
    const index = await new Registry(DEFAULT_REGISTRY, { snapshot: fixtureSnapshot, timeoutMs: 50, notice: (m) => notices.push(m) }).index();
    expect(Date.now() - started).toBeLessThan(2000);
    expect(index.items.length).toBeGreaterThan(0);
    expect(notices[0]).toContain("no answer in 50 ms");
  });

  it("reads the timeout from VAMOS_REGISTRY_TIMEOUT", async () => {
    vi.stubGlobal("fetch", (_url: string, init: RequestInit) => new Promise((_, reject) => init.signal!.addEventListener("abort", () => reject(init.signal!.reason))));
    const notices: string[] = [];
    await new Registry(DEFAULT_REGISTRY, { snapshot: fixtureSnapshot, env: { VAMOS_REGISTRY_TIMEOUT: "30" }, notice: (m) => notices.push(m) }).index();
    expect(notices[0]).toContain("no answer in 30 ms");
  });

  it("never falls back for another registry", async () => {
    failingFetch();
    const registry = new Registry("https://registry.example.dev/r", { snapshot: fixtureSnapshot, notice: () => {} });
    await expect(registry.index()).rejects.toThrow("Could not reach the registry at https://registry.example.dev/r/index.json.");
    expect(() => new Registry("https://registry.example.dev/r", { offline: true })).toThrow("--offline: the registry is https://registry.example.dev/r");
  });

  it("explains a missing bundled copy", async () => {
    failingFetch();
    const registry = new Registry(DEFAULT_REGISTRY, { snapshot: null, notice: () => {} });
    await expect(registry.index()).rejects.toThrow("(fetch failed), and this copy of vamos-ui has no bundled registry.");
  });
});

describe("Registry: --offline", () => {
  it("never calls fetch", async () => {
    const fetchSpy = failingFetch();
    const notices: string[] = [];
    const registry = new Registry(DEFAULT_REGISTRY, { offline: true, snapshot: fixtureSnapshot, notice: (m) => notices.push(m) });
    await registry.index();
    await registry.item("data-table");
    await expect(registry.item("buton")).rejects.toMatchObject({ hint: expect.stringContaining('Did you mean "button"') });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(notices).toEqual(["Offline: using the bundled registry (v0.2.0, built 2026-03-14)."]);
  });

  it("--offline / --no-offline win over VAMOS_OFFLINE", () => {
    expect(isOffline(undefined, { VAMOS_OFFLINE: "1" })).toBe(true);
    expect(isOffline(undefined, { VAMOS_OFFLINE: "true" })).toBe(true);
    expect(isOffline(undefined, { VAMOS_OFFLINE: "0" })).toBe(false);
    expect(isOffline(undefined, {})).toBe(false);
    expect(isOffline(false, { VAMOS_OFFLINE: "1" })).toBe(false);
    expect(isOffline(true, {})).toBe(true);
  });
});

describe("snapshot format", () => {
  it("round-trips the exact registry files", async () => {
    const snap = decodeSnapshot(readFileSync(fixtureSnapshot));
    const original = readTree(path.join(tmp, "fixture-registry"));
    expect(snap.meta).toMatchObject({ format: 1, name: "vamos-ui", version: "0.2.0", source: DEFAULT_REGISTRY, files: Object.keys(original).length });
    const out = path.join(tmp, "roundtrip");
    const { exportSnapshot } = await import("../src/core/snapshot");
    await exportSnapshot(snap, out);
    const parse = (tree: Record<string, string>) => Object.fromEntries(Object.entries(tree).map(([k, v]) => [k, k.endsWith(".json") ? JSON.parse(v) : v]));
    expect(parse(readTree(out))).toEqual(parse(original));
  });

  it("rejects a damaged file", () => {
    const data = readFileSync(fixtureSnapshot);
    expect(() => decodeSnapshot(Buffer.from("not brotli"))).toThrow("not a brotli stream");
    const raw = brotliDecompressSync(data).toString("utf8");
    const tampered = raw.replace('"button"', '"bvtton"');
    expect(() => decodeSnapshot(brotliCompressSync(Buffer.from(tampered)))).toThrow("checksum mismatch");
    const future = raw.replace('"format":1', '"format":9');
    expect(() => decodeSnapshot(brotliCompressSync(Buffer.from(future)))).toThrow("format 9");
  });
});

// The copy that ships in the npm package. Built by `pnpm --dir packages/cli build`; built here when missing.
describe("bundled snapshot (packages/cli/snapshot)", () => {
  let snap: Snapshot;
  let project: string;

  beforeAll(async () => {
    if (!bundledSnapshotPath()) execFileSync(process.execPath, [path.join(pkgDir, "scripts/snapshot-registry.mjs"), "--quality", "5", "--quiet"], { cwd: pkgDir, stdio: "inherit" });
    snap = await loadSnapshot(bundledSnapshotPath()!);
    project = path.join(tmp, "app");
    mkdirSync(path.join(project, "src/app"), { recursive: true });
    writeFileSync(path.join(project, "package.json"), JSON.stringify({ name: "app", dependencies: { next: "16.0.0", react: "19.2.0" } }));
    writeFileSync(path.join(project, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }));
    writeFileSync(path.join(project, "src/app/globals.css"), `@import "tailwindcss";\n`);
  }, 120_000);

  async function cli(argv: string[], env: NodeJS.ProcessEnv = {}): Promise<{ code: number; out: string; err: string }> {
    let out = "";
    let err = "";
    const o = vi.spyOn(process.stdout, "write").mockImplementation((c: string | Uint8Array) => ((out += String(c)), true));
    const e = vi.spyOn(process.stderr, "write").mockImplementation((c: string | Uint8Array) => ((err += String(c)), true));
    try {
      const base = { ...process.env };
      delete base.VAMOS_REGISTRY;
      delete base.VAMOS_OFFLINE;
      const code = await run(argv, { cwd: project, interactive: false, env: { ...base, CI: "1", ...env } });
      return { code, out, err };
    } finally {
      o.mockRestore();
      e.mockRestore();
    }
  }

  it("is a complete, valid copy of the registry", () => {
    const index = snap.files["index.json"] as RegistryIndex;
    expect(snap.meta.name).toBe("vamos-ui");
    expect(snap.meta.version).toBe(index.version);
    expect(snap.meta.source).toBe(DEFAULT_REGISTRY);
    expect(index.items.length).toBeGreaterThan(100);
    for (const f of ["schema.json", "index-schema.json", "config-schema.json", "tokens.json", "axes.json", "barrels.json", "skills/vamos-ui/SKILL.md"]) expect(snap.files[f], f).toBeDefined();
    const names = new Set(index.items.map((i) => i.name));
    const problems: string[] = [];
    for (const entry of index.items) {
      const item = snap.files[`${entry.name}.json`] as RegistryItem | undefined;
      if (!item) {
        problems.push(`${entry.name}: no ${entry.name}.json`);
        continue;
      }
      if (item.name !== entry.name) problems.push(`${entry.name}: file has name ${item.name}`);
      if (!Array.isArray(item.files) || item.files.some((f) => typeof f.content !== "string")) problems.push(`${entry.name}: missing file contents`);
      for (const d of item.registryDependencies) if (!names.has(d)) problems.push(`${entry.name}: needs ${d}, which is not in the copy`);
      for (const e of validateSchema(item, itemSchema())) problems.push(`${entry.name}: ${e}`);
    }
    expect(problems).toEqual([]);
  });

  it("`init` and `add` with --offline install from it without calling fetch", async () => {
    const fetchSpy = failingFetch();
    const setup = await cli(["init", "--offline", "--yes", "--no-install", "--no-agent"]);
    expect(setup.code).toBe(0);
    const res = await cli(["add", "button", "--offline", "--yes", "--no-install"]);
    expect(res.code).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(res.out).toContain(`Offline: using the bundled registry (v${snap.meta.version}`);
    expect(readdirSync(path.join(project, "src/components/vamos/components"))).toContain("button.tsx");
  });

  it("VAMOS_OFFLINE=1 does the same for list --json, keeping stdout clean", async () => {
    const fetchSpy = failingFetch();
    const res = await cli(["list", "--json"], { VAMOS_OFFLINE: "1" });
    expect(res.code).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.parse(res.out).length).toBe((snap.files["index.json"] as RegistryIndex).items.length);
    expect(res.err).toContain("Offline: using the bundled registry");
  });

  it("falls back when the network is down, and refuses third-party URLs offline", async () => {
    const fetchSpy = failingFetch();
    const res = await cli(["search", "button"]);
    expect(res.code).toBe(0);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(res.out).toContain("Could not reach ui.vamos.ist (fetch failed); using the bundled registry");
    const ext = await cli(["add", "https://registry.example.dev/r/stat-card.json", "--offline", "--yes", "--no-install"]);
    expect(ext.code).toBe(1);
    expect(ext.out).toContain('--offline: "https://registry.example.dev/r/stat-card.json" comes from registry.example.dev');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("`registry export` writes the files the site serves, usable as --registry", async () => {
    const fetchSpy = failingFetch();
    const out = path.join(tmp, "vendor/vamos-registry");
    const res = await cli(["registry", "export", out, "--json"]);
    expect(res.code).toBe(0);
    expect(JSON.parse(res.out)).toMatchObject({ ok: true, files: snap.meta.files, version: snap.meta.version });
    const button = JSON.parse(readFileSync(path.join(out, "button.json"), "utf8"));
    expect(button).toEqual(snap.files["button.json"]);
    expect(readFileSync(path.join(out, "skills/vamos-ui/SKILL.md"), "utf8")).toBe(snap.files["skills/vamos-ui/SKILL.md"]);
    expect((await cli(["registry", "export", out])).code).toBe(1); // not empty without --force
    const listed = await cli(["list", "--json", "--registry", out]);
    expect(JSON.parse(listed.out).length).toBe((snap.files["index.json"] as RegistryIndex).items.length);
    expect(listed.err).toBe("");
    expect(fetchSpy).not.toHaveBeenCalled();
    const info = await cli(["registry", "info", "--json"]);
    expect(JSON.parse(info.out)).toMatchObject({ version: snap.meta.version, files: snap.meta.files });
  });
});
