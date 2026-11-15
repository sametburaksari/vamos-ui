import { createHash } from "node:crypto";
import {
  buildConsentRecord,
  canonicalJson,
  contactConsentInput,
  memoryConsentStore,
  recordConsent,
  resolveNotice,
  sha256Hex,
  verifyConsentChain,
  verifyConsentRecord,
  type ConsentNotice,
} from "./kvkk-record";
import { validateContactForm } from "../blocks/site/shared/site-form";

const NOTICE_V1: ConsentNotice = { id: "kvkk-aydinlatma", version: "2026-10-01", text: "Yelken Atölye aydınlatma metni, ilk sürüm.", url: "https://ornek.com.tr/kvkk", locale: "tr-TR" };
const NOTICE_V2: ConsentNotice = { ...NOTICE_V1, version: "2026-11-01", text: "Yelken Atölye aydınlatma metni, ikinci sürüm." };
const MARKETING = { id: "marketing", statement: "Ara sıra haber ve kampanya e-postası almak istiyorum.", version: "1" };
const NOW = new Date("2026-11-15T09:30:00.000Z");

describe("sha256Hex / canonicalJson", () => {
  it("matches node:crypto and the FIPS 180-2 'abc' vector", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await sha256Hex(NOTICE_V1.text!)).toBe(createHash("sha256").update(NOTICE_V1.text!, "utf8").digest("hex"));
  });

  it("sorts keys at every level and drops undefined", () => {
    expect(canonicalJson({ b: 1, a: { d: [1, { z: 1, y: undefined }], c: "ç" }, u: undefined })).toBe('{"a":{"c":"ç","d":[1,{"z":1}]},"b":1}');
  });
});

describe("buildConsentRecord", () => {
  it("records hashes of what was shown, every consent, and context only when passed", async () => {
    const r = await buildConsentRecord({
      notice: NOTICE_V1,
      noticeAcknowledged: true,
      consents: [{ purpose: MARKETING, granted: false }],
      subject: { email: "deniz@ornek.com.tr" },
      form: "contact",
      now: NOW,
      id: "rec-1",
    });
    expect(r).toEqual({
      schema: "vamos-ui/consent-record@1",
      id: "rec-1",
      recordedAt: "2026-11-15T09:30:00.000Z",
      event: "submission",
      notice: { id: "kvkk-aydinlatma", version: "2026-10-01", sha256: await sha256Hex(NOTICE_V1.text!), url: "https://ornek.com.tr/kvkk", locale: "tr-TR", acknowledged: true },
      consents: [{ id: "marketing", granted: false, sha256: await sha256Hex(MARKETING.statement), version: "1" }],
      subject: { email: "deniz@ornek.com.tr" },
      context: { form: "contact" },
      hash: expect.stringMatching(/^[0-9a-f]{64}$/),
    });
    // No IP / user agent unless the app passes them; the notice text itself is never stored.
    expect(JSON.stringify(r)).not.toContain("ip");
    expect(JSON.stringify(r)).not.toContain(NOTICE_V1.text);
    const { hash, ...body } = r;
    expect(hash).toBe(createHash("sha256").update(canonicalJson(body)).digest("hex"));

    const withCtx = await buildConsentRecord({ notice: NOTICE_V1, ip: "203.0.113.7", userAgent: "Mozilla/5.0", now: NOW, id: "rec-2" });
    expect(withCtx.context).toEqual({ ip: "203.0.113.7", userAgent: "Mozilla/5.0" });
  });

  it("accepts a precomputed hash, rejects bad input", async () => {
    const sha = await sha256Hex("x");
    const r = await buildConsentRecord({ notice: { id: "n", version: "1", sha256: sha.toUpperCase() }, now: NOW });
    expect(r.notice.sha256).toBe(sha);
    await expect(buildConsentRecord({ notice: { id: "n", version: "1" } })).rejects.toThrow("text shown or its sha256");
    await expect(buildConsentRecord({ notice: { id: "n", version: "1", sha256: "abc" } })).rejects.toThrow("64 hex");
    await expect(buildConsentRecord({ notice: { id: "", version: "1", text: "t" } })).rejects.toThrow("notice.id");
    await expect(
      buildConsentRecord({ notice: NOTICE_V1, consents: [{ purpose: MARKETING, granted: true }, { purpose: MARKETING, granted: false }] }),
    ).rejects.toThrow("twice");
  });
});

