import { LegalPage } from "./components/legal-page";
import { legalPreset } from "./components/presets";
import type { LegalDoc, LegalKind, LegalLocale } from "./components/types";

export interface Legal01Props {
  /** Your own content. Wins over `preset`. */
  doc?: LegalDoc;
  /** A ready template: privacy, kvkk, cookies, terms or accessibility. Default "privacy". */
  preset?: LegalKind;
  /** Language of the preset and the page chrome. Default "en" ("tr" for kvkk). */
  locale?: LegalLocale;
  /** The "template text, review before publishing" notice. Default true. */
  notice?: boolean;
}

/**
 * Long-form legal page for a website footer link (/privacy, /kvkk, /cookies, /terms,
 * /accessibility): title and last-updated date, a review notice, table of contents and sections,
 * driven by one typed content object. Presets are template text with [fill-in] fields in brackets;
 * the business or its lawyer must review them before the page is published. EN / TR.
 *
 * ```tsx
 * // app/kvkk/page.tsx
 * <Legal01 preset="kvkk" locale="tr" />
 * ```
 */
export default function Legal01({ doc, preset = "privacy", locale, notice = true }: Legal01Props = {}) {
  const lang = locale ?? (preset === "kvkk" && !doc ? "tr" : "en");
  return <LegalPage doc={doc ?? legalPreset(preset, lang)} locale={lang} notice={notice} />;
}
