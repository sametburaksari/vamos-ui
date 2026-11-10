import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { BUILTIN_AXES, DEFAULT_REGISTRY, Registry, RegistryError, parseAxes, parseTokens, resolveSource } from "../src/registry.js";
import { FIXTURE_DIR, fixtureRegistry } from "./helpers.js";

describe("resolveSource", () => {
  it("defaults to the public registry", () => {
    const prev = process.env.VAMOS_REGISTRY;
    delete process.env.VAMOS_REGISTRY;
    expect(resolveSource()).toEqual({ kind: "remote", base: DEFAULT_REGISTRY });
    if (prev !== undefined) process.env.VAMOS_REGISTRY = prev;
  });
  it("reads VAMOS_REGISTRY and accepts local paths and file URLs", () => {
    vi.stubEnv("VAMOS_REGISTRY", "https://example.test/r/");
    expect(resolveSource()).toEqual({ kind: "remote", base: "https://example.test/r" });
    vi.unstubAllEnvs();
    expect(resolveSource("apps/www/public/r")).toEqual({ kind: "local", dir: path.resolve("apps/www/public/r") });
    expect(resolveSource("file:///tmp/r")).toEqual({ kind: "local", dir: "/tmp/r" });
  });
});

describe("Registry (local directory)", () => {
  it("loads the index and merges full items", async () => {
    const registry = fixtureRegistry();
    expect((await registry.items()).length).toBeGreaterThan(5);
    const button = await registry.item("Button");
    expect(button.files[0]!.path).toBe("components/button.tsx");
    expect(button.docs).toMatch(/^https:\/\//);
  });

  it("throws not_found for unknown and invalid names", async () => {
    const registry = fixtureRegistry();
    await expect(registry.item("nope")).rejects.toMatchObject({ code: "not_found" });
    await expect(registry.item("../index")).rejects.toBeInstanceOf(RegistryError);
  });

  it("reads tokens and axes", async () => {
    const registry = fixtureRegistry();
    expect((await registry.tokens())[0]).toEqual({ name: "--fg", light: "#12150f", dark: "#f1f3ec", description: "Primary text" });
    expect((await registry.axes()).map((a) => a.name)).toEqual(["theme", "material", "accent", "density", "font"]);
  });

  it("falls back to built-in axes and empty tokens when files are missing", async () => {
    const registry = new Registry({ source: path.join(FIXTURE_DIR, "..") });
    expect(await registry.axes()).toBe(BUILTIN_AXES);
    expect(await registry.tokens()).toEqual([]);
  });
});

describe("Registry (remote)", () => {
  const fakeFetch = () =>
    vi.fn(async (url: string | URL | Request) => {
      const file = String(url).split("/").pop()!;
      try {
        const body = await readFile(path.join(FIXTURE_DIR, file), "utf8");
        return new Response(body, { status: 200 });
      } catch {
        return new Response("not found", { status: 404 });
      }
    });

  it("fetches once and caches", async () => {
    const fetch = fakeFetch();
    const registry = new Registry({ source: "https://registry.test/r", fetch: fetch as unknown as typeof globalThis.fetch });
    await registry.items();
    await registry.items();
    await registry.item("dialog");
    await registry.item("dialog");
    expect(fetch.mock.calls.map((c) => String(c[0]))).toEqual(["https://registry.test/r/index.json", "https://registry.test/r/dialog.json"]);
  });

  it("reports unreachable registries", async () => {
    const fetch = vi.fn(async () => {
      throw new Error("ECONNREFUSED");
    });
    const registry = new Registry({ source: "https://down.test/r", fetch: fetch as unknown as typeof globalThis.fetch });
    await expect(registry.items()).rejects.toMatchObject({ code: "unreachable" });
    // A failed load is not cached.
    await expect(registry.items()).rejects.toMatchObject({ code: "unreachable" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe("lenient parsers", () => {
  it("parses token shapes", () => {
    expect(parseTokens({ tokens: [{ name: "fg", value: "#000" }] })).toEqual([{ name: "--fg", light: "#000", dark: undefined, description: undefined }]);
    expect(parseTokens({ "--gap": { light: "1rem" } })[0]).toMatchObject({ name: "--gap", light: "1rem" });
    expect(parseTokens(null)).toEqual([]);
  });
  it("parses axis shapes", () => {
    const axes = parseAxes({ density: ["comfortable", "compact"], accent: { values: ["lime", "ocean"] } });
    expect(axes.find((a) => a.name === "density")).toMatchObject({ attribute: "data-density", default: "comfortable" });
    expect(axes.find((a) => a.name === "accent")).toMatchObject({ attribute: "data-accent", values: ["lime", "ocean"] });
  });
});
