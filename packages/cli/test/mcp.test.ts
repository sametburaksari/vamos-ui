import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { run } from "../src/cli";
import { detectClients, TOML_SECTION, upsertJsonConfig, upsertTomlConfig } from "../src/commands/mcp";

let tmp: string;
let home: string;

async function cli(cwd: string, ...argv: string[]): Promise<{ code: number; out: string }> {
  let out = "";
  const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    out += typeof chunk === "string" ? chunk : Buffer.from(chunk).toString();
    return true;
  });
  try {
    const code = await run(argv, { cwd, interactive: false, env: { ...process.env, VAMOS_HOME: home, CI: "1" } });
    return { code, out };
  } finally {
    spy.mockRestore();
  }
}

function project(name: string, files: Record<string, string> = {}): string {
  const dir = path.join(tmp, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name }));
  for (const [f, c] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
    writeFileSync(path.join(dir, f), c);
  }
  return dir;
}

const json = (dir: string, f: string) => JSON.parse(readFileSync(path.join(dir, f), "utf8"));

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "vamos-mcp-"));
  home = path.join(tmp, "home");
  mkdirSync(home);
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe("config upserts (pure)", () => {
  it("JSON: adds, keeps other servers and keys, is idempotent, updates a stale entry", () => {
    const entry = { command: "npx", args: ["-y", "@vamos-ui/mcp"] };
    const first = upsertJsonConfig(null, "mcpServers", entry);
    expect(first.result).toBe("added");
    expect(JSON.parse(first.text)).toEqual({ mcpServers: { "vamos-ui": entry } });
    expect(upsertJsonConfig(first.text, "mcpServers", entry)).toEqual({ text: first.text, result: "unchanged" });
    const other = JSON.stringify({ theme: "x", mcpServers: { github: { command: "gh" } } });
    expect(JSON.parse(upsertJsonConfig(other, "mcpServers", entry).text)).toEqual({ theme: "x", mcpServers: { github: { command: "gh" }, "vamos-ui": entry } });
    const stale = JSON.stringify({ mcpServers: { "vamos-ui": { command: "node", args: ["old.js"] } } });
    expect(upsertJsonConfig(stale, "mcpServers", entry).result).toBe("updated");
    // JSONC (VS Code) is read
    expect(upsertJsonConfig(`{\n  // servers\n  "servers": {},\n}`, "servers", entry).result).toBe("added");
    expect(() => upsertJsonConfig("{ nope", "mcpServers", entry)).toThrow(/not valid JSON/);
  });

  it("TOML: appends a table, is idempotent, replaces only its own table", () => {
    const first = upsertTomlConfig(`model = "o4"\n`);
    expect(first).toEqual({ text: `model = "o4"\n\n${TOML_SECTION}`, result: "added" });
    expect(upsertTomlConfig(first.text).result).toBe("unchanged");
    const stale = `[mcp_servers.vamos-ui]\ncommand = "node"\n\n[mcp_servers.other]\ncommand = "x"\n`;
    const next = upsertTomlConfig(stale);
    expect(next.result).toBe("updated");
    expect(next.text).toContain(`args = ["-y", "@vamos-ui/mcp"]`);
    expect(next.text).toContain(`[mcp_servers.other]\ncommand = "x"`);
    expect(next.text).not.toContain(`command = "node"`);
    expect(upsertTomlConfig(next.text).result).toBe("unchanged");
    expect(upsertTomlConfig(null).text).toBe(TOML_SECTION);
  });
});

describe("vamos-ui mcp add", () => {
  it("writes the project config for each named client and is idempotent", async () => {
    const dir = project("named");
    expect((await cli(dir, "mcp", "add", "--client", "cursor,vscode,gemini,claude")).code).toBe(0);
    expect(json(dir, ".cursor/mcp.json")).toEqual({ mcpServers: { "vamos-ui": { command: "npx", args: ["-y", "@vamos-ui/mcp"] } } });
    expect(json(dir, ".vscode/mcp.json")).toEqual({ servers: { "vamos-ui": { type: "stdio", command: "npx", args: ["-y", "@vamos-ui/mcp"] } } });
    expect(json(dir, ".gemini/settings.json").mcpServers["vamos-ui"]).toBeDefined();
    expect(json(dir, ".mcp.json").mcpServers["vamos-ui"]).toBeDefined();
    const before = readFileSync(path.join(dir, ".cursor/mcp.json"), "utf8");
    const again = await cli(dir, "mcp", "add", "--client", "cursor", "--json");
    expect(JSON.parse(again.out).results[0]).toMatchObject({ client: "cursor", result: "unchanged" });
    expect(readFileSync(path.join(dir, ".cursor/mcp.json"), "utf8")).toBe(before);
  });

  it("writes user-level configs for codex and windsurf under the home directory", async () => {
    const dir = project("home");
    expect((await cli(dir, "mcp", "add", "--client", "codex")).code).toBe(0);
    expect(readFileSync(path.join(home, ".codex/config.toml"), "utf8")).toBe(TOML_SECTION);
    expect((await cli(dir, "mcp", "add", "--client", "windsurf")).code).toBe(0);
    expect(JSON.parse(readFileSync(path.join(home, ".codeium/windsurf/mcp_config.json"), "utf8")).mcpServers["vamos-ui"]).toBeDefined();
  });

  it("detects clients from the project, falls back to Claude Code, and --print writes nothing", async () => {
    const dir = project("detect", { ".cursor/rules.md": "", ".vscode/settings.json": "{}" });
    // home now has ~/.codex and ~/.codeium/windsurf from the previous test
    expect(detectClients(dir, home)).toEqual(["cursor", "vscode", "windsurf", "codex"]);
    const empty = project("empty");
    expect(detectClients(empty, path.join(tmp, "nohome"))).toEqual([]);
    const printed = await cli(empty, "mcp", "add", "--print", "--client", "claude");
    expect(printed.out).toContain("claude mcp add vamos-ui -- npx -y @vamos-ui/mcp");
    expect(existsSync(path.join(empty, ".mcp.json"))).toBe(false);
    const spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const res = await run(["mcp", "add", "--json"], { cwd: empty, interactive: false, env: { ...process.env, VAMOS_HOME: path.join(tmp, "nohome"), CI: "1" } }).finally(() => spy.mockRestore());
    expect(res).toBe(0);
    expect(json(empty, ".mcp.json").mcpServers["vamos-ui"]).toBeDefined();
  });

  it("rejects unknown clients", async () => {
    const { code, out } = await cli(project("bad"), "mcp", "add", "--client", "notepad", "--json");
    expect(code).toBe(1);
    expect(JSON.parse(out).error).toMatch(/Unknown client/);
  });
});
