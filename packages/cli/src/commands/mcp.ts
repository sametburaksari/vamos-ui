import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { bool, str, type ParsedArgs } from "../args";
import { findProjectRoot } from "../core/config";
import { stripJsonc } from "../core/project";
import { CliError } from "../core/types";
import { out, p, pc, printJson, unwrap, type Context } from "../ui";

export const MCP_NAME = "vamos-ui";
export const MCP_PACKAGE = "@vamos-ui/mcp";
const SERVER = { command: "npx", args: ["-y", MCP_PACKAGE] };

export type McpClient = "claude" | "cursor" | "vscode" | "windsurf" | "codex" | "gemini";

interface ClientSpec {
  label: string;
  /** Config file; "~/" means the user's home directory. */
  file: string;
  format: "json" | "toml";
  /** JSON: the object that holds servers. */
  container?: "mcpServers" | "servers";
  entry?: Record<string, unknown>;
  /** The client's own one-liner, printed as an alternative. */
  command?: string;
  /** Files or folders (project-relative or ~/) that suggest the client is in use. */
  detect: string[];
}

export const CLIENTS: Record<McpClient, ClientSpec> = {
  claude: {
    label: "Claude Code",
    file: ".mcp.json",
    format: "json",
    container: "mcpServers",
    entry: { ...SERVER },
    command: `claude mcp add ${MCP_NAME} -- npx -y ${MCP_PACKAGE}`,
    detect: [".mcp.json", ".claude", "CLAUDE.md"],
  },
  cursor: { label: "Cursor", file: ".cursor/mcp.json", format: "json", container: "mcpServers", entry: { ...SERVER }, detect: [".cursor"] },
  vscode: { label: "VS Code", file: ".vscode/mcp.json", format: "json", container: "servers", entry: { type: "stdio", ...SERVER }, detect: [".vscode"] },
  windsurf: { label: "Windsurf", file: "~/.codeium/windsurf/mcp_config.json", format: "json", container: "mcpServers", entry: { ...SERVER }, detect: [".windsurf", ".windsurfrules", "~/.codeium/windsurf"] },
  codex: { label: "Codex", file: "~/.codex/config.toml", format: "toml", command: `codex mcp add ${MCP_NAME} -- npx -y ${MCP_PACKAGE}`, detect: ["~/.codex"] },
  gemini: { label: "Gemini CLI", file: ".gemini/settings.json", format: "json", container: "mcpServers", entry: { ...SERVER }, detect: [".gemini", "GEMINI.md"] },
};

export const CLIENT_NAMES = Object.keys(CLIENTS) as McpClient[];

function resolveFile(file: string, root: string, home: string): string {
  return file.startsWith("~/") ? path.join(home, file.slice(2)) : path.join(root, file);
}

export function detectClients(root: string, home: string): McpClient[] {
  return CLIENT_NAMES.filter((c) => CLIENTS[c].detect.some((f) => existsSync(resolveFile(f, root, home))));
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export type McpResult = "added" | "updated" | "unchanged";

/** Pure: inserts or replaces the vamos-ui server in a JSON config. Other servers and keys are kept. */
export function upsertJsonConfig(existing: string | null, container: "mcpServers" | "servers", entry: Record<string, unknown>): { text: string; result: McpResult } {
  let doc: Record<string, any> = {};
  if (existing && existing.trim()) {
    try {
      doc = JSON.parse(stripJsonc(existing));
    } catch (err) {
      throw new CliError(`The existing config is not valid JSON, so it was left alone.`, (err as Error).message);
    }
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) throw new CliError("The existing config is not a JSON object, so it was left alone.");
  }
  const servers = doc[container] && typeof doc[container] === "object" && !Array.isArray(doc[container]) ? doc[container] : {};
  const prev = servers[MCP_NAME];
  if (prev && sameJson(prev, entry)) return { text: existing!, result: "unchanged" };
  doc[container] = { ...servers, [MCP_NAME]: entry };
  return { text: JSON.stringify(doc, null, 2) + "\n", result: prev ? "updated" : "added" };
}

const TOML_HEADER = /^\s*\[mcp_servers\.(?:vamos-ui|"vamos-ui")\]\s*$/;
export const TOML_SECTION = `[mcp_servers.${MCP_NAME}]\ncommand = "npx"\nargs = ["-y", "${MCP_PACKAGE}"]\n`;

