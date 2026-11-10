// Pure, deterministic layout math for Gallery (SSR-safe; no DOM).

/** Distributes items into `columns` by known aspect ratios (w/h), shortest column first. */
export function masonryColumns(ratios: number[], columns: number): number[][] {
  const n = Math.max(1, Math.floor(columns));
  const cols: number[][] = Array.from({ length: n }, () => []);
  const heights = new Array<number>(n).fill(0);
  ratios.forEach((r, i) => {
    let target = 0;
    for (let c = 1; c < n; c++) if (heights[c]! < heights[target]! - 1e-6) target = c;
    cols[target]!.push(i);
    heights[target]! += 1 / (r > 0 ? r : 1);
  });
  return cols;
}

export interface JustifiedRow {
  /** Item indexes in this row. */
  items: number[];
  /** Row height in px. */
  height: number;
  /** `false` for an unfilled last row (kept at the target height). */
  justified: boolean;
}

/**
 * Flickr-style justified rows: fills each row with items at `rowHeight` until it overflows the
 * container width, then scales the row so it fits exactly. The last row keeps `rowHeight`.
 * A row never grows taller than `rowHeight * maxScale`.
 */
export function justifyRows(ratios: number[], width: number, rowHeight: number, gap = 0, maxScale = 1.6): JustifiedRow[] {
  const rows: JustifiedRow[] = [];
  if (width <= 0) return rows;
  let row: number[] = [];
  let sum = 0;
  ratios.forEach((raw, i) => {
    const r = raw > 0 ? raw : 1;
    row.push(i);
    sum += r;
    const natural = sum * rowHeight + gap * (row.length - 1);
    if (natural >= width) {
      const height = Math.min((width - gap * (row.length - 1)) / sum, rowHeight * maxScale);
      rows.push({ items: row, height, justified: true });
      row = [];
      sum = 0;
    }
  });
  if (row.length) {
    const fit = (width - gap * (row.length - 1)) / sum;
    rows.push({ items: row, height: Math.min(rowHeight, fit), justified: false });
  }
  return rows;
}

export type Responsive<T> = T | Partial<Record<"base" | "sm" | "md" | "lg", T>>;

const BP = { sm: 640, md: 768, lg: 1024 } as const;

/** Picks the value for a container width (falls back to `base`, then `fallback`). */
export function responsiveValue<T>(value: Responsive<T> | undefined, width: number | undefined, fallback: T): T {
  if (value === undefined) return fallback;
  if (typeof value !== "object" || value === null) return value as T;
  const v = value as Partial<Record<"base" | "sm" | "md" | "lg", T>>;
  let out = v.base ?? fallback;
  if (width === undefined) return out;
  for (const bp of ["sm", "md", "lg"] as const) if (width >= BP[bp] && v[bp] !== undefined) out = v[bp]!;
  return out;
}
