import fs from "node:fs";
import path from "node:path";
import { createTrNeighbourhoodLoader, parseTrNeighbourhoods, trNeighbourhoodLabel, trNeighbourhoodsFromUrl, withNeighbourhoods, type TrNeighbourhoodFile } from "./neighbourhoods";
import { loadTrNeighbourhoodFile, trAddressWithNeighbourhoods, trNeighbourhoods } from "./neighbourhoods-bundled";
import { trAddress } from "./address";
import addressData from "./address-tr.json";

const fixture: TrNeighbourhoodFile = {
  source: "test fixture",
  license: "MIT",
  generated: "2026-11-15",
  plate: 99,
  districts: {
    "1": [
      ["Zafer", "99100"],
      ["Çamlık", "99110", 1],
      ["Cami", "", 0, "Yeşilova"],
      ["Cami", "99120"],
      ["Cami", "99130", 0, "Yeşilova"],
    ],
  },
};

describe("parseTrNeighbourhoods", () => {
  it("labels, sorts in Turkish order and keeps labels unique", () => {
    const list = parseTrNeighbourhoods(fixture.districts["1"]!);
    expect(list.map((n) => n.label)).toEqual(["Cami Mah.", "Cami Mah. (Yeşilova)", "Cami Mah. (Yeşilova) 2", "Çamlık Köyü", "Zafer Mah."]);
    expect(list[3]).toEqual({ name: "Çamlık", label: "Çamlık Köyü", kind: "village", postalCode: "99110" });
    expect(list[1]!.postalCode).toBeUndefined();
    expect(trNeighbourhoodLabel({ name: "Moda", kind: "neighbourhood" })).toBe("Moda Mah.");
  });
});

describe("createTrNeighbourhoodLoader", () => {
  it("loads each province once, also for concurrent calls, and retries after a failure", async () => {
    let calls = 0;
    let fail = true;
    const load = createTrNeighbourhoodLoader(async () => {
      calls++;
      if (fail) {
        fail = false;
        throw new Error("offline");
      }
      return fixture;
    });
    await expect(load(99, 1)).rejects.toThrow("offline");
    const [a, b] = await Promise.all([load(99, 1), load(99, 1)]);
    expect(a).toHaveLength(5);
    expect(b).toEqual(a);
    expect(await load(99, 2)).toEqual([]);
    expect(calls).toBe(2);
  });

  it("fetches from an app URL template", async () => {
    const urls: string[] = [];
    const fetch = async (url: string) => {
      urls.push(url);
      return new Response(JSON.stringify(fixture), { status: 200 });
    };
    const load = trNeighbourhoodsFromUrl("/data/mahalle/{plate2}.json?p={plate}", { fetch });
    expect((await load(7, 1)).length).toBe(5);
    expect(urls).toEqual(["/data/mahalle/07.json?p=7"]);
    const missing = trNeighbourhoodsFromUrl((p) => `/x/${p}`, { fetch: async () => new Response("", { status: 404 }) });
    await expect(missing(1, 1)).rejects.toThrow("404");
  });

  it("adds the level to a source without touching provinces / districts", () => {
    const s = withNeighbourhoods(trAddress, async () => []);
    expect(s.provinces).toBe(trAddress.provinces);
    expect(typeof s.neighbourhoods).toBe("function");
    expect(trAddress.neighbourhoods).toBeUndefined();
  });
});

describe("bundled province files", () => {
  const dir = path.join(__dirname, "neighbourhoods");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

  it("has 81 files whose districts are exactly the districts of address-tr.json", () => {
    expect(files).toHaveLength(81);
    let total = 0;
    for (const [plate, , districts] of addressData.provinces as [number, string, [number, string][]][]) {
      const file = JSON.parse(fs.readFileSync(path.join(dir, `${String(plate).padStart(2, "0")}.json`), "utf8")) as TrNeighbourhoodFile;
      expect(file.plate).toBe(plate);
      expect(file.license).toMatch(/^MIT License/);
      expect(file.source).toMatch(/TÜİK/);
      expect(Object.keys(file.districts).map(Number).sort((a, b) => a - b)).toEqual(districts.map(([c]) => c).sort((a, b) => a - b));
      for (const rows of Object.values(file.districts)) {
        total += rows.length;
        for (const [name, postal] of rows) {
          expect(name.trim()).toBe(name);
          expect(postal === "" || (/^\d{5}$/.test(postal) && Number(postal.slice(0, 2)) === plate)).toBe(true);
        }
      }
    }
    // TÜİK: 32 279 neighbourhoods + 18 183 villages.
    expect(total).toBe(50462);
  });

  it("loads a province lazily and resolves real neighbourhoods", async () => {
    const file = await loadTrNeighbourhoodFile(34);
    expect(file.plate).toBe(34);
    const districts = await trAddress.districts(34);
    const kadikoy = districts.find((d) => d.name === "Kadıköy")!;
    const list = await trNeighbourhoods(34, kadikoy.code);
    expect(list.find((n) => n.label === "Caferağa Mah.")).toMatchObject({ kind: "neighbourhood", postalCode: "34710" });
    expect(await trAddressWithNeighbourhoods.neighbourhoods!(34, kadikoy.code)).toEqual(list);
    await expect(loadTrNeighbourhoodFile(82)).rejects.toThrow(RangeError);
  });
});
