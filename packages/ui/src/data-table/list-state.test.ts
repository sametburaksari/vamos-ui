import { applyFilters, describeFilters, matchClause, resolveRelativeDate, searchRows } from "./filter-fns";
import { decodeFilters, encodeFilters, mergeListStateIntoSearch, parseListState, serializeListState } from "./url-state";
import { applyViewState, toViewState, viewStateEqual } from "./view-state";
import { csvDelimiter, escapeCsvCell, toCsv } from "./csv";
import { createListState, defaultOps, fieldOps, isClauseComplete, selectionCount, type FilterFieldDef } from "./types";
import { createFormatter } from "../format/core";

const fields: FilterFieldDef[] = [
  { field: "name", label: "Name", type: "text" },
  { field: "stage", label: "Stage", type: "enum", options: [{ value: "lead", label: "Lead" }, { value: "proposal", label: "Proposal" }, { value: "won", label: "Won" }] },
  { field: "value", label: "Value", type: "currency" },
  { field: "closeDate", label: "Close date", type: "date" },
  { field: "owner", label: "Owner", type: "user" },
  { field: "active", label: "Active", type: "boolean" },
];

const deals = [
  { name: "Northwind renewal", stage: "won", value: "12500.00", closeDate: "2026-11-03", owner: { id: "u1", name: "Ada Park" }, active: true },
  { name: "İstanbul Kahve rollout", stage: "proposal", value: "4800", closeDate: "2026-11-10", owner: { id: "u2", name: "Selin Kaya" }, active: true },
  { name: "Globex pilot", stage: "lead", value: "900", closeDate: "2026-09-14", owner: { id: "u1", name: "Ada Park" }, active: false },
];

describe("types", () => {
  it("has operators per type and completeness rules", () => {
    expect(defaultOps("boolean")).toEqual(["eq"]);
    expect(fieldOps({ field: "x", label: "X", type: "enum", multiple: false })).toEqual(["eq", "neq", "isEmpty"]);
    expect(isClauseComplete({ id: "a", field: "x", op: "in", value: [] })).toBe(false);
    expect(isClauseComplete({ id: "a", field: "x", op: "between", value: [1, ""] })).toBe(false);
    expect(isClauseComplete({ id: "a", field: "x", op: "isEmpty" })).toBe(true);
    expect(selectionCount({ mode: "all", except: ["a"], filters: { logic: "and", clauses: [] }, q: "", total: 1248 })).toBe(1247);
  });
});

describe("filter-fns", () => {
  const ctx = { locale: "en-US", timeZone: "UTC", now: new Date("2026-11-10T12:00:00Z") };

  it("filters with and/or groups and skips incomplete clauses", () => {
    const g = { logic: "and" as const, clauses: [{ id: "a", field: "stage", op: "in" as const, value: ["proposal", "won"] }, { id: "b", field: "value", op: "gte" as const, value: "5000" }, { id: "c", field: "name", op: "contains" as const, value: "" }] };
    expect(applyFilters(deals, g, fields, ctx).map((d) => d.name)).toEqual(["Northwind renewal"]);
    expect(applyFilters(deals, { ...g, logic: "or" }, fields, ctx)).toHaveLength(2);
  });

  it("between is inclusive; dates compare by calendar day", () => {
    expect(matchClause("5000", { id: "a", field: "v", op: "between", value: [5000, 9000] }, "currency")).toBe(true);
    expect(matchClause("2026-11-10T23:30:00Z", { id: "a", field: "d", op: "on", value: "2026-11-11" }, "datetime", { timeZone: "Europe/Istanbul" })).toBe(true);
    expect(matchClause("2026-11-10T23:30:00Z", { id: "a", field: "d", op: "on", value: "2026-11-11" }, "datetime", { timeZone: "UTC" })).toBe(false);
  });

  it("resolves relative dates", () => {
    expect(resolveRelativeDate("last_7_days", ctx)).toEqual({ start: "2026-11-04", end: "2026-11-10" });
    expect(resolveRelativeDate("this_month", ctx)).toEqual({ start: "2026-11-01", end: "2026-11-30" });
    expect(resolveRelativeDate("last_month", ctx)).toEqual({ start: "2026-10-01", end: "2026-10-31" });
    expect(resolveRelativeDate({ last: 14, unit: "day" }, ctx)).toEqual({ start: "2026-10-28", end: "2026-11-10" });
    expect(applyFilters(deals, { logic: "and", clauses: [{ id: "r", field: "closeDate", op: "relative", value: "last_30_days" }] }, fields, ctx)).toHaveLength(2);
  });

  it("resolves $me for user fields", () => {
    const g = { logic: "and" as const, clauses: [{ id: "m", field: "owner", op: "in" as const, value: ["$me"] }] };
    expect(applyFilters(deals, g, fields, { ...ctx, me: "u2" }).map((d) => d.name)).toEqual(["İstanbul Kahve rollout"]);
  });

  it("searches with Turkish folding", () => {
    expect(searchRows(deals, "istanbul", (d) => d.name, "tr-TR")).toHaveLength(1);
    expect(searchRows(deals, "ISTANBUL kahve", (d) => d.name, "en-US")).toHaveLength(1);
  });

  it("describes a filter group", () => {
    const f = createFormatter("en-US");
    const text = describeFilters({ logic: "and", clauses: [{ id: "a", field: "stage", op: "in", value: ["proposal", "won"] }, { id: "b", field: "value", op: "gte", value: "5000" }] }, fields, f);
    expect(text).toBe("Stage is any of Proposal or Won and Value at least $5,000.00");
  });
});

