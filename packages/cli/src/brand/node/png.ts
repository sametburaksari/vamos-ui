/**
 * A small PNG decoder (non-interlaced and Adam7, all colour types, bit depths 1–16) and a
 * dominant-colour picker for logos. Node only (zlib); no dependencies.
 */
import { inflateSync } from "node:zlib";
import { rgbToOklab, oklabToOklch, toHex, type Oklch } from "../color";

export interface DecodedPng {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel. */
  data: Uint8Array;
}

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };
const MAX_PIXELS = 40_000_000;

export function decodePng(buf: Uint8Array): DecodedPng {
  if (buf.length < 8 || SIGNATURE.some((b, i) => buf[i] !== b)) throw new Error("Not a PNG file.");
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let offset = 8;
  let width = 0;
  let height = 0;
  let depth = 8;
  let type = 6;
  let interlace = 0;
  let palette: Uint8Array | null = null;
  let trns: Uint8Array | null = null;
  const idat: Uint8Array[] = [];
  while (offset + 8 <= buf.length) {
    const len = view.getUint32(offset);
    const name = String.fromCharCode(buf[offset + 4]!, buf[offset + 5]!, buf[offset + 6]!, buf[offset + 7]!);
    const chunk = buf.subarray(offset + 8, offset + 8 + len);
    if (name === "IHDR") {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
      depth = chunk[8]!;
      type = chunk[9]!;
      interlace = chunk[12]!;
    } else if (name === "PLTE") palette = chunk;
    else if (name === "tRNS") trns = chunk;
    else if (name === "IDAT") idat.push(chunk);
    else if (name === "IEND") break;
    offset += 12 + len;
  }
  if (!width || !height || !(type in CHANNELS)) throw new Error("Unsupported PNG header.");
  if (width * height > MAX_PIXELS) throw new Error("PNG is too large to analyse.");
  const total = idat.reduce((n, c) => n + c.length, 0);
  const joined = new Uint8Array(total);
  let at = 0;
  for (const c of idat) {
    joined.set(c, at);
    at += c.length;
  }
  const raw = new Uint8Array(inflateSync(joined));
  const channels = CHANNELS[type]!;
  const bpp = Math.max(1, (channels * depth) >> 3); // bytes per complete pixel (≥ 1) for filtering
  const out = new Uint8Array(width * height * 4);

  const sample = (row: Uint8Array, x: number, c: number): number => {
    if (depth === 8) return row[x * channels + c]!;
    if (depth === 16) return row[(x * channels + c) * 2]!; // high byte
    const bitPos = (x * channels + c) * depth;
    const v = (row[bitPos >> 3]! >> (8 - depth - (bitPos & 7))) & ((1 << depth) - 1);
    return type === 3 ? v : Math.round((v * 255) / ((1 << depth) - 1));
  };
  const put = (row: Uint8Array, x: number, dx: number, dy: number) => {
    const o = (dy * width + dx) * 4;
    if (type === 3) {
      const idx = sample(row, x, 0);
      out[o] = palette?.[idx * 3] ?? 0;
      out[o + 1] = palette?.[idx * 3 + 1] ?? 0;
      out[o + 2] = palette?.[idx * 3 + 2] ?? 0;
      out[o + 3] = trns && idx < trns.length ? trns[idx]! : 255;
    } else if (type === 0 || type === 4) {
      const g = sample(row, x, 0);
      out[o] = out[o + 1] = out[o + 2] = g;
      out[o + 3] = type === 4 ? sample(row, x, 1) : 255;
    } else {
      out[o] = sample(row, x, 0);
      out[o + 1] = sample(row, x, 1);
      out[o + 2] = sample(row, x, 2);
      out[o + 3] = type === 6 ? sample(row, x, 3) : 255;
    }
  };

  let pos = 0;
  const pass = (w: number, h: number, place: (x: number, y: number) => [number, number]) => {
    if (!w || !h) return;
    const stride = Math.ceil((w * channels * depth) / 8);
    let prev = new Uint8Array(stride);
    for (let y = 0; y < h; y++) {
      const filter = raw[pos++]!;
      const row = raw.slice(pos, pos + stride);
      pos += stride;
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? row[i - bpp]! : 0;
        const b = prev[i]!;
        const c = i >= bpp ? prev[i - bpp]! : 0;
        let v = row[i]!;
        if (filter === 1) v += a;
        else if (filter === 2) v += b;
        else if (filter === 3) v += (a + b) >> 1;
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        row[i] = v & 0xff;
      }
      for (let x = 0; x < w; x++) {
        const [dx, dy] = place(x, y);
        put(row, x, dx, dy);
      }
      prev = row;
    }
  };
  if (interlace) {
    const passes = [
      [0, 0, 8, 8],
      [4, 0, 8, 8],
      [0, 4, 4, 8],
      [2, 0, 4, 4],
      [0, 2, 2, 4],
      [1, 0, 2, 2],
      [0, 1, 1, 2],
    ] as const;
    for (const [x0, y0, dx, dy] of passes) {
      pass(Math.ceil((width - x0) / dx), Math.ceil((height - y0) / dy), (x, y) => [x0 + x * dx, y0 + y * dy]);
    }
  } else pass(width, height, (x, y) => [x, y]);
  return { width, height, data: out };
}

export interface DominantColour {
  hex: string;
  oklch: Oklch;
  /** Share of the opaque, non-neutral pixels in this colour group (0–1). */
  share: number;
  /** True when the image has no colourful pixels and this is the dominant grey. */
  neutral: boolean;
}

/** The most common colourful colour of an image (transparent, near-white and grey pixels skipped). */
export function dominantColour(img: DecodedPng): DominantColour | null {
  const step = Math.max(1, Math.floor(Math.sqrt((img.width * img.height) / 40_000)));
  const buckets = new Map<string, { n: number; l: number; a: number; b: number }>();
  const greys = new Map<string, { n: number; l: number; a: number; b: number }>();
  let colourful = 0;
  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const o = (y * img.width + x) * 4;
      if (img.data[o + 3]! < 128) continue;
      const lab = rgbToOklab({ r: img.data[o]! / 255, g: img.data[o + 1]! / 255, b: img.data[o + 2]! / 255, alpha: 1 });
      const chroma = Math.hypot(lab.a, lab.b);
      const neutral = chroma < 0.04;
      if (neutral && (lab.l > 0.96 || lab.l < 0.04)) continue; // background white/black
      const key = `${Math.round(lab.l * 12)}:${Math.round(lab.a * 25)}:${Math.round(lab.b * 25)}`;
      const map = neutral ? greys : buckets;
      const e = map.get(key) ?? { n: 0, l: 0, a: 0, b: 0 };
      e.n++;
      e.l += lab.l;
      e.a += lab.a;
      e.b += lab.b;
      map.set(key, e);
      if (!neutral) colourful++;
    }
  }
  const pick = (map: typeof buckets) => [...map.values()].sort((p, q) => q.n - p.n)[0];
  const best = pick(buckets);
  const useGrey = !best || colourful < 20;
  const chosen = useGrey ? pick(greys) : best;
  if (!chosen) return null;
  const total = useGrey ? [...greys.values()].reduce((n, e) => n + e.n, 0) : colourful;
  const oklch = oklabToOklch({ l: chosen.l / chosen.n, a: chosen.a / chosen.n, b: chosen.b / chosen.n });
  return { hex: toHex(oklch), oklch, share: chosen.n / total, neutral: useGrey };
}
