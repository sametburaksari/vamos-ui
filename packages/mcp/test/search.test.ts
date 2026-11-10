import { describe, expect, it } from "vitest";
import { closestNames, expand, fold, rankItems } from "../src/search.js";
import type { RegistryIndexItem } from "../src/types.js";

const item = (name: string, extra: Partial<RegistryIndexItem> = {}): RegistryIndexItem => ({
  name,
  type: "component",
  title: name.replace(/-/g, " "),
  description: "",
  docs: `https://ui.vamos.ist/docs/components/${name}`,
  ...extra,
});

describe("fold", () => {
  it("folds Turkish letters and case", () => {
    expect(fold("GİRİŞ Şifre Iğdır Çöküş")).toBe("giris sifre igdir cokus");
    expect(fold("ışık")).toBe("isik");
  });
});

describe("expand", () => {
  it("adds English synonyms for Turkish words and drops stop words", () => {
    const groups = expand("giriş sayfası");
    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual(expect.arrayContaining(["giris", "login"]));
  });
  it("handles simple Turkish suffixes", () => {
    expect(expand("tablolar")[0]).toContain("table");
  });
});

describe("rankItems", () => {
  const items = [
    item("date-picker", { description: "Pick a single date" }),
    item("date-range-picker", { description: "Pick a start and end date" }),
    item("dialog", { description: "Modal window", tags: ["modal"] }),
    item("login-01", { type: "block", title: "Login", category: "Authentication" }),
    item("lib-date", { type: "lib", title: "Date helpers" }),
  ];

  it("puts the exact name first", () => {
    expect(rankItems("date range picker", items)[0]!.item.name).toBe("date-range-picker");
    expect(rankItems("dialog", items)[0]!.item.name).toBe("dialog");
  });

  it("matches word prefixes and tags", () => {
    expect(rankItems("modal", items)[0]!.item.name).toBe("dialog");
    expect(rankItems("dial", items)[0]!.item.name).toBe("dialog");
  });

  it("is Turkish-insensitive", () => {
    expect(rankItems("giriş", items)[0]!.item.name).toBe("login-01");
    expect(rankItems("GİRİŞ", items)[0]!.item.name).toBe("login-01");
  });

  it("ranks lib items below components", () => {
    const names = rankItems("date", items).map((hit) => hit.item.name);
    expect(names.indexOf("lib-date")).toBe(names.length - 1);
  });

  it("uses guidance text when details are loaded", () => {
    const details = [{ ...item("dialog"), dependencies: [], registryDependencies: [], files: [], guidance: { whenToUse: ["confirm a destructive step"], avoidWhen: [], related: [] } }];
    expect(rankItems("destructive", items, details)[0]!.item.name).toBe("dialog");
    expect(rankItems("destructive", items)).toHaveLength(0);
  });

  it("falls back to partial matches when not every word matches", () => {
    expect(rankItems("dialog zebra", items)[0]!.item.name).toBe("dialog");
  });

  it("suggests close names", () => {
    expect(closestNames("dailog", items)).toContain("dialog");
  });
});
