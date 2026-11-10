// Consent state — a first-party cookie, a DOM event and Google Consent Mode v2. React-free and
// server-safe: every DOM access is guarded, `parseConsent` also runs on the server (cookie header).
//
// Cookie: vb_consent={"v":3,"t":1762761600,"c":{"functional":1,"analytics":0,"marketing":0}} (6 months)

export type ConsentCategory = "necessary" | "functional" | "analytics" | "marketing";
export type OptionalCategory = Exclude<ConsentCategory, "necessary">;

export const CONSENT_CATEGORIES: readonly ConsentCategory[] = ["necessary", "functional", "analytics", "marketing"];
export const CONSENT_COOKIE = "vb_consent";
/** Fired on `window` after every choice: `detail` is the record. */
export const CONSENT_EVENT = "vb:consent";
/** Fire on `window` to open the preferences dialog (Footer "Cookie settings"). */
export const CONSENT_OPEN_EVENT = "vb:consent-open";
const SIX_MONTHS = 182;

export interface ConsentRecord {
  /** Banner version the visitor answered; a newer version asks again. */
  v: number;
  /** Unix seconds of the choice. */
  t: number;
  c: Record<OptionalCategory, 0 | 1>;
}

export type ConsentChoices = Partial<Record<OptionalCategory, boolean>>;

/** Reads the record from a cookie string (`document.cookie` or a request's Cookie header). */
export function parseConsent(cookie: string | undefined | null, name = CONSENT_COOKIE): ConsentRecord | null {
  if (!cookie) return null;
  const hit = cookie.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  if (!hit) return null;
  try {
    const raw = JSON.parse(decodeURIComponent(hit.slice(name.length + 1))) as Partial<ConsentRecord>;
    if (typeof raw.v !== "number" || !raw.c || typeof raw.c !== "object") return null;
    const c = raw.c as Record<string, unknown>;
    return { v: raw.v, t: Number(raw.t) || 0, c: { functional: c.functional ? 1 : 0, analytics: c.analytics ? 1 : 0, marketing: c.marketing ? 1 : 0 } };
  } catch {
    return null;
  }
}

/** The record as a cookie value. */
export const serializeConsent = (r: ConsentRecord) => encodeURIComponent(JSON.stringify(r));

/** The visitor's current record, or null (never answered, or answered an older `version`). */
export function readConsent(version?: number): ConsentRecord | null {
  if (typeof document === "undefined") return null;
  const r = parseConsent(document.cookie);
  if (!r) return null;
  if (version !== undefined && r.v < version) return null;
  return r;
}

/** True when `category` may be used now. `necessary` is always true. */
export function getConsent(category: ConsentCategory, version?: number): boolean {
  if (category === "necessary") return true;
  return readConsent(version)?.c[category] === 1;
}

/** Google Consent Mode v2 signals for a set of choices. */
export function consentModeSignals(c: ConsentChoices | ConsentRecord["c"]): Record<string, "granted" | "denied"> {
  const on = (k: OptionalCategory) => (c[k] ? "granted" : "denied");
  return {
    ad_storage: on("marketing"),
    ad_user_data: on("marketing"),
    ad_personalization: on("marketing"),
    analytics_storage: on("analytics"),
    functionality_storage: on("functional"),
    personalization_storage: on("functional"),
    security_storage: "granted",
  };
}

/** Saves a choice: cookie, Consent Mode update, `vb:consent` event. Returns the record. */
export function writeConsent(choices: ConsentChoices, version = 1, opts: { days?: number; cookieName?: string } = {}): ConsentRecord {
  const record: ConsentRecord = {
    v: version,
    t: Math.floor(Date.now() / 1000),
    c: { functional: choices.functional ? 1 : 0, analytics: choices.analytics ? 1 : 0, marketing: choices.marketing ? 1 : 0 },
  };
  if (typeof document !== "undefined") {
    const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${opts.cookieName ?? CONSENT_COOKIE}=${serializeConsent(record)}; max-age=${(opts.days ?? SIX_MONTHS) * 86400}; path=/; samesite=lax${secure}`;
  }
  if (typeof window !== "undefined") {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void };
    w.gtag?.("consent", "update", consentModeSignals(record.c));
    window.dispatchEvent(new CustomEvent<ConsentRecord>(CONSENT_EVENT, { detail: record }));
  }
  return record;
}

/** Calls `fn` now (if already granted) and whenever `category` becomes granted. Returns an unsubscribe. */
export function onConsent(category: ConsentCategory, fn: (record: ConsentRecord | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  let fired = false;
  const check = (r: ConsentRecord | null) => {
    const granted = category === "necessary" || r?.c[category as OptionalCategory] === 1;
    if (granted && !fired) {
      fired = true;
      fn(r);
    }
  };
  check(readConsent());
  const handler = (e: Event) => check((e as CustomEvent<ConsentRecord>).detail ?? readConsent());
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/** Opens the preferences dialog of the mounted `ConsentBanner`. */
export function openConsentPreferences() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

/**
 * Inline `<head>` snippet: Consent Mode v2 defaults (everything denied except security), then an
 * immediate update from a stored choice, before any Google tag loads.
 *
 * ```tsx
 * <head><script dangerouslySetInnerHTML={{ __html: consentDefaultsScript() }} /></head>
 * ```
 */
export function consentDefaultsScript(opts: { waitForUpdate?: number; version?: number; regionMode?: "opt-in" | "notice"; region?: string[] } = {}): string {
  const deny = opts.regionMode === "notice" ? "granted" : "denied";
  const defaults = {
    ad_storage: deny,
    ad_user_data: deny,
    ad_personalization: deny,
    analytics_storage: deny,
    functionality_storage: deny,
    personalization_storage: deny,
    security_storage: "granted",
    wait_for_update: opts.waitForUpdate ?? 500,
    ...(opts.region ? { region: opts.region } : null),
  };
  const v = opts.version ?? 1;
  return [
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}",
    `gtag('consent','default',${JSON.stringify(defaults)});`,
    "gtag('set','ads_data_redaction',true);",
    `try{var m=document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);if(m){var r=JSON.parse(decodeURIComponent(m[1]));if(r&&r.v>=${v}&&r.c){var g=function(k){return r.c[k]?'granted':'denied'};gtag('consent','update',{ad_storage:g('marketing'),ad_user_data:g('marketing'),ad_personalization:g('marketing'),analytics_storage:g('analytics'),functionality_storage:g('functional'),personalization_storage:g('functional')});}}}catch(e){}`,
  ].join("");
}
