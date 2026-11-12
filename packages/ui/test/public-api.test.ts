// Guards the public API: every name importable from "@vamos-ui/react" and its subpaths today must
// stay importable from the same path (bundle-size work rewrites barrels and imports; this catches
// a dropped export). Snapshot: test/public-api.json. After adding/removing an export on purpose:
//   node scripts/public-api.mjs --write
import fs from "node:fs";
import path from "node:path";
import { entryPoints, publicApi, type PublicApi } from "../scripts/public-api.mjs";

const snapshot = JSON.parse(fs.readFileSync(path.join(__dirname, "public-api.json"), "utf8")) as PublicApi;

describe("public API", () => {
  const api = publicApi();

  it("has the same entry points", () => {
    expect(Object.keys(api).sort()).toEqual(Object.keys(snapshot).sort());
  });

  for (const key of Object.keys(snapshot)) {
    it(`${key}: same value and type exports`, () => {
      expect(api[key]).toEqual(snapshot[key]);
    });
  }

  // The checker says what TypeScript sees; this makes sure the runtime module has the values too.
  it.each(Object.entries(entryPoints()).filter(([k]) => k === "." || k === "./data-table"))("%s: runtime exports", async (key, file) => {
    const mod = (await import(/* @vite-ignore */ file)) as Record<string, unknown>;
    expect(Object.keys(mod).sort()).toEqual(snapshot[key]!.values);
  }, 60_000);
});
