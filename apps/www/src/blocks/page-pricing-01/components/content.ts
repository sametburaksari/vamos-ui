// Pricing-page content for "Relay", a fictional shared booking inbox. Human-readable fields are
// `Localized` ({ en, tr }) and resolved with `pickLocale`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized, type LogoItem } from "@vamos-ui/react/blocks";
import type { SiteLocale } from "./locale-switch";

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h });

export const frontDesk = { ...unsplash("1556745757-8d76bdb6984b", 1600, 1067), alt: { en: "A tablet on the front counter where staff answer booking messages", tr: "Personelin rezervasyon mesajlarını yanıtladığı ön tezgâhtaki tablet" } };

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  /** An image whose `alt` is localized → the plain image data blocks take. */
  const img = <I extends { alt: Localized<string> }>(image: I) => ({ ...image, alt: t(image.alt) });
  return {
    t,
    img,
    intl: locale === "tr" ? "tr-TR" : "en-US",
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

/** A wordmark SVG for a fictional customer (data URL): ink on light, paper on dark. */
function wordmark(name: string, font: string, fill: string) {
  const width = Math.round(name.length * 14 + 16);
  const esc = name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='40' viewBox='0 0 ${width} 40'><text x='8' y='28' fill='${fill}' ${font}>${esc}</text></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width, height: 40 };
}

const FONTS = {
  serif: "font-family='Georgia, serif' font-size='26' letter-spacing='-0.5'",
  sans: "font-family='Helvetica, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='-0.8'",
  mono: "font-family='Menlo, monospace' font-size='18' font-weight='600' letter-spacing='1'",
  condensed: "font-family='Arial Narrow, Arial, sans-serif' font-size='22' font-weight='700' letter-spacing='2'",
  italic: "font-family='Georgia, serif' font-size='26' font-style='italic'",
};

const BRANDS: [string, keyof typeof FONTS][] = [
  ["Kıyı Meyhane", "serif"],
  ["HAMAM MODA", "condensed"],
  ["Lena Clinic", "italic"],
  ["PERA/BAKERY", "mono"],
  ["NOVA DENTAL", "condensed"],
  ["fırın&co", "sans"],
  ["Aster Hotels", "italic"],
  ["ODA·22", "mono"],
];

export const customerLogos: LogoItem[] = BRANDS.map(([name, font]) => ({
  name: name.replace(/[/·&]/g, " ").replace(/\s+/g, " ").trim(),
  image: wordmark(name, FONTS[font], "#1b1d17"),
  imageDark: wordmark(name, FONTS[font], "#eceee6"),
}));

export const USD = (amount: string) => ({ amount, currency: "USD" });
