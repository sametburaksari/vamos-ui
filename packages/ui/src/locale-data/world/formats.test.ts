import data from "./address-formats.json";
import {
  addressFormatFallback,
  checkPostalCode,
  createAddressFormat,
  loadAddressFormat,
  loadAddressFormats,
  parseAddressFormat,
  peekAddressFormat,
  validateAddress,
  type AddressFormatsFile,
} from "./formats";
import { formatAddress, isLatinText } from "./format-address";

const file = data as unknown as AddressFormatsFile;
const fmt = (cc: string) => createAddressFormat(cc, file.countries[cc] ?? {}, file.default);

describe("address-formats.json", () => {
  it("records source, licence and date", () => {
    expect(file.source).toMatch(/Google Address Data Service/);
    expect(file.license).toMatch(/CC BY 4\.0/);
    expect(file.generated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("covers every country, with postal patterns that accept their own examples", () => {
    expect(Object.keys(file.countries).length).toBeGreaterThanOrEqual(240);
    for (const cc of Object.keys(file.countries)) {
      const f = fmt(cc);
      expect(f.lines.length, cc).toBeGreaterThan(0);
      for (const ex of f.postalCode?.examples ?? []) expect(checkPostalCode(ex, f).status, `${cc} ${ex}`).toBe("ok");
    }
  });

  it("agrees with the built-in fallback formats", () => {
    for (const cc of ["TR", "US", "CA", "AU", "GB", "DE"]) {
      const a = fmt(cc);
      const b = addressFormatFallback(cc);
      expect(b.lines, cc).toEqual(a.lines);
      expect(b.fields, cc).toEqual(a.fields);
      expect(b.required, cc).toEqual(a.required);
      expect(b.kinds, cc).toEqual(a.kinds);
      // The fallback may leave out a long pattern (GB), never disagree with one.
      if (b.postalCode) expect(b.postalCode.pattern.source, cc).toBe(a.postalCode?.pattern.source);
    }
  });
});

describe("createAddressFormat", () => {
  it("knows what each country's address has and calls it", () => {
    const us = fmt("US");
    expect(us.fields).toEqual(["line1", "line2", "region2", "region1", "postalCode"]);
    expect(us.required).toEqual(["line1", "region2", "region1", "postalCode"]);
    expect(us.kinds).toMatchObject({ region1: "state", postalCode: "zip" });
    expect(fmt("DE").fields).toEqual(["line1", "line2", "postalCode", "region2"]);
    expect(fmt("JP").fields).toEqual(["postalCode", "region1", "line1", "line2"]);
    expect(fmt("JP").latinFields).toEqual(["line1", "line2", "region1", "postalCode"]);
    expect(fmt("JP").kinds.region1).toBe("prefecture");
    expect(fmt("AE").fields).toEqual(["line1", "line2", "region1"]);
    expect(fmt("AE").postalCode).toBeUndefined();
    expect(fmt("AE").kinds.region1).toBe("emirate");
    expect(fmt("IN").kinds.postalCode).toBe("pin");
    expect(fmt("IE").kinds.postalCode).toBe("eircode");
    expect(fmt("BR").kinds.region3).toBe("neighborhood");
    expect(fmt("GB").upper).toEqual(["region2", "postalCode"]);
    expect(fmt("US").postalCode?.numeric).toBe(true);
    expect(fmt("CA").postalCode?.numeric).toBe(false);
  });

  it("parses literals and drops parts the kit does not collect", () => {
    expect(parseAddressFormat("%N%n%O%n%A%n%C, %S %Z")).toEqual([[{ part: "street" }], [{ part: "region2" }, { text: ", " }, { part: "region1" }, { text: " " }, { part: "postalCode" }]]);
    expect(parseAddressFormat("〒%Z%n%S")).toEqual([[{ text: "〒" }, { part: "postalCode" }], [{ part: "region1" }]]);
  });
});

describe("formatAddress with the country data", () => {
  const f = (a: Parameters<typeof formatAddress>[0], o: Parameters<typeof formatAddress>[1] = {}) => formatAddress(a, { includeCountry: false, format: fmt(a.country), ...o });

  it("prints each country's order", () => {
    expect(f({ country: "US", line1: "548 Market St", line2: "Suite 12", region2: "San Francisco", region1: "CA", postalCode: "94104" })).toEqual(["548 Market St", "Suite 12", "San Francisco, CA 94104"]);
    expect(f({ country: "DE", line1: "Torstraße 109", region2: "Berlin", postalCode: "10119", region1: "Berlin" })).toEqual(["Torstraße 109", "10119 Berlin"]);
    expect(f({ country: "BR", line1: "Av. Paulista, 1000", region3: "Bela Vista", region2: "São Paulo", region1: "SP", postalCode: "01310-100" })).toEqual(["Av. Paulista, 1000", "Bela Vista", "São Paulo-SP", "01310-100"]);
    expect(f({ country: "AE", line1: "Office 1204, Example Tower", region1: "Dubai", postalCode: "00000" })).toEqual(["Office 1204, Example Tower", "Dubai"]);
    expect(f({ country: "CH", line1: "Bahnhofstrasse 1", region2: "Zürich", postalCode: "8001" })).toEqual(["Bahnhofstrasse 1", "CH-8001 Zürich"]);
    expect(f({ country: "CH", line1: "Bahnhofstrasse 1", region2: "Zürich", postalCode: "CH-8001" })).toEqual(["Bahnhofstrasse 1", "CH-8001 Zürich"]);
    expect(f({ country: "CH", line1: "Bahnhofstrasse 1", region2: "Zürich" })).toEqual(["Bahnhofstrasse 1", "Zürich"]);
    expect(f({ country: "TR", region3: "Caferağa Mah.", line1: "Moda Cad. No: 12", region2: "Kadıköy", region1: "İstanbul", postalCode: "34710" })).toEqual(["Caferağa Mah. Moda Cad. No: 12", "34710 Kadıköy/İstanbul"]);
    expect(f({ country: "TR", line1: "Moda Cad. No: 12", region1: "İstanbul", postalCode: "34710" })).toEqual(["Moda Cad. No: 12", "34710 İstanbul"]);
  });

  it("uses the local format for local script and the Latin one for Latin script", () => {
    expect(f({ country: "JP", postalCode: "154-0023", region1: "東京都", line1: "世田谷区若林1-2-3" })).toEqual(["〒154-0023", "東京都", "世田谷区若林1-2-3"]);
    expect(f({ country: "JP", postalCode: "154-0023", region1: "Tokyo", line1: "1-2-3 Wakabayashi, Setagaya-ku" })).toEqual(["1-2-3 Wakabayashi, Setagaya-ku, Tokyo", "154-0023"]);
    expect(f({ country: "JP", postalCode: "154-0023", region1: "Tokyo", line1: "1-2-3 Wakabayashi" }, { latin: false })[0]).toBe("〒154-0023");
    expect(isLatinText("Kadıköy")).toBe(true);
    expect(isLatinText("東京都")).toBe(false);
    expect(isLatinText("154-0023")).toBe(false);
  });

  it("upper-cases what the country writes in capitals in postal style", () => {
    expect(formatAddress({ country: "GB", line1: "10 Example Street", region2: "London", postalCode: "ec1y 8sy" }, { format: fmt("GB"), postal: true, locale: "en-GB" })).toEqual([
      "10 Example Street",
      "LONDON",
      "EC1Y 8SY",
      "UNITED KINGDOM",
    ]);
  });
});

describe("postal codes and validation", () => {
  it("normalises and checks postal codes", () => {
    expect(checkPostalCode(" ec1y  8sy ", fmt("GB"))).toEqual({ status: "ok", value: "EC1Y 8SY" });
    expect(checkPostalCode("ch-8001", fmt("CH"))).toEqual({ status: "ok", value: "8001" });
    expect(checkPostalCode("1234", fmt("DE")).status).toBe("format");
    expect(checkPostalCode("12345", fmt("AE")).status).toBe("none");
    expect(checkPostalCode(" ", fmt("DE")).status).toBe("empty");
    expect(checkPostalCode("110001", fmt("IN")).status).toBe("ok");
    expect(checkPostalCode("K1A 0B1", fmt("CA")).status).toBe("ok");
  });

  it("validates required parts and the postal code", () => {
    expect(validateAddress({ country: "US", line1: "548 Market St", region2: "San Francisco", postalCode: "9410" }, fmt("US"))).toEqual({ region1: "required", postalCode: "format" });
    expect(validateAddress({ country: "AE", line1: "Office 1204", region1: "Dubai" }, fmt("AE"))).toEqual({});
    expect(validateAddress({ country: "DE", line1: "Torstraße 109" }, fmt("DE"), { required: ["line1"] })).toEqual({});
  });
});

describe("loading", () => {
  it("loads lazily and caches", async () => {
    expect(peekAddressFormat("JP")?.kinds.region1 ?? "prefecture").toBe("prefecture");
    const [a, b] = await Promise.all([loadAddressFormats(), loadAddressFormats()]);
    expect(a).toBe(b);
    const jp = await loadAddressFormat("jp");
    expect(jp.country).toBe("JP");
    expect(peekAddressFormat("JP")).toBe(jp);
    expect((await loadAddressFormat("QQ")).fields).toEqual(fmt("QQ").fields);
  });
});
