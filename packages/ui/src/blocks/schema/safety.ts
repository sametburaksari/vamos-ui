// Pure guards shared by the schema (layer 2) and the components (layer 1). No zod, no React.

const BLOCKED_SCHEMES = /^(javascript|data|vbscript|file|blob):/i;
const ALLOWED_SCHEMES = /^(https?|mailto|tel|sms):/i;

/**
 * Returns a safe href or `null`. Allows relative paths, `#anchors`, `?query`, `//host`, http(s),
 * mailto, tel and sms. Rejects `javascript:`, `data:`, `vbscript:` and any other scheme —
 * also when hidden behind whitespace, control characters or entity-like tricks.
 *
 * ```ts
 * sanitizeHref("/menu");              // "/menu"
 * sanitizeHref(" javascript:alert(1)") // null
 * ```
 */
export function sanitizeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  // Browsers strip tabs/newlines/control chars inside the scheme ("java\tscript:").
  const probe = trimmed.replace(/[\u0000- \u007f-\u009f]/g, "");
  if (BLOCKED_SCHEMES.test(probe)) return null;
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(probe);
  if (scheme && !ALLOWED_SCHEMES.test(probe)) return null;
  return trimmed;
}

/** `true` for absolute URLs on another origin (`https://…`, `//host`). mailto/tel are not "external". */
export function isExternalUrl(href: string): boolean {
  return /^(https?:)?\/\//i.test(href);
}

/** Link kinds a `LinkRef` can declare (for editors and analytics). */
export type LinkKind = "url" | "anchor" | "tel" | "mailto" | "whatsapp" | "file";

/** Infers the kind of a link from its href. */
export function linkKindOf(href: string): LinkKind {
  if (href.startsWith("#")) return "anchor";
  if (/^tel:/i.test(href)) return "tel";
  if (/^mailto:/i.test(href)) return "mailto";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) return "whatsapp";
  if (/\.(pdf|docx?|xlsx?|pptx?|zip|csv)(\?|#|$)/i.test(href)) return "file";
  return "url";
}

/** Emoji (pictographs), excluding ©, ® and ™ which legitimately appear in footers. */
export const EMOJI_RE = /(?![©®™])\p{Extended_Pictographic}/u;

export const hasEmoji = (s: string): boolean => EMOJI_RE.test(s);
