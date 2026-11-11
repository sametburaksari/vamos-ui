// Developer console data: API keys and webhooks from the shared account fixture, plus a
// deterministic request log so the console reads the same on every render.
import { apiKeys, apiScopes, webhookDeliveries, webhookEndpoints, type ApiKey, type WebhookDelivery } from "../../_shared/account";
import { int, pick, seeded } from "../../_shared/random";
import { NOW_MS } from "../../_shared/time";

export { apiKeys, apiScopes, webhookDeliveries, webhookEndpoints };
export type { ApiKey, WebhookDelivery };

export type Env = "live" | "test";
export type Page = "overview" | "logs" | "keys" | "webhooks";

export interface RequestLog {
  id: string;
  /** epoch ms */
  at: number;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  status: number;
  /** ms */
  duration: number;
  keyId: string;
  ip: string;
}

const routes: Array<[RequestLog["method"], string]> = [
  ["GET", "/v2/orders"],
  ["GET", "/v2/orders/ord_8KQ2"],
  ["POST", "/v2/orders"],
  ["PATCH", "/v2/stock/SH-OAK-120"],
  ["GET", "/v2/products"],
  ["GET", "/v2/products/LT-PND-03"],
  ["POST", "/v2/webhooks/test"],
  ["GET", "/v2/customers"],
  ["DELETE", "/v2/orders/ord_7MB1/lines/2"],
  ["PATCH", "/v2/orders/ord_8KQ2"],
];
const liveKeys = ["key-7", "key-4", "key-5"];

/** One request; the same `n` always gives the same line. */
export function requestAt(n: number, at: number): RequestLog {
  const rand = seeded(9000 + n);
  const [method, path] = pick(rand, routes);
  const roll = rand();
  const status = roll < 0.86 ? (method === "POST" ? 201 : 200) : roll < 0.93 ? pick(rand, [400, 404, 409, 422]) : roll < 0.97 ? 429 : pick(rand, [500, 502]);
  return {
    id: `req_${(n * 7919).toString(36).toUpperCase().padStart(6, "0")}`,
    at,
    method,
    path,
    status,
    duration: status >= 500 ? int(rand, 1800, 3100) : int(rand, 38, method === "GET" ? 240 : 420),
    keyId: pick(rand, liveKeys),
    ip: `203.0.113.${int(rand, 2, 250)}`,
  };
}

/** The 60 most recent requests before NOW, newest first. */
export const initialLogs: RequestLog[] = Array.from({ length: 60 }, (_, i) => requestAt(i, NOW_MS - i * 23_000 - (i % 3) * 4_000));

/** Requests per hour over the last 24 hours (oldest first). */
export const hourly: number[] = Array.from({ length: 24 }, (_, h) => {
  const rand = seeded(400 + h);
  const hourOfDay = (10 - 23 + h + 24) % 24;
  const base = hourOfDay >= 9 && hourOfDay <= 21 ? 5200 : 1400;
  return Math.round(base + rand() * 1600 + (hourOfDay === 12 ? 1800 : 0));
});
export const errorsHourly: number[] = hourly.map((v, h) => Math.round(v * (h === 17 ? 0.031 : 0.004 + seeded(700 + h)() * 0.006)));

export const statusClass = (s: number) => (s >= 500 ? "5xx" : s >= 400 ? "4xx" : "2xx");

export const keyName = (id: string) => apiKeys.find((k) => k.id === id)?.name ?? id;

/** A deterministic-looking new secret (only shown once). */
export function newSecret(env: Env, seed: number) {
  const rand = seeded(seed);
  const abc = "abcdefghijkmnopqrstuvwxyz23456789";
  const body = Array.from({ length: 32 }, () => abc[Math.floor(rand() * abc.length)]).join("");
  return `vk_${env}_${body}`;
}
