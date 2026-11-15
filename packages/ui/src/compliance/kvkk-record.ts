/**
 * KVKK consent records: an append-only, verifiable record of what a person was shown and what they
 * agreed to when they submitted a form. Framework-agnostic and server-side: Web Crypto only (Node
 * 20+, edge runtimes, Deno, Bun), no React, no storage of its own — the app implements
 * `ConsentRecordStore` (a database table, a log file, an object store).
 *
 * What a record holds:
 * - the notice (aydınlatma metni) shown: id, version and the SHA-256 of its exact text, and whether
 *   the "I have read it" box was ticked;
 * - each consent (açık rıza) asked for: purpose id, granted or not, the SHA-256 of the statement
 *   next to the checkbox;
 * - when (UTC), which form and page, and the IP address / user agent only when the app passes them;
 * - the identifiers of the person the app chooses to keep (an e-mail, a customer id);
 * - `prevHash` + `hash`: each record hashes its own canonical JSON and the previous record's hash,
 *   so a deleted or edited record breaks the chain (`verifyConsentChain`).
 *
 * It does not decide whether consent was needed, what the notice must say, or how long to keep it.
 */

/** A notice shown to the person (KVKK art. 10 aydınlatma metni, a privacy notice). */
export interface ConsentNotice {
  /** Stable id, e.g. `"kvkk-aydinlatma"`. */
  id: string;
  /** The version the person saw, e.g. `"2026-11-01"`. */
  version: string;
  /** Exact text shown (hashed, never stored in the record). Pass `sha256` instead if you hash elsewhere. */
  text?: string;
  /** Hex SHA-256 of the text. Computed from `text` when absent. */
  sha256?: string;
  /** Where the full text lives. */
  url?: string;
  /** Language of the text ("tr-TR"). */
  locale?: string;
}

/** A purpose the person can agree to separately (açık rıza): marketing e-mail, transfer abroad… */
export interface ConsentPurpose {
  /** Stable id, e.g. `"marketing"`. */
  id: string;
  /** The exact statement next to the checkbox (hashed). Or pass `sha256`. */
  statement?: string;
  sha256?: string;
  /** Version of the statement wording. */
  version?: string;
}

export interface ConsentRecordInput {
  notice: ConsentNotice;
  /** The "I have read the notice" box. Omit when the form shows the notice without a box. */
  noticeAcknowledged?: boolean;
  /** Every consent the form asked for, granted or not (a refusal is recorded too). */
  consents?: { purpose: ConsentPurpose; granted: boolean }[];
  /** `"submission"` (default) or `"withdrawal"` (the person took a consent back). */
  event?: "submission" | "withdrawal";
  /** Identifiers of the person the app chooses to keep (keep it minimal: an e-mail or a customer id). */
  subject?: Record<string, string>;
  /** Which form and page. */
  form?: string;
  page?: string;
  /** Only recorded when passed. Take them from the request; the kit never reads headers itself. */
  ip?: string;
  userAgent?: string;
  /** Defaults to now and a random UUID. */
  now?: Date;
  id?: string;
}

export interface ConsentRecord {
  schema: "vamos-ui/consent-record@1";
  id: string;
  /** ISO 8601, UTC. */
  recordedAt: string;
  event: "submission" | "withdrawal";
  notice: { id: string; version: string; sha256: string; url?: string; locale?: string; acknowledged?: boolean };
  consents: { id: string; granted: boolean; sha256?: string; version?: string }[];
  subject?: Record<string, string>;
  context: { form?: string; page?: string; ip?: string; userAgent?: string };
  /** `hash` of the previous record in the store, when the store can tell (`last()`). */
  prevHash?: string;
  /** Hex SHA-256 of the canonical JSON of every other field. */
  hash: string;
}

/** Where records go. Implement `append`; add `last` to chain records (recommended). */
export interface ConsentRecordStore {
  append(record: ConsentRecord): Promise<void> | void;
  /** The most recently appended record (for `prevHash`). */
  last?(): Promise<ConsentRecord | null | undefined> | ConsentRecord | null | undefined;
}

