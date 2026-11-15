// Web Crypto helpers shared by the payment adapters (Node 20+, edge runtimes, Deno, Bun).

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error("payments: Web Crypto is not available in this runtime");
  return s;
}

const enc = new TextEncoder();

/** Raw HMAC-SHA256 of a UTF-8 message with a UTF-8 key. */
export async function hmacSha256(key: string, message: string): Promise<Uint8Array> {
  const k = await subtle().importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await subtle().sign("HMAC", k, enc.encode(message)));
}

export const toHex = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

/** Base64 of bytes, or of a string as UTF-8. */
export function toBase64(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? enc.encode(input) : input;
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Constant-time comparison of two strings (length leaks, content does not). */
export function safeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/** Throws a configuration error that names the setting, never its value. */
export function requireSetting(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new TypeError(`payments: ${name} is missing (read it from the environment and pass it in)`);
  return value;
}
