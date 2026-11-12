/** The legal pages a website footer usually links to. Each has a ready preset in ./presets. */
export type LegalKind = "privacy" | "kvkk" | "cookies" | "terms" | "accessibility";

export type LegalLocale = "en" | "tr";

/**
 * One block of a section body: a paragraph, a bullet list, or a small table (e.g. the cookie list).
 * Text in [square brackets] is a fill-in field and is highlighted until it is replaced.
 */
export type LegalBlock = string | { list: string[] } | { table: { caption: string; head: string[]; rows: string[][] } };

export interface LegalSection {
  /** URL anchor, also used by the table of contents (`#data-we-collect`). */
  id: string;
  title: string;
  body: LegalBlock[];
}

export interface LegalDoc {
  kind: LegalKind;
  title: string;
  /** One or two sentences under the title: what the page covers and who it is from. */
  summary?: string;
  /** `YYYY-MM-DD`; anything else (e.g. "[YYYY-MM-DD]") is shown as a fill-in. */
  updated: string;
  sections: LegalSection[];
}

/** Route each kind is usually published at; the footers of the site-* blocks link to these. */
export const legalRoutes: Record<LegalKind, string> = {
  privacy: "/privacy",
  kvkk: "/kvkk",
  cookies: "/cookies",
  terms: "/terms",
  accessibility: "/accessibility",
};

/** Common slugs (English and Turkish) → the preset that fits, with the language to start from. */
export const legalSlugs: Record<string, { kind: LegalKind; locale: LegalLocale }> = {
  privacy: { kind: "privacy", locale: "en" },
  "privacy-policy": { kind: "privacy", locale: "en" },
  gizlilik: { kind: "privacy", locale: "tr" },
  "gizlilik-politikasi": { kind: "privacy", locale: "tr" },
  kvkk: { kind: "kvkk", locale: "tr" },
  "kvkk-aydinlatma-metni": { kind: "kvkk", locale: "tr" },
  cookies: { kind: "cookies", locale: "en" },
  "cookie-policy": { kind: "cookies", locale: "en" },
  cerezler: { kind: "cookies", locale: "tr" },
  "cerez-politikasi": { kind: "cookies", locale: "tr" },
  terms: { kind: "terms", locale: "en" },
  "terms-of-use": { kind: "terms", locale: "en" },
  "kullanim-kosullari": { kind: "terms", locale: "tr" },
  accessibility: { kind: "accessibility", locale: "en" },
  erisilebilirlik: { kind: "accessibility", locale: "tr" },
};