describe("recordConsent + verification", () => {
  it("chains records and detects edits, deletions and a different notice text", async () => {
    const store = memoryConsentStore();
    await recordConsent(store, { notice: NOTICE_V1, consents: [{ purpose: MARKETING, granted: true }], subject: { email: "deniz@ornek.com.tr" }, now: NOW });
    await recordConsent(store, { notice: NOTICE_V2, event: "withdrawal", consents: [{ purpose: MARKETING, granted: false }], subject: { email: "deniz@ornek.com.tr" }, now: NOW });
    await recordConsent(store, { notice: NOTICE_V2, now: NOW });
    const [a, b, c] = store.records;
    expect(a!.prevHash).toBeUndefined();
    expect(b!.prevHash).toBe(a!.hash);
    expect(b!.event).toBe("withdrawal");
    expect(await verifyConsentChain(store.records)).toEqual({ ok: true });

    expect(await verifyConsentRecord(a!, { notice: NOTICE_V1 })).toEqual({ ok: true });
    expect(await verifyConsentRecord(a!, { notice: { ...NOTICE_V1, text: NOTICE_V1.text + " " } })).toEqual({ ok: false, reason: "notice" });

    const edited = { ...b!, consents: [{ ...b!.consents[0]!, granted: true }] };
    expect(await verifyConsentRecord(edited)).toEqual({ ok: false, reason: "hash" });
    expect(await verifyConsentChain([a!, c!])).toEqual({ ok: false, reason: "chain", index: 1 });
    expect(await verifyConsentRecord({ ...a!, schema: "x" } as never)).toEqual({ ok: false, reason: "schema" });
  });

  it("works with a store that only appends (no chain)", async () => {
    const seen: unknown[] = [];
    const r = await recordConsent({ append: async (x) => void seen.push(x) }, { notice: NOTICE_V1, now: NOW });
    expect(seen).toEqual([r]);
    expect(r.prevHash).toBeUndefined();
  });
});

describe("contact form wiring", () => {
  const fields = [{ name: "name", required: true }, { name: "email", required: true }, { name: "message", required: true }] as const;
  const submit = (extra: Record<string, string>) => {
    const fd = new FormData();
    fd.set("name", "Deniz Kaya");
    fd.set("email", "deniz@ornek.com.tr");
    fd.set("message", "Merhaba");
    fd.set("_form", "contact-1");
    for (const [k, v] of Object.entries(extra)) fd.set(k, v);
    return validateContactForm([...fields], fd, { privacyCheckbox: true });
  };

  it("records the notice version the page posted, if the app knows it", async () => {
    const v = submit({ privacy: "on", marketing: "on", _notice: "2026-10-01" });
    expect(v.noticeVersion).toBe("2026-10-01");
    const input = contactConsentInput(v, { notices: [NOTICE_V2, NOTICE_V1], marketing: MARKETING, ip: "203.0.113.7", now: NOW });
    expect(input.notice).toBe(NOTICE_V1);
    expect(input.form).toBe("contact-1");
    expect(input.subject).toEqual({ email: "deniz@ornek.com.tr" });
    const r = await buildConsentRecord(input);
    expect(r.notice).toMatchObject({ version: "2026-10-01", acknowledged: true });
    expect(r.consents).toEqual([expect.objectContaining({ id: "marketing", granted: true })]);
    expect(r.context.ip).toBe("203.0.113.7");
  });

  it("falls back to the current notice and records a refused marketing consent", () => {
    const v = submit({ privacy: "on", _notice: "forged" });
    const input = contactConsentInput(v, { notices: [NOTICE_V2, NOTICE_V1], marketing: MARKETING, subjectFields: [] });
    expect(input.notice).toBe(NOTICE_V2);
    expect(input.consents).toEqual([{ purpose: MARKETING, granted: false }]);
    expect(input.subject).toEqual({});
    expect(resolveNotice(undefined, [NOTICE_V2])).toBe(NOTICE_V2);
    expect(() => resolveNotice("x", [])).toThrow();
  });
});
