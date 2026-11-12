import { LegalPage } from "./components/legal-page";
import { fillLegalDoc, legalPreset } from "./components/presets";
import type { LegalDoc, LegalKind, LegalLocale, LegalValues } from "./components/types";

export interface Legal01Props {
  /** Your own content. Wins over `preset`. */
  doc?: LegalDoc;
  /**
   * A ready template: privacy, kvkk, cookies, terms, accessibility, returns, distance-sales,
   * pre-information or legal-notice. Default "privacy".
   */
  preset?: LegalKind;
  /** Language of the preset and the page chrome. Default "en" ("tr" for kvkk). */
  locale?: LegalLocale;
  /** The "template text, review before publishing" notice. Default true. */
  notice?: boolean;
  /**
   * Business details that replace the matching [fill-in] fields (company name, legal name, address,
   * email, phone, website, MERSİS, tax office and number, KEP, ETBİS …). Unknown fields stay visible.
   */
  values?: LegalValues;
}

/**
 * Long-form legal page for a website footer link (/privacy, /kvkk, /cookies, /terms,
 * /accessibility, /returns, /mesafeli-satis-sozlesmesi, /on-bilgilendirme-formu, /yasal-uyari): title and last-updated date, a review notice, table of contents and sections,
 * driven by one typed content object. Presets are template text with [fill-in] fields in brackets;
 * the business or its lawyer must review them before the page is published. EN / TR.
 *
 * ```tsx
 * // app/kvkk/page.tsx
 * <Legal01 preset="kvkk" locale="tr" values={{ legalName: "Kıyı Seramik Ltd. Şti.", email: "merhaba@kiyiseramik.com.tr" }} />
 * ```
 */
export default function Legal01({ doc, preset = "privacy", locale, notice = true, values }: Legal01Props = {}) {
  const lang = locale ?? (preset === "kvkk" && !doc ? "tr" : "en");
  const base = doc ?? legalPreset(preset, lang);
  return <LegalPage doc={values ? fillLegalDoc(base, values) : base} locale={lang} notice={notice} />;
}
