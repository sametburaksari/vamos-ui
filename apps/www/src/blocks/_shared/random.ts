// Seeded randomness so generated rows are identical on every render (no hydration mismatch).

/** mulberry32 — tiny, fast, good enough for fixtures. Returns a function giving [0, 1). */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one item with a seeded random function. */
export function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

/** Integer in [min, max]. */
export function int(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1));
}

/**
 * A deterministic daily/monthly series: `n` points around `start`, drifting by `drift` per step
 * (fraction, 0.01 = +1%) with `noise` jitter (fraction). Optional weekly rhythm for daily data.
 */
export function series(n: number, opts: { start: number; drift?: number; noise?: number; seed?: number; weekly?: number[]; decimals?: number }): number[] {
  const rand = seeded(opts.seed ?? 7);
  const out: number[] = [];
  let v = opts.start;
  for (let i = 0; i < n; i++) {
    const rhythm = opts.weekly ? opts.weekly[i % opts.weekly.length]! : 1;
    const jitter = 1 + (rand() * 2 - 1) * (opts.noise ?? 0.08);
    const p = 10 ** (opts.decimals ?? 0);
    out.push(Math.round(v * rhythm * jitter * p) / p);
    v *= 1 + (opts.drift ?? 0);
  }
  return out;
}
