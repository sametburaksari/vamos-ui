/**
 * Exact decimal-string arithmetic for money (BigInt fixed point). Values in and out are decimal
 * strings ("1234.50"), never floats. Rounding is half-up, away from zero (commercial rounding).
 */

const DEC_RE = /^([+-])?(\d*)(?:\.(\d*))?$/;

/** Parses a decimal string into integer units at `scale` (half-up when it has more digits). */
export function toUnits(value: string | number, scale: number): bigint {
  const s = typeof value === "number" ? numberToString(value) : value.trim().replace(/[\s_]/g, "");
  const m = DEC_RE.exec(s);
  if (!m || (m[2] === "" && (m[3] ?? "") === "")) throw new RangeError(`Not a decimal: "${value}"`);
  const neg = m[1] === "-";
  const int = m[2] || "0";
  const frac = m[3] ?? "";
  let units = BigInt(int + frac.slice(0, scale).padEnd(scale, "0"));
  const next = frac.charCodeAt(scale);
  if (frac.length > scale && next >= 53 /* "5" */) units += 1n;
  return neg ? -units : units;
}

/** Formats integer units at `scale` as a decimal string with exactly `scale` places. */
export function fromUnits(units: bigint, scale: number): string {
  const neg = units < 0n;
  const abs = (neg ? -units : units).toString().padStart(scale + 1, "0");
  const out = scale ? `${abs.slice(0, -scale)}.${abs.slice(-scale)}` : abs;
  return neg && units !== 0n ? `-${out}` : out;
}

function numberToString(n: number): string {
  if (!Number.isFinite(n)) throw new RangeError(`Not a finite number: ${n}`);
  const s = String(n);
  if (!/e/i.test(s)) return s;
  return n.toFixed(20).replace(/0+$/, "").replace(/\.$/, "");
}

/** `a × b ÷ c` with half-up rounding (all bigint units). */
export function mulDivRound(a: bigint, b: bigint, c: bigint): bigint {
  if (c === 0n) throw new RangeError("Division by zero");
  const num = a * b;
  const neg = num < 0n !== c < 0n;
  const n = num < 0n ? -num : num;
  const d = c < 0n ? -c : c;
  const q = (n * 2n + d) / (d * 2n);
  return neg ? -q : q;
}

/** Rounds a decimal string half-up to `places` ("2.345" → "2.35", "-2.345" → "-2.35"). */
export function roundHalfUp(value: string | number, places = 2): string {
  return fromUnits(toUnits(value, places), places);
}

export function addDecimal(...values: (string | number)[]): string {
  const scale = Math.max(2, ...values.map(scaleOf));
  return fromUnits(values.reduce<bigint>((s, v) => s + toUnits(v, scale), 0n), scale);
}

export function subtractDecimal(a: string | number, b: string | number): string {
  const scale = Math.max(2, scaleOf(a), scaleOf(b));
  return fromUnits(toUnits(a, scale) - toUnits(b, scale), scale);
}

/** `a × b` rounded half-up to `places`. */
export function multiplyDecimal(a: string | number, b: string | number, places = 2): string {
  const sa = scaleOf(a);
  const sb = scaleOf(b);
  return fromUnits(mulDivRound(toUnits(a, sa) * toUnits(b, sb), 10n ** BigInt(places), 10n ** BigInt(sa + sb)), places);
}

/** `a ÷ b` rounded half-up to `places`. */
export function divideDecimal(a: string | number, b: string | number, places = 2): string {
  const s = Math.max(scaleOf(a), scaleOf(b));
  return fromUnits(mulDivRound(toUnits(a, s), 10n ** BigInt(places), toUnits(b, s)), places);
}

export function compareDecimal(a: string | number, b: string | number): -1 | 0 | 1 {
  const s = Math.max(scaleOf(a), scaleOf(b));
  const d = toUnits(a, s) - toUnits(b, s);
  return d < 0n ? -1 : d > 0n ? 1 : 0;
}

function scaleOf(v: string | number): number {
  const s = typeof v === "number" ? numberToString(v) : v.trim();
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}
