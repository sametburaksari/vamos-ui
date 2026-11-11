#!/usr/bin/env node
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { DEFAULT_REGISTRY } from "./registry.js";
import { createServer, SERVER_VERSION } from "./server.js";

const HELP = `vamos-ui-mcp ${SERVER_VERSION} — MCP server for Vamos UI

Usage:
  vamos-ui-mcp [--registry <url-or-dir>]            stdio (started by your MCP client)
  vamos-ui-mcp --http [--port 3333] [--host 127.0.0.1]  Streamable HTTP at /mcp (hosted mode)

Options:
  --registry <url|dir>  Registry to read (default: $VAMOS_REGISTRY or ${DEFAULT_REGISTRY}).
                        A local directory works too, e.g. apps/www/public/r.
  --http                Serve over Streamable HTTP instead of stdio. Hosted mode: tools that
                        read a local project or fetch URLs are disabled.
  --port <n>            HTTP port (default: $PORT or 3333).
  --host <addr>         HTTP bind address (default: 127.0.0.1).
  -h, --help            Show this help.
  -v, --version         Print the version.

This command is started by your MCP client (Claude Code, Claude Desktop, Cursor, VS Code, Codex).
Example: claude mcp add vamos-ui -- npx -y @vamos-ui/mcp
`;

interface Args {
  registry?: string;
  http?: boolean;
  port?: number;
  host?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = {};
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
    } else if (arg === "--http") {
      out.http = true;
    } else if (arg === "--port" || arg === "--host") {
      const value = argv[++i];
      if (!value) fail(`${arg} needs a value.`);
      if (arg === "--port") out.port = Number(value);
      else out.host = value;
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

const MAX_BODY = 1_000_000;

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("Request body too large"));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : undefined);
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(body));
}

/** Stateless Streamable HTTP: a fresh server + transport per request, so any number of clients can share it. */
async function serveHttp(args: Args): Promise<void> {
  const port = args.port ?? Number(process.env.PORT ?? 3333);
  const host = args.host ?? "127.0.0.1";
  if (!Number.isInteger(port) || port <= 0) fail("--port must be a positive integer.");
  const { registry } = createServer({ source: args.registry, remote: true });
  const http = createHttpServer(async (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-headers", "content-type, mcp-session-id, mcp-protocol-version, authorization");
    res.setHeader("access-control-expose-headers", "mcp-session-id");
    res.setHeader("access-control-allow-methods", "GET, POST, DELETE, OPTIONS");
    const url = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "OPTIONS") return void res.writeHead(204).end();
    if (url.pathname === "/" || url.pathname === "/health") {
      return sendJson(res, 200, { name: "vamos-ui", version: SERVER_VERSION, transport: "streamable-http", endpoint: "/mcp", registry: registry.location });
    }
    if (url.pathname !== "/mcp") return sendJson(res, 404, { error: "Not found. The MCP endpoint is /mcp." });
    if (req.method !== "POST") {
      return sendJson(res, 405, { jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed (stateless server: use POST)." }, id: null });
    }
    try {
      const body = await readBody(req);
      const { server } = createServer({ registry, remote: true });
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (error) {
      if (!res.headersSent) sendJson(res, 400, { jsonrpc: "2.0", error: { code: -32700, message: (error as Error).message }, id: null });
    }
  });
  http.listen(port, host, () => {
    process.stderr.write(`vamos-ui-mcp ${SERVER_VERSION} listening on http://${host}:${port}/mcp (registry: ${registry.location})\n`);
  });
  const shutdown = () => http.close(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.http) return serveHttp(args);
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