const MAX = 512;
const clip = (v: string | undefined) => (v === undefined ? undefined : v.slice(0, MAX));

/** Hex SHA-256 of a UTF-8 string (Web Crypto). */
export async function sha256Hex(text: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("sha256Hex: Web Crypto is not available in this runtime");
  const buf = await subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** JSON with object keys sorted at every level and `undefined` dropped — stable input for hashing. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? "null" : canonicalJson(v))).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

async function hashOf(text: string | undefined, given: string | undefined, what: string): Promise<string> {
  if (given) {
    if (!/^[0-9a-f]{64}$/i.test(given)) throw new TypeError(`${what}: sha256 must be 64 hex characters`);
    return given.toLowerCase();
  }
  if (text === undefined) throw new TypeError(`${what}: pass the text shown or its sha256`);
  return sha256Hex(text);
}

const strip = <T extends Record<string, unknown>>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

/** Builds a record (not stored). `prevHash` chains it to an earlier record. */
export async function buildConsentRecord(input: ConsentRecordInput, prevHash?: string): Promise<ConsentRecord> {
  const { notice } = input;
  if (!notice?.id || !notice.version) throw new TypeError("buildConsentRecord: notice.id and notice.version are required");
  const consents = await Promise.all(
    (input.consents ?? []).map(async ({ purpose, granted }) => {
      if (!purpose?.id) throw new TypeError("buildConsentRecord: every consent needs a purpose id");
      const sha256 = purpose.statement !== undefined || purpose.sha256 ? await hashOf(purpose.statement, purpose.sha256, `consent ${purpose.id}`) : undefined;
      return strip({ id: purpose.id, granted: granted === true, sha256, version: purpose.version });
    }),
  );
  const ids = new Set<string>();
  for (const c of consents) {
    if (ids.has(c.id)) throw new TypeError(`buildConsentRecord: consent "${c.id}" listed twice`);
    ids.add(c.id);
  }
  const subject = input.subject && Object.keys(input.subject).length ? Object.fromEntries(Object.entries(input.subject).map(([k, v]) => [k, clip(String(v))!])) : undefined;
  const body: Omit<ConsentRecord, "hash"> = strip({
    schema: "vamos-ui/consent-record@1" as const,
    id: input.id ?? globalThis.crypto.randomUUID(),
    recordedAt: (input.now ?? new Date()).toISOString(),
    event: input.event ?? "submission",
    notice: strip({
      id: notice.id,
      version: notice.version,
      sha256: await hashOf(notice.text, notice.sha256, `notice ${notice.id}`),
      url: notice.url,
      locale: notice.locale,
      acknowledged: input.noticeAcknowledged,
    }),
    consents,
    subject,
    context: strip({ form: clip(input.form), page: clip(input.page), ip: clip(input.ip), userAgent: clip(input.userAgent) }),
    prevHash,
  });
  return { ...body, hash: await sha256Hex(canonicalJson(body)) };
}

/**
 * Builds a record, chains it to the store's last record (when the store has `last`) and appends it.
 *
 * ```ts
 * const record = await recordConsent(store, {
 *   notice: { id: "kvkk-aydinlatma", version: "2026-11-01", text: NOTICE_TEXT, url: "/kvkk" },
 *   noticeAcknowledged: v.privacy,
 *   consents: [{ purpose: { id: "marketing", statement: site2LabelsTr.marketingConsent }, granted: v.marketing }],
 *   subject: { email: v.values.email },
 *   form: "contact", ip: headers.get("x-forwarded-for") ?? undefined,
 * });
 * ```
 */
export async function recordConsent(store: ConsentRecordStore, input: ConsentRecordInput): Promise<ConsentRecord> {
  const last = store.last ? await store.last() : undefined;
  const record = await buildConsentRecord(input, last?.hash);
  await store.append(record);
  return record;
}

export type ConsentVerifyResult = { ok: true } | { ok: false; reason: "hash" | "notice" | "chain" | "schema"; index?: number };

