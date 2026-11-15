import fs from "node:fs";
import path from "node:path";
import trData from "../tr/address-tr.json";
import { bundledSubdivisions, loadSubdivisionFile, SUBDIVISION_COUNTRIES } from "./subdivisions-bundled";
import { findSubdivision, loadSubdivisions, parseSubdivisions, subdivisionsFromUrl, type SubdivisionFile } from "./subdivisions";

const dir = path.join(__dirname, "subdivisions");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
const read = (cc: string) => JSON.parse(fs.readFileSync(path.join(dir, `${cc}.json`), "utf8")) as SubdivisionFile;

describe("subdivision files", () => {
  it("one file per country, all of them in the lazy map", () => {
    expect(files.length).toBeGreaterThanOrEqual(200);
    expect([...SUBDIVISION_COUNTRIES].sort()).toEqual(files.map((f) => f.replace(".json", "")).sort());
  });

  it("every file is stamped and well formed", () => {
    for (const f of files) {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as SubdivisionFile;
      expect(d.country, f).toBe(f.replace(".json", ""));
      expect(d.source, f).toBeTruthy();
      expect(d.license, f).toMatch(/CC BY 4\.0|Unicode License|Official/);
      expect(d.generated, f).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.rows.length, f).toBeGreaterThan(0);
      const values = new Set<string>();
      const isos = new Set<string>();
      for (const r of d.rows) {
        expect(r, f).toHaveLength(4);
        expect(r[1], f).toBeTruthy();
        expect(r[0], f).toMatch(/^([A-Z0-9]{1,3})?$/);
        values.add(r[1]);
        if (r[0]) isos.add(r[0]);
      }
      expect(values.size, `${f}: unique values`).toBe(d.rows.length);
    }
  });

  it("TR matches the official province list", () => {
    const tr = read("TR");
    expect(tr.rows.map((r) => r[1])).toEqual((trData as unknown as { provinces: [number, string][] }).provinces.map((p) => p[1]));
    expect(tr.rows.map((r) => r[0])).toEqual((trData as unknown as { provinces: [number, string][] }).provinces.map((p) => String(p[0]).padStart(2, "0")));
  });

  it("is under 10 kB per country", () => {
    for (const f of files) expect(fs.statSync(path.join(dir, f)).size, f).toBeLessThan(10_240);
  });
});

describe("parseSubdivisions", () => {
  it("US: names to show, codes to store", () => {
    const us = parseSubdivisions(read("US"), "en-US");
    const ca = us.find((s) => s.code === "US-CA")!;
    expect(ca).toMatchObject({ value: "CA", label: "California" });
    expect(us.length).toBeGreaterThanOrEqual(50);
  });

  it("JP: local names in Japanese, Latin names and values elsewhere", () => {
    const ja = parseSubdivisions(read("JP"), "ja");
    expect(ja[0]).toMatchObject({ code: "JP-01", value: "北海道", label: "北海道" });
    const en = parseSubdivisions(read("JP"), "en");
    expect(en.find((s) => s.code === "JP-13")).toMatchObject({ value: "Tokyo", label: "Tokyo", localName: "東京都" });
    expect(en[0]!.label).toBe("Aichi");
  });

  it("DE / AE / BR / IT", () => {
    expect(parseSubdivisions(read("DE"), "en").find((s) => s.code === "DE-BY")).toMatchObject({ value: "Bayern", label: "Bavaria" });
    expect(parseSubdivisions(read("DE"), "de").find((s) => s.code === "DE-BY")).toMatchObject({ value: "Bayern", label: "Bayern" });
    expect(parseSubdivisions(read("AE"), "en").find((s) => s.code === "AE-DU")).toMatchObject({ value: "Dubai", label: "Dubai" });
    expect(parseSubdivisions(read("BR"), "pt-BR").find((s) => s.code === "BR-SP")).toMatchObject({ value: "SP", label: "São Paulo" });
    expect(parseSubdivisions(read("IT"), "it").find((s) => s.code === "IT-MI")).toMatchObject({ value: "MI", label: "Milano" });
  });

  it("finds stored values by any name or code", () => {
    const us = parseSubdivisions(read("US"));
    expect(findSubdivision(us, "california")?.value).toBe("CA");
    expect(findSubdivision(us, "US-TX")?.value).toBe("TX");
    expect(findSubdivision(us, "ny")?.value).toBe("NY");
    expect(findSubdivision(us, "Atlantis")).toBeUndefined();
  });
});

describe("loaders", () => {
  it("bundled: lazy per country, null without a file", async () => {
    expect((await loadSubdivisionFile("us"))?.country).toBe("US");
    expect(await loadSubdivisionFile("AQ")).toBeNull();
    const [a, b] = await Promise.all([bundledSubdivisions("JP"), bundledSubdivisions("jp")]);
    expect(a).toBe(b);
    expect((await loadSubdivisions(bundledSubdivisions, "AQ")).length).toBe(0);
  });

  it("from a URL: template, 404 = none, errors retried", async () => {
    let fail = true;
    const fetch = vi.fn(async (url: string) => {
      if (url.includes("/zz.json")) return { ok: false, status: 404, json: async () => null } as Response;
      if (fail) {
        fail = false;
        return { ok: false, status: 500, json: async () => null } as Response;
      }
      return { ok: true, status: 200, json: async () => read("DE") } as Response;
    });
    const load = subdivisionsFromUrl("/data/subdivisions/{cc_lower}.json", { fetch });
    expect(await load("ZZ")).toBeNull();
    await expect(load("DE")).rejects.toThrow("500");
    expect((await load("DE"))?.country).toBe("DE");
    expect(fetch).toHaveBeenCalledWith("/data/subdivisions/de.json", undefined);
  });
});