describe("url-state", () => {
  it("round-trips list state", () => {
    const s = createListState({
      q: "jane & co",
      filters: { logic: "and", clauses: [{ id: "a", field: "stage", op: "in", value: ["proposal", "won"] }, { id: "b", field: "value", op: "gte", value: "5000" }, { id: "c", field: "closeDate", op: "relative", value: "last_30_days" }] },
      sort: [{ id: "closeDate", desc: true }, { id: "name", desc: false }],
      page: { index: 1, size: 50 },
      view: "v_8k2",
    });
    const qs = serializeListState(s);
    expect(qs).toBe("q=jane%20%26%20co&f=stage.in:proposal|won;value.gte:5000;closeDate.relative:last_30_days&sort=-closeDate,name&page=2&size=50&sv=v_8k2");
    const back = parseListState(qs, { fields });
    expect(back.q).toBe("jane & co");
    expect(back.filters.clauses.map((c) => ("op" in c ? [c.field, c.op, c.value] : null))).toEqual([
      ["stage", "in", ["proposal", "won"]],
      ["value", "gte", "5000"],
      ["closeDate", "relative", "last_30_days"],
    ]);
    expect(back.sort).toEqual(s.sort);
    expect(back.page).toEqual({ index: 1, size: 50 });
    expect(back.view).toBe("v_8k2");
  });

  it("drops unknown fields, bad operators and junk", () => {
    const g = decodeFilters("ghost.in:a;stage.gte:3;value.gte:abc;stage.in:won;name.isEmpty", fields);
    expect(g.clauses.map((c) => ("op" in c ? `${c.field}.${c.op}` : ""))).toEqual(["stage.in", "name.isEmpty"]);
    expect(parseListState("page=-4&size=99999").page).toEqual({ index: 0, size: 25 });
  });

  it("encodes separators inside values and keeps foreign params", () => {
    expect(encodeFilters({ logic: "and", clauses: [{ id: "a", field: "name", op: "contains", value: "a|b;c:d" }] })).toBe("name.contains:a%7Cb%3Bc%3Ad");
    expect(parseListState(new URLSearchParams("f=name.contains:a%7Cb"), { fields }).filters.clauses[0]).toMatchObject({ value: "a|b" });
    const merged = mergeListStateIntoSearch("?tab=deals&q=old&page=3", createListState({ q: "new" }));
    expect(merged).toBe("tab=deals&q=new");
  });

  it("omits defaults", () => {
    const d = { sort: [{ id: "closeDate", desc: true }] };
    expect(serializeListState(createListState(d), { defaults: d })).toBe("");
    expect(serializeListState(createListState({ sort: [] }), { defaults: d })).toBe("sort=none");
  });
});

describe("view-state", () => {
  it("compares order-insensitively and ignores clause ids", () => {
    const a = toViewState(createListState({ filters: { logic: "and", clauses: [{ id: "1", field: "stage", op: "in", value: ["won", "lead"] }, { id: "2", field: "active", op: "eq", value: true }] } }));
    const b = toViewState(createListState({ filters: { logic: "and", clauses: [{ id: "x", field: "active", op: "eq", value: true }, { id: "y", field: "stage", op: "in", value: ["lead", "won"] }] } }));
    expect(viewStateEqual(a, b)).toBe(true);
    expect(viewStateEqual(a, { ...b, sort: [{ id: "name", desc: false }] })).toBe(false);
    expect(viewStateEqual(a, { ...b, columns: { ...b.columns, visible: { name: true } } })).toBe(true);
  });

  it("applies a view and resets the page", () => {
    const cur = createListState({ page: { index: 4, size: 50 }, q: "x" });
    const next = applyViewState(cur, { filters: { logic: "and", clauses: [] }, sort: [{ id: "value", desc: true }], columns: cur.columns }, "v1");
    expect(next.page).toEqual({ index: 0, size: 50 });
    expect(next.q).toBe("");
    expect(next.view).toBe("v1");
  });
});

describe("csv", () => {
  it("adds a BOM, CRLF and the locale delimiter", () => {
    expect(csvDelimiter("en-US")).toBe(",");
    expect(csvDelimiter("tr-TR")).toBe(";");
    expect(toCsv([["Name", "Value"], ["Northwind", 4800.5]], { locale: "tr-TR" })).toBe("﻿Name;Value\r\nNorthwind;4800,5\r\n");
    expect(toCsv([["a", "b, c"]], { bom: false })).toBe('a,"b, c"\r\n');
  });

  it("guards against formula injection but not numbers", () => {
    expect(escapeCsvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(escapeCsvCell("+90 532 000 00 00")).toBe("'+90 532 000 00 00");
    expect(escapeCsvCell("@ada")).toBe("'@ada");
    expect(escapeCsvCell(-42)).toBe("-42");
    expect(escapeCsvCell(null)).toBe("");
  });
});
