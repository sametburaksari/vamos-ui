// Docs-only sample media for the site-block examples: real venue photos (Unsplash) and
// wordmarks for fictional brands. Replace with your own assets.

const u = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  diningRoom: { ...u("1517248135467-4c7edcad34c4", 2000, 1333), alt: "The dining room at dusk, candles on oak tables" },
  mezeTable: { ...u("1414235077428-338989a2e8c0", 2000, 1333), alt: "Plates of meze and raki glasses on a white tablecloth" },
  plated: { ...u("1504674900247-0877df9cc836", 1600, 1067), alt: "A plate of grilled fish with herbs and lemon" },
  spaStones: { ...u("1544161515-4ab6ce6db874", 1400, 1750), alt: "A therapist laying warm stones beside a massage table" },
  spaRoom: { ...u("1540555700478-4be289fbecef", 1600, 1067), alt: "A treatment room with folded towels and a lit candle" },
  flowers: { ...u("1490750967868-88aa4486c946", 1600, 2000), alt: "Fresh peonies on the reception desk" },
  studio: { ...u("1497366216548-37526070297c", 2400, 1600), alt: "The studio’s long table by the window, late afternoon" },
  team: { ...u("1522071820081-009f0129c71c", 1600, 1067), alt: "Four people reviewing a site layout on a laptop" },
  dashboard: { ...u("1551288049-bebda4e38f71", 2400, 1600), alt: "Analytics dashboard on a monitor" },
  hotelRoom: { ...u("1505691938895-1758d7feb511", 1600, 1067), alt: "A hotel room with linen bedding and morning light" },
  architecture: { ...u("1486406146926-c627a92ad1ab", 1600, 2000), alt: "A glass office tower against a pale sky" },
};

type Mark = "serif" | "sans" | "mono" | "condensed" | "italic";
const FONTS: Record<Mark, string> = {
  serif: "font-family='Georgia, serif' font-size='26' letter-spacing='-0.5'",
  sans: "font-family='Helvetica, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='-0.8'",
  mono: "font-family='Menlo, monospace' font-size='18' font-weight='600' letter-spacing='1'",
  condensed: "font-family='Arial Narrow, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='2'",
  italic: "font-family='Georgia, serif' font-size='26' font-style='italic'",
};

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A wordmark SVG for a fictional brand (data URL). `fill` is ink on light, paper on dark. */
export function wordmark(name: string, mark: Mark, fill = "#1b1d17"): { src: string; width: number; height: number } {
  const width = Math.round(name.length * (mark === "mono" ? 13 : 14) + 16);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='40' viewBox='0 0 ${width} 40'><text x='8' y='28' fill='${fill}' ${FONTS[mark]}>${xml(name)}</text></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width, height: 40 };
}

const BRANDS: [string, Mark][] = [
  ["Kıyı Meyhane", "serif"],
  ["HAMAM MODA", "condensed"],
  ["ledgerly", "sans"],
  ["Lena Clinic", "italic"],
  ["PERA/BAKERY", "mono"],
  ["Studio Arda", "serif"],
  ["NOVA DENTAL", "condensed"],
  ["fırın&co", "sans"],
  ["Aster Hotels", "italic"],
  ["ODA·22", "mono"],
];

/** Ten fictional client logos with light and dark artwork. */
export const clientLogos = BRANDS.map(([name, mark]) => ({ name: name.replace(/[/·&]/g, " ").replace(/\s+/g, " ").trim(), image: wordmark(name, mark), imageDark: wordmark(name, mark, "#eceee6") }));
