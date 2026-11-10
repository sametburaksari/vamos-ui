#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DEFAULT_REGISTRY } from "./registry.js";
import { createServer, SERVER_VERSION } from "./server.js";

const HELP = `vamos-ui-mcp ${SERVER_VERSION} — MCP server for Vamos UI (stdio)

Usage:
  vamos-ui-mcp [--registry <url-or-dir>]

Options:
  --registry <url|dir>  Registry to read (default: $VAMOS_REGISTRY or ${DEFAULT_REGISTRY}).
                        A local directory works too, e.g. apps/www/public/r.
  -h, --help            Show this help.
  -v, --version         Print the version.

This command is started by your MCP client (Claude Code, Claude Desktop, Cursor, VS Code, Codex).
Example: claude mcp add vamos-ui -- npx -y @vamos-ui/mcp
`;

function parseArgs(argv: string[]): { registry?: string } {
  const out: { registry?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "-h" || arg === "--help") {
      process.stdout.write(HELP);
      process.exit(0);
    }
    if (arg === "-v" || arg === "--version") {
      process.stdout.write(`${SERVER_VERSION}\n`);
      process.exit(0);
    }
    if (arg === "--registry") {
      const value = argv[++i];
      if (!value) fail("--registry needs a URL or directory.");
      out.registry = value;
    } else if (arg.startsWith("--registry=")) {
      out.registry = arg.slice("--registry=".length);
    } else {
      fail(`Unknown argument "${arg}". Run with --help.`);
    }
  }
  return out;
}

function fail(message: string): never {
  process.stderr.write(`vamos-ui-mcp: ${message}\n`);
  process.exit(2);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const { server, registry } = createServer({ source: args.registry });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is the protocol channel; diagnostics go to stderr.
  process.stderr.write(`vamos-ui-mcp ${SERVER_VERSION} ready (registry: ${registry.location})\n`);
  const shutdown = () => {
    void server.close().finally(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  process.stderr.write(`vamos-ui-mcp: ${(error as Error)?.stack ?? String(error)}\n`);
  process.exit(1);
});
