// The "atlas" key art of Ember Atlas, generated: topographic contour rings around a few peaks,
// a route of embers between them. Deterministic (no Math.random), so server and client agree and
// the press kit can export the same picture as a standalone SVG.

export const ATLAS_W = 1600;
export const ATLAS_H = 900;

interface Peak {
  x: number;
  y: number;
  rings: number;
  step: number;
  seed: number;
}

const PEAKS: Peak[] = [
  { x: 1120, y: 360, rings: 14, step: 26, seed: 1.3 },
  { x: 420, y: 620, rings: 10, step: 24, seed: 4.1 },
  { x: 760, y: 150, rings: 7, step: 22, seed: 2.7 },
  { x: 1450, y: 800, rings: 6, step: 30, seed: 5.9 },
];

/** Embers along the route, in walking order; `lit` ones have been planted. */
export const EMBERS: { x: number; y: number; lit: boolean; label: string }[] = [
  { x: 120, y: 820, lit: true, label: "00" },
  { x: 330, y: 700, lit: true, label: "01" },
  { x: 560, y: 520, lit: true, label: "02" },
  { x: 820, y: 470, lit: true, label: "03" },
  { x: 1010, y: 300, lit: false, label: "04" },
  { x: 1220, y: 230, lit: false, label: "05" },
  { x: 1480, y: 120, lit: false, label: "06" },
];

const round = (n: number) => Math.round(n * 10) / 10;

/** Closed Catmull-Rom spline through points → cubic Bézier path. */
function smoothClosed(pts: [number, number][]): string {
  const n = pts.length;
  let d = `M${round(pts[0]![0])} ${round(pts[0]![1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${round(c1[0]!)} ${round(c1[1]!)} ${round(c2[0]!)} ${round(c2[1]!)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d + "Z";
}

export interface Contour {
  d: string;
  /** 0 = outermost of its peak, 1 = summit. */
  level: number;
  /** Every fifth ring is an index contour (drawn heavier). */
  index: boolean;
}

export const CONTOURS: Contour[] = PEAKS.flatMap((p) =>
  Array.from({ length: p.rings }, (_, k) => {
    const r = p.step * (p.rings - k);
    const pts: [number, number][] = [];
    const N = 36;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const wobble = 1 + 0.18 * Math.sin(2 * a + p.seed + k * 0.07) + 0.09 * Math.sin(3 * a + p.seed * 2.1) + 0.05 * Math.sin(5 * a + p.seed * 0.7 + k * 0.2);
      pts.push([p.x + Math.cos(a) * r * wobble * 1.35, p.y + Math.sin(a) * r * wobble]);
    }
    return { d: smoothClosed(pts), level: k / Math.max(1, p.rings - 1), index: (p.rings - k) % 5 === 0 };
  }),
);

/** The walked route through the embers (open Catmull-Rom). */
export const ROUTE: string = (() => {
  const pts = EMBERS.map((e) => [e.x, e.y] as [number, number]);
  let d = `M${pts[0]![0]} ${pts[0]![1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    d += `C${round(p1[0] + (p2[0] - p0[0]) / 6)} ${round(p1[1] + (p2[1] - p0[1]) / 6)} ${round(p2[0] - (p3[0] - p1[0]) / 6)} ${round(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d;
})();

/** Index of the last lit ember: the walked part of the route ends here. */
export const LAST_LIT = EMBERS.reduce((acc, e, i) => (e.lit ? i : acc), 0);

/**
 * A standalone SVG of the key art (for downloads). Colours come in as resolved values — the page
 * reads them from its own tokens at download time.
 */
export function atlasSvg(colors: { bg: string; ink: string; ember: string }, options: { title?: string; width?: number } = {}): string {
  const w = options.width ?? 3840;
  const h = Math.round((w * ATLAS_H) / ATLAS_W);
  const rings = CONTOURS.map((c) => `<path d="${c.d}" fill="none" stroke="${colors.ink}" stroke-opacity="${(0.12 + c.level * 0.35).toFixed(2)}" stroke-width="${c.index ? 1.6 : 0.8}"/>`).join("");
  const embers = EMBERS.map(
    (e) => `<circle cx="${e.x}" cy="${e.y}" r="${e.lit ? 7 : 5}" fill="${e.lit ? colors.ember : "none"}" stroke="${colors.ember}" stroke-width="2"/>`,
  ).join("");
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ATLAS_W} ${ATLAS_H}" width="${w}" height="${h}">`,
    options.title ? `<title>${options.title}</title>` : "",
    `<rect width="${ATLAS_W}" height="${ATLAS_H}" fill="${colors.bg}"/>`,
    rings,
    `<path d="${ROUTE}" fill="none" stroke="${colors.ember}" stroke-width="2.5" stroke-dasharray="2 10" stroke-linecap="round"/>`,
    embers,
    `</svg>`,
  ].join("");
}

/** The game logo: an ember inside two contour arcs, then the wordmark. */
export function logoSvg(colors: { ink: string; ember: string; bg?: string }, wordmark: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 140" width="1280" height="280">`,
    `<title>${wordmark}</title>`,
    colors.bg ? `<rect width="640" height="140" fill="${colors.bg}"/>` : "",
    `<g transform="translate(70 70)">`,
    `<path d="M-46 0a46 40 0 1 1 92 0" fill="none" stroke="${colors.ink}" stroke-width="5" stroke-linecap="round"/>`,
    `<path d="M-30 6a30 26 0 1 1 60 0" fill="none" stroke="${colors.ink}" stroke-width="5" stroke-linecap="round" opacity=".55"/>`,
    `<circle cx="0" cy="12" r="11" fill="${colors.ember}"/>`,
    `</g>`,
    `<text x="140" y="92" font-family="Syne, 'Arial Black', sans-serif" font-weight="800" font-size="62" letter-spacing="-1" fill="${colors.ink}">${wordmark.toUpperCase()}</text>`,
    `</svg>`,
  ].join("");
}