/**
 * Recomputes a record's hash. With `notice`, also checks the record names that notice version and
 * its text hashes to the recorded value (proves which wording was shown).
 */
export async function verifyConsentRecord(record: ConsentRecord, opts: { notice?: ConsentNotice } = {}): Promise<ConsentVerifyResult> {
  if (record?.schema !== "vamos-ui/consent-record@1") return { ok: false, reason: "schema" };
  const { hash, ...body } = record;
  if ((await sha256Hex(canonicalJson(body))) !== hash) return { ok: false, reason: "hash" };
  if (opts.notice) {
    const expected = await hashOf(opts.notice.text, opts.notice.sha256, `notice ${opts.notice.id}`);
    if (opts.notice.id !== record.notice.id || opts.notice.version !== record.notice.version || expected !== record.notice.sha256) return { ok: false, reason: "notice" };
  }
  return { ok: true };
}

/** Verifies every record and that each `prevHash` is the previous record's `hash` (oldest first). */
export async function verifyConsentChain(records: readonly ConsentRecord[]): Promise<ConsentVerifyResult> {
  for (let i = 0; i < records.length; i++) {
    const r = records[i]!;
    const own = await verifyConsentRecord(r);
    if (!own.ok) return { ...own, index: i };
    if (i > 0 && r.prevHash !== records[i - 1]!.hash) return { ok: false, reason: "chain", index: i };
  }
  return { ok: true };
}

/**
 * The notice version a form posted (hidden `_notice` field), accepted only when it is one the app
 * knows; otherwise the current notice. The version the person actually saw can be older than the
 * current one when the notice changed while the page was open.
 */
export function resolveNotice(posted: string | undefined | null, notices: readonly ConsentNotice[]): ConsentNotice {
  if (!notices.length) throw new TypeError("resolveNotice: pass at least one notice (current first)");
  return (posted && notices.find((n) => n.version === posted)) || notices[0]!;
}

/** The parts of a `validateContactForm` result the record needs. */
export interface ContactConsentFields {
  privacy: boolean;
  marketing: boolean;
  values: Record<string, string>;
  noticeVersion?: string;
  formId?: string;
}

export interface ContactConsentOptions {
  /** Known notice versions, current first (see `resolveNotice`). */
  notices: readonly ConsentNotice[];
  /** The marketing statement exactly as the form showed it (e.g. `site2LabelsTr.marketingConsent`). Omit when the form has no marketing box. */
  marketing?: ConsentPurpose;
  /** Which submitted values identify the person. Default `["email"]`. Use `[]` for none. */
  subjectFields?: string[];
  form?: string;
  page?: string;
  ip?: string;
  userAgent?: string;
  now?: Date;
}

/**
 * Maps a validated contact form to a `ConsentRecordInput`.
 *
 * ```ts
 * const v = validateContactForm(fields, data, { privacyCheckbox: true });
 * if (v.ok && !v.spam) await recordConsent(store, contactConsentInput(v, { notices, marketing: { id: "marketing", statement: site2LabelsTr.marketingConsent } }));
 * ```
 */
export function contactConsentInput(v: ContactConsentFields, opts: ContactConsentOptions): ConsentRecordInput {
  const subject: Record<string, string> = {};
  for (const k of opts.subjectFields ?? ["email"]) if (v.values[k]) subject[k] = v.values[k]!;
  return {
    notice: resolveNotice(v.noticeVersion, opts.notices),
    noticeAcknowledged: v.privacy,
    consents: opts.marketing ? [{ purpose: opts.marketing, granted: v.marketing }] : [],
    subject,
    form: opts.form ?? v.formId,
    page: opts.page,
    ip: opts.ip,
    userAgent: opts.userAgent,
    now: opts.now,
  };
}

/** An in-memory store (tests, previews). Not for production: records vanish on restart. */
export function memoryConsentStore(): ConsentRecordStore & { records: ConsentRecord[] } {
  const records: ConsentRecord[] = [];
  return {
    records,
    append: (r) => {
      records.push(r);
    },
    last: () => records[records.length - 1] ?? null,
  };
}
