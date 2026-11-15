import fs from "node:fs";
import path from "node:path";
import { citiesFromUrl, DEFAULT_CITIES_URL, parseCities, sortCities, type CityFile } from "./cities";

// The generated files live with the docs site (they are published there, not in the package).
const dir = path.resolve(__dirname, "../../../../../apps/www/public/data/cities");
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^[A-Z]{2}\.json$/.test(f)) : [];
const read = (cc: string) => JSON.parse(fs.readFileSync(path.join(dir, `${cc}.json`), "utf8")) as CityFile;
const subdivisionCodes = (cc: string) => {
  const f = path.join(__dirname, "subdivisions", `${cc}.json`);
  return fs.existsSync(f) ? new Set((JSON.parse(fs.readFileSync(f, "utf8")) as { rows: string[][] }).rows.map((r) => r[0])) : new Set<string>();
};

describe.skipIf(!files.length)("city files", () => {
  it("cover every country with GeoNames attribution and valid rows", () => {
    expect(files.length).toBeGreaterThanOrEqual(240);
    for (const f of files) {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as CityFile;
      expect(d.country, f).toBe(f.slice(0, 2));
      expect(d.attribution, f).toBe("City data © GeoNames (https://www.geonames.org), CC BY 4.0");
      expect(d.license, f).toMatch(/CC BY 4\.0/);
      expect(d.generated, f).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const codes = subdivisionCodes(d.country);
      for (const c of d.subdivisions) expect(codes.has(c), `${f}: ${c}`).toBe(true);
      for (const [name, local, s] of d.rows) {
        expect(typeof name === "string" && name.length > 0, f).toBe(true);
        expect(typeof local, f).toBe("string");
        expect(s >= -1 && s < d.subdivisions.length, f).toBe(true);
      }
    }
  });

  it("TR places are matched to all 81 provinces", () => {
    expect(read("TR").subdivisions).toHaveLength(81);
  });

  it("stays small enough to fetch per country", () => {
    for (const f of files) expect(fs.statSync(path.join(dir, f)).size, f).toBeLessThan(200_000);
  });

  it("parses for a locale, filtered by subdivision", () => {
    const de = parseCities(read("DE"), "en");
    expect(de.slice(0, 3).map((c) => c.value)).toEqual(["Berlin", "Hamburg", "München"]);
    expect(de[2]).toMatchObject({ name: "Munich", subdivision: "DE-BY" });
    const by = parseCities(read("DE"), "en", { subdivision: "DE-BY" });
    expect(by.every((c) => c.subdivision === "DE-BY")).toBe(true);
    expect(by[0]!.value).toBe("München");
    const jpEn = parseCities(read("JP"), "en", { limit: 2 });
    const jpJa = parseCities(read("JP"), "ja", { limit: 2 });
    expect(jpEn[0]!.value).toBe("Tokyo");
    expect(jpJa[0]!.value).not.toBe("Tokyo");
    expect(parseCities(read("US"), "en", { subdivision: "CA" })[0]!.value).toBe("Los Angeles");
    expect(parseCities(read("TR"), "tr", { subdivision: "TR-34" })[0]!.value).toBe("İstanbul");
  });
});

describe("city loaders", () => {
  const fixture: CityFile = {
    source: "fixture",
    license: "CC BY 4.0",
    attribution: "City data © GeoNames (https://www.geonames.org), CC BY 4.0",
    generated: "2026-11-15",
    country: "DE",
    lang: "de",
    subdivisions: ["BE", "BY"],
    rows: [
      ["Berlin", "", 0],
      ["Munich", "München", 1],
      ["Nuremberg", "Nürnberg", 1],
      ["Somewhere", "", -1],
    ],
  };

  it("parses, filters, de-duplicates and sorts", () => {
    expect(parseCities(fixture).map((c) => c.value)).toEqual(["Berlin", "München", "Nürnberg", "Somewhere"]);
    expect(parseCities(fixture, "en", { subdivision: "BY" }).map((c) => c.value)).toEqual(["München", "Nürnberg"]);
    expect(parseCities(fixture, "en", { subdivision: "XX" })).toHaveLength(4);
    expect(sortCities(parseCities(fixture), "de").map((c) => c.value)[0]).toBe("Berlin");
  });

  it("fetches from the docs site by default, 404 = none, errors retried", async () => {
    let fail = true;
    const fetch = vi.fn(async (url: string) => {
      if (url.endsWith("/AQ.json")) return { ok: false, status: 404, json: async () => null } as Response;
      if (fail) {
        fail = false;
        return { ok: false, status: 503, json: async () => null } as Response;
      }
      return { ok: true, status: 200, json: async () => fixture } as Response;
    });
    const load = citiesFromUrl(undefined, { fetch });
    expect(await load("aq")).toBeNull();
    await expect(load("DE")).rejects.toThrow("503");
    expect(await load("de")).toBe(fixture);
    expect(await load("DE")).toBe(fixture);
    expect(fetch).toHaveBeenCalledWith(DEFAULT_CITIES_URL.replace("{cc}", "DE"), undefined);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
