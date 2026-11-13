import { writeConsent } from "./consent";

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: unknown };

async function fresh() {
  vi.resetModules();
  return import("./analytics");
}

function reset() {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  document.cookie = "vb_consent=; max-age=0; path=/";
  const w = window as W;
  delete w.dataLayer;
  delete w.gtag;
  delete w.fbq;
  delete (w as { _fbq?: unknown })._fbq;
}

const calls = () => ((window as W).dataLayer ?? []).map((x) => (x && typeof x === "object" && "length" in (x as object) ? Array.from(x as ArrayLike<unknown>) : x));

describe("analytics", () => {
  beforeEach(reset);

  it("checkAnalyticsConfig drops malformed ids and conversion targets", async () => {
    const { checkAnalyticsConfig } = await fresh();
    const { config, problems } = checkAnalyticsConfig({ ga4: "G-ABC123", googleAds: "AW-12", metaPixel: "1234567890", conversions: { lead: "AW-123456789/AbCdEf", call: "label" } });
    expect(config).toMatchObject({ ga4: "G-ABC123", metaPixel: "1234567890", conversions: { lead: "AW-123456789/AbCdEf" } });
    expect(config.googleAds).toBeUndefined();
    expect(problems).toHaveLength(2);
  });

  it("basic mode: nothing loads before consent; GA4 after analytics, Ads and Meta after marketing", async () => {
    const { startAnalytics } = await fresh();
    const stop = startAnalytics({ ga4: "G-ABC123", googleAds: "AW-123456789", metaPixel: "1234567890" });
    expect(document.querySelector("script")).toBeNull();

    writeConsent({ analytics: true });
    expect(document.getElementById("vb-gtag")?.getAttribute("src")).toContain("id=G-ABC123");
    expect(calls()).toContainEqual(["config", "G-ABC123"]);
    expect(calls()).not.toContainEqual(["config", "AW-123456789"]);
    expect(document.getElementById("vb-fbq")).toBeNull();

    writeConsent({ analytics: true, marketing: true });
    expect(calls()).toContainEqual(["config", "AW-123456789"]);
    expect(document.getElementById("vb-fbq")).not.toBeNull();
    expect(document.querySelectorAll("#vb-gtag")).toHaveLength(1);
    stop();
  });

  it("advanced mode loads the Google tag at once (Consent Mode decides), Meta still waits", async () => {
    const { startAnalytics } = await fresh();
    const stop = startAnalytics({ ga4: "G-ABC123", metaPixel: "1234567890", mode: "advanced" });
    expect(document.getElementById("vb-gtag")).not.toBeNull();
    expect(document.getElementById("vb-fbq")).toBeNull();
    stop();
  });

  it("clicks on tel:, WhatsApp and data-track elements become events; leads send the Ads conversion", async () => {
    const { startAnalytics, LEAD_EVENT } = await fresh();
    writeConsent({ analytics: true, marketing: true });
    const stop = startAnalytics({ ga4: "G-ABC123", googleAds: "AW-123456789", conversions: { lead: "AW-123456789/AbCdEf", call: "AW-123456789/CaLlXy" } });
    document.body.innerHTML = `<a href="tel:+902160000000"><span>Call</span></a><a href="https://wa.me/902160000000">WA</a><button data-track="directions:google">Map</button><a href="/about">About</a>`;
    document.querySelector("span")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    (document.querySelector('a[href^="https://wa.me"]') as HTMLElement).click();
    (document.querySelector("button") as HTMLElement).click();
    (document.querySelector('a[href="/about"]') as HTMLElement).click();
    window.dispatchEvent(new CustomEvent(LEAD_EVENT, { detail: { form: "contact" } }));

    const events = calls().filter((c) => Array.isArray(c) && c[0] === "event");
    expect(events.map((e) => (e as unknown[])[1])).toEqual(["click_call", "conversion", "click_whatsapp", "click_directions", "generate_lead", "conversion"]);
    expect(events[1]).toEqual(["event", "conversion", { send_to: "AW-123456789/CaLlXy" }]);
    expect(events[3]).toEqual(["event", "click_directions", expect.objectContaining({ detail: "google", send_to: "G-ABC123" })]);
    expect(calls()).toContainEqual(expect.objectContaining({ event: "vb_lead", form_id: "contact" }));
    stop();
  });

  it("without consent events only reach dataLayer, never gtag", async () => {
    const { startAnalytics, trackEvent } = await fresh();
    const stop = startAnalytics({ ga4: "G-ABC123" });
    trackEvent("call");
    expect(calls()).toEqual([{ event: "vb_call" }]);
    stop();
  });

  it("parseTrack maps the kit's data-track values", async () => {
    const { parseTrack } = await fresh();
    expect(parseTrack("call")).toEqual({ event: "call" });
    expect(parseTrack("social:instagram")).toEqual({ event: "social", detail: "instagram" });
    expect(parseTrack("pricing:1")).toBeNull();
  });
});
