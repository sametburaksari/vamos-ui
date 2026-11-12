import { randomBytes } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Anonymous OAuth 2.1 for the hosted server.
 *
 * The hosted server needs no account: every tool is read-only and works without a token.
 * Some clients (and directory listings) still start an OAuth flow before connecting, so this
 * module answers it without asking anyone anything: dynamic client registration, an
 * authorize endpoint that redirects straight back with a code, and a token endpoint that
 * issues an opaque token. Nothing is stored and the token unlocks nothing extra.
 *
 * The client id carries its registered redirect URIs, so /authorize can check the redirect
 * target without a database.
 */

export const OAUTH_PATHS = new Set([
  "/.well-known/oauth-protected-resource",
  "/.well-known/oauth-protected-resource/mcp",
  "/.well-known/oauth-authorization-server",
  "/.well-known/oauth-authorization-server/mcp",
  "/.well-known/openid-configuration",
  "/register",
  "/authorize",
  "/token",
]);

const SCOPE = "vamos-ui";
const TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days; the token grants nothing, so a long life only saves round trips.

function baseUrl(req: IncomingMessage): string {
  const fromEnv = process.env.MCP_PUBLIC_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const fwdHost = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim();
  const host = fwdHost || req.headers.host || "localhost";
  const fwdProto = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const proto = fwdProto || (fwdHost ? "https" : "http");
  return `${proto}://${host}`;
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }).end(JSON.stringify(body));
}

function token(prefix: string): string {
  return `${prefix}_${randomBytes(24).toString("base64url")}`;
}

function readRaw(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > 64 * 1024) {
        reject(new Error("Body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function readParams(req: IncomingMessage): Promise<Record<string, unknown>> {
  const raw = await readRaw(req);
  if (!raw) return {};
  const type = String(req.headers["content-type"] ?? "");
  if (type.includes("application/json")) {
    try {
      const v = JSON.parse(raw) as unknown;
      return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

/** https anywhere, or http on loopback (desktop clients). */
function allowedRedirect(uri: string): boolean {
  try {
    const u = new URL(uri);
    if (u.protocol === "https:") return true;
    if (u.protocol === "http:") return ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
    return false;
  } catch {
    return false;
  }
}

function encodeClient(redirectUris: string[]): string {
  return `vui_${Buffer.from(JSON.stringify({ r: redirectUris })).toString("base64url")}`;
}

function decodeClient(clientId: string): string[] | undefined {
  if (!clientId.startsWith("vui_")) return undefined;
  try {
    const v = JSON.parse(Buffer.from(clientId.slice(4), "base64url").toString("utf8")) as { r?: unknown };
    return Array.isArray(v.r) ? v.r.filter((x): x is string => typeof x === "string") : undefined;
  } catch {
    return undefined;
  }
}

function authServerMetadata(base: string) {
  return {
    issuer: base,
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    registration_endpoint: `${base}/register`,
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256", "plain"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    scopes_supported: [SCOPE],
    service_documentation: "https://ui.vamos.ist/docs/mcp/",
  };
}

/** Handles the OAuth paths. Returns false when the path is not an OAuth path. */
export async function handleOAuth(req: IncomingMessage, res: ServerResponse, url: URL): Promise<boolean> {
  if (!OAUTH_PATHS.has(url.pathname)) return false;
  const base = baseUrl(req);

  switch (url.pathname) {
    case "/.well-known/oauth-protected-resource":
    case "/.well-known/oauth-protected-resource/mcp":
      json(res, 200, {
        resource: `${base}/mcp`,
        authorization_servers: [base],
        scopes_supported: [SCOPE],
        bearer_methods_supported: ["header"],
        resource_name: "Vamos UI",
        resource_documentation: "https://ui.vamos.ist/docs/mcp/",
      });
      return true;

    case "/.well-known/oauth-authorization-server":
    case "/.well-known/oauth-authorization-server/mcp":
    case "/.well-known/openid-configuration":
      json(res, 200, authServerMetadata(base));
      return true;

    case "/register": {
      if (req.method !== "POST") return json(res, 405, { error: "invalid_request", error_description: "Use POST." }), true;
      const body = await readParams(req);
      const uris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((x): x is string => typeof x === "string") : [];
      if (!uris.length || !uris.every(allowedRedirect)) {
        json(res, 400, { error: "invalid_redirect_uri", error_description: "redirect_uris must be https URLs (or http on localhost)." });
        return true;
      }
      const authMethod = typeof body.token_endpoint_auth_method === "string" ? body.token_endpoint_auth_method : "none";
      const out: Record<string, unknown> = {
        client_id: encodeClient(uris),
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_name: typeof body.client_name === "string" ? body.client_name : undefined,
        redirect_uris: uris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: authMethod,
        scope: SCOPE,
      };
      if (authMethod !== "none") {
        out.client_secret = token("vus");
        out.client_secret_expires_at = 0;
      }
      json(res, 201, out);
      return true;
    }

    case "/authorize": {
      const q = url.searchParams;
      const clientId = q.get("client_id") ?? "";
      const redirect = q.get("redirect_uri") ?? "";
      const registered = decodeClient(clientId);
      const target = redirect || (registered?.length === 1 ? registered[0] : "");
      // Never redirect to an unchecked target: show the error here instead.
      if (!target || !allowedRedirect(target) || (registered && !registered.includes(target))) {
        json(res, 400, { error: "invalid_request", error_description: "Unknown client_id or redirect_uri." });
        return true;
      }
      const back = new URL(target);
      if (q.get("response_type") !== "code") {
        back.searchParams.set("error", "unsupported_response_type");
      } else {
        back.searchParams.set("code", token("vuc"));
      }
      const state = q.get("state");
      if (state) back.searchParams.set("state", state);
      back.searchParams.set("iss", base);
      res.writeHead(302, { location: back.toString(), "cache-control": "no-store" }).end();
      return true;
    }

    case "/token": {
      if (req.method !== "POST") return json(res, 405, { error: "invalid_request", error_description: "Use POST." }), true;
      const body = await readParams(req);
      const grant = body.grant_type;
      if (grant !== "authorization_code" && grant !== "refresh_token") {
        json(res, 400, { error: "unsupported_grant_type" });
        return true;
      }
      json(res, 200, {
        access_token: token("vua"),
        token_type: "Bearer",
        expires_in: TOKEN_TTL,
        refresh_token: token("vur"),
        scope: SCOPE,
      });
      return true;
    }
  }
  return false;
}