/** Pure: inserts or replaces the [mcp_servers.vamos-ui] table in a Codex config.toml. */
export function upsertTomlConfig(existing: string | null): { text: string; result: McpResult } {
  const text = existing ?? "";
  const lines = text.split("\n");
  const start = lines.findIndex((l) => TOML_HEADER.test(l));
  if (start === -1) {
    const sep = !text.trim() ? "" : text.endsWith("\n\n") ? "" : text.endsWith("\n") ? "\n" : "\n\n";
    return { text: text + sep + TOML_SECTION, result: "added" };
  }
  let end = start + 1;
  while (end < lines.length && !/^\s*\[/.test(lines[end]!)) end++;
  const body = lines.slice(start, end).join("\n").trim();
  if (body === TOML_SECTION.trim()) return { text, result: "unchanged" };
  const trailing = end < lines.length ? "\n" : "";
  const next = [...lines.slice(0, start), ...TOML_SECTION.trimEnd().split("\n"), ...(trailing ? [""] : []), ...lines.slice(end)].join("\n");
  return { text: next.endsWith("\n") ? next : next + "\n", result: "updated" };
}

export interface McpWrite {
  client: McpClient;
  file: string;
  result: McpResult;
  command?: string;
}

/** Writes (or with dryRun, plans) the config for one client. Idempotent. */
export async function writeClientConfig(client: McpClient, root: string, home: string, opts: { dryRun?: boolean } = {}): Promise<McpWrite> {
  const spec = CLIENTS[client];
  const abs = resolveFile(spec.file, root, home);
  const existing = existsSync(abs) ? await readFile(abs, "utf8") : null;
  const next = spec.format === "toml" ? upsertTomlConfig(existing) : upsertJsonConfig(existing, spec.container!, spec.entry!);
  if (next.result !== "unchanged" && !opts.dryRun) {
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, next.text);
  }
  return { client, file: spec.file.startsWith("~/") ? abs : spec.file, result: next.result, ...(spec.command ? { command: spec.command } : {}) };
}

function snippet(client: McpClient): string {
  const spec = CLIENTS[client];
  if (spec.format === "toml") return TOML_SECTION.trimEnd();
  return JSON.stringify({ [spec.container!]: { [MCP_NAME]: spec.entry } }, null, 2);
}

const HELP = `${pc.bold("vamos-ui mcp add")}  Connect an AI client to the Vamos UI MCP server (${MCP_PACKAGE})

${pc.bold("Usage")}
  npx vamos-ui mcp add [--client ${CLIENT_NAMES.join("|")}] [--print] [--dry-run]

Without --client, the clients used in this project are detected (.mcp.json/.claude, .cursor, .vscode,
.gemini, ~/.codex, ~/.codeium/windsurf); Claude Code is the fallback. Running it again changes nothing.
--print shows the config (and the client's own command) without writing.`;

export async function mcp(ctx: Context, args: ParsedArgs): Promise<number> {
  const sub = args.positionals[0];
  if (sub !== "add" || bool(args.flags, "help")) {
    out(HELP);
    return sub === undefined || sub === "add" || bool(args.flags, "help") ? 0 : 1;
  }
  const root = findProjectRoot(ctx.cwd);
  const home = ctx.env.VAMOS_HOME ?? os.homedir();
  const flag = str(args.flags, "client");
  let clients: McpClient[];
  if (flag) {
    const names = flag.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const aliases: Record<string, McpClient> = { "claude-code": "claude", code: "vscode", "vs-code": "vscode", copilot: "vscode", "gemini-cli": "gemini" };
    clients = names.map((n) => {
      const c = (aliases[n] ?? n) as McpClient;
      if (!CLIENTS[c]) throw new CliError(`Unknown client "${n}".`, `Use one of: ${CLIENT_NAMES.join(", ")}.`);
      return c;
    });
  } else {
    const detected = detectClients(root, home);
    if (ctx.interactive && !bool(args.flags, "print")) {
      clients = unwrap(
        await p.multiselect({
          message: "Which AI clients should get the Vamos UI MCP server?",
          options: CLIENT_NAMES.map((c) => ({ value: c, label: CLIENTS[c].label, hint: CLIENTS[c].file })),
          initialValues: detected.length ? detected : ["claude"],
          required: true,
        }),
      ) as McpClient[];
    } else clients = detected.length ? detected : ["claude"];
  }
  clients = [...new Set(clients)];

  if (bool(args.flags, "print")) {
    if (ctx.json) {
      printJson(clients.map((c) => ({ client: c, file: CLIENTS[c].file, config: CLIENTS[c].format === "toml" ? TOML_SECTION : JSON.parse(snippet(c)), command: CLIENTS[c].command ?? null })));
      return 0;
    }
    for (const c of clients) {
      out(`${pc.bold(CLIENTS[c].label)} ${pc.dim(CLIENTS[c].file)}`);
      out(snippet(c));
      if (CLIENTS[c].command) out(pc.dim(`or: ${CLIENTS[c].command}`));
      out("");
    }
    return 0;
  }

  const dryRun = bool(args.flags, "dry-run");
  const results: McpWrite[] = [];
  for (const c of clients) results.push(await writeClientConfig(c, root, home, { dryRun }));
  if (ctx.json) {
    printJson({ dryRun, results });
    return 0;
  }
  for (const r of results) {
    const label = CLIENTS[r.client].label;
    if (r.result === "unchanged") p.log.info(`${label}: already set up in ${pc.dim(r.file)}`);
    else p.log.success(`${label}: ${dryRun ? "would " : ""}${r.result === "added" ? "add" : "update"}${dryRun ? "" : r.result === "added" ? "ed" : "d"} ${MCP_NAME} in ${pc.dim(r.file)}`);
  }
  const claude = results.find((r) => r.client === "claude");
  if (claude) p.log.message(pc.dim(`Claude Code asks you to approve project servers from .mcp.json once. For a user-wide setup: ${CLIENTS.claude.command}`));
  p.log.message(pc.dim("Restart the client (or reload its MCP servers) to pick it up."));
  return 0;
}
