import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_COOKIE, consentDefaultsScript, consentModeSignals, getConsent, onConsent, parseConsent, readConsent, writeConsent } from "./consent";
import { isSpam, validateContactForm } from "./site-form";
import { waLink } from "./brand-icons";

const clearCookie = () => {
  document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=/`;
};

describe("consent", () => {
  afterEach(clearCookie);

  it("writes a first-party cookie, fires an event and updates Consent Mode", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    const seen = vi.fn();
    window.addEventListener("vb:consent", seen);
    writeConsent({ analytics: true }, 3);
    expect(readConsent(3)?.c).toEqual({ functional: 0, analytics: 1, marketing: 0 });
    expect(getConsent("analytics", 3)).toBe(true);
    expect(getConsent("marketing", 3)).toBe(false);
    expect(getConsent("necessary")).toBe(true);
    expect(seen).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("consent", "update", expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied", security_storage: "granted" }));
    // A newer banner version asks again.
    expect(readConsent(4)).toBeNull();
    window.removeEventListener("vb:consent", seen);
  });

  it("parses the server's Cookie header and rejects junk", () => {
    const value = encodeURIComponent(JSON.stringify({ v: 2, t: 1, c: { functional: 1, analytics: 0, marketing: 1 } }));
    expect(parseConsent(`theme=dark; vb_consent=${value}`)?.c).toEqual({ functional: 1, analytics: 0, marketing: 1 });
    expect(parseConsent("vb_consent=%7Bbroken")).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
  });

  it("onConsent runs once when a category becomes granted", () => {
    const fn = vi.fn();
    const off = onConsent("functional", fn);
    expect(fn).not.toHaveBeenCalled();
    writeConsent({ functional: true });
    writeConsent({ functional: true, analytics: true });
    expect(fn).toHaveBeenCalledOnce();
    off();
  });

  it("emits Consent Mode v2 defaults (denied) and maps categories", () => {
    const js = consentDefaultsScript({ version: 2 });
    expect(js).toContain(`gtag('consent','default'`);
    expect(js).toContain(`"ad_user_data":"denied"`);
    expect(js).toContain("r.v>=2");
    expect(consentModeSignals({ marketing: true })).toMatchObject({ ad_storage: "granted", ad_personalization: "granted", analytics_storage: "denied" });
  });
});

describe("contact form contract", () => {
  const fields = [{ name: "name" as const, required: true }, { name: "email" as const, required: true }, { name: "budget" as const, options: ["Under $5k", "$5k–15k"] }, { name: "message" as const, required: true }];
  const fd = (o: Record<string, string>) => {
    const d = new FormData();
    for (const [k, v] of Object.entries(o)) d.set(k, v);
    return d;
  };

  it("validates required, email format, options and privacy", () => {
    const v = validateContactForm(fields, fd({ name: "", email: "not-an-email", budget: "$1M", message: "Hi" }), { privacyCheckbox: true });
    expect(v.ok).toBe(false);
    expect(Object.keys(v.errors)).toEqual(["name", "email", "budget", "privacy"]);
    expect(v.errors.name).toBe("Please fill in full name.");
    expect(v.state).toMatchObject({ status: "invalid", values: { email: "not-an-email" } });
    const ok = validateContactForm(fields, fd({ name: "Ayşe Demir", email: "ayse@kidwell.com.tr", message: "A new site for two clinics.", privacy: "on" }), { privacyCheckbox: true });
    expect(ok.ok).toBe(true);
    expect(ok.privacy).toBe(true);
    expect(ok.marketing).toBe(false);
  });

  it("flags honeypot hits and instant submits as spam", () => {
    expect(isSpam(fd({ website: "http://spam.example" }))).toBe(true);
    expect(isSpam(fd({ _ts: String(Date.now() - 500) }))).toBe(true);
    expect(isSpam(fd({ _ts: String(Date.now() - 10_000) }))).toBe(false);
    expect(validateContactForm(fields, fd({ website: "x" })).spam).toBe(true);
  });

  it("builds wa.me links from E.164 numbers", () => {
    expect(waLink("+90 216 000 00 00", "Hi, a table for 4 at 20:00?")).toBe("https://wa.me/902160000000?text=Hi%2C%20a%20table%20for%204%20at%2020%3A00%3F");
  });
});
