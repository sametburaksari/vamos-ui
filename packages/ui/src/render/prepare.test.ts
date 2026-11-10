import { describe, expect, it, vi } from "vitest";
import { prepareDoc, resolveDoc, isOutsideSchedule } from "./prepare";
import { testRegistry, sampleDoc } from "./_fixtures";
import type { VamosDoc } from "../blocks/schema/types";

describe("prepareDoc", () => {
  it("localizes, assigns the h1 and groups statuses", () => {
    const p = prepareDoc(sampleDoc, { registry: testRegistry, locale: "tr" });
    expect(p.locale).toBe("tr");
    expect(p.body.map((n) => [n.node.type, n.status, n.headingLevel])).toEqual([
      ["intro", "ok", 1],
      ["paragraph", "core", 2],
      ["faq", "ok", 2],
    ]);
    expect(p.body[0]!.props).toMatchObject({ title: "Akşam yemeği, *yavaşça*.", lead: "Seasonal Aegean plates and a wine list that changes every Thursday." });
    expect(p.issues).toEqual([]);
  });

  it("filters hidden and scheduled blocks (kept in edit mode)", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        { id: "b_hid001", type: "paragraph", hidden: true, content: [{ text: "Hidden" }] },
        { id: "b_sch001", type: "paragraph", schedule: { from: "2026-12-01T00:00:00Z" }, content: [{ text: "December" }] },
        { id: "b_sch002", type: "paragraph", schedule: { until: "2026-11-01T00:00:00Z" }, content: [{ text: "October" }] },
      ],
    };
    const now = new Date("2026-11-10T12:00:00Z");
    expect(prepareDoc(doc, { registry: testRegistry, now }).body).toHaveLength(0);
    expect(prepareDoc(doc, { registry: testRegistry, now, editMode: true }).body).toHaveLength(3);
    expect(isOutsideSchedule(doc.blocks[1]!, new Date("2026-12-02T00:00:00Z"))).toBe(false);
  });

  it("migrates, salvages and reports", () => {
    const onIssue = vi.fn();
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        { id: "b_old001", type: "intro", v: 1, props: { heading: "Brunch on *weekends*" } },
        { id: "b_bad001", type: "faq", props: { title: "Questions", items: 3 } },
        { id: "b_unk001", type: "pricing-matrix", props: {} },
      ],
    };
    const p = prepareDoc(doc, { registry: testRegistry, onIssue });
    expect(p.body[0]!.props).toMatchObject({ title: "Brunch on *weekends*" });
    expect(p.body[1]!.status).toBe("invalid");
    expect(p.body[1]!.replaced).toEqual(["items"]);
    expect(p.body[2]!.status).toBe("unknown");
    expect(onIssue.mock.calls.map((c) => c[0].code)).toEqual(expect.arrayContaining(["invalid-props", "unknown-block"]));
  });
});

describe("resolveDoc", () => {
  const doc: VamosDoc = { version: 1, blocks: [{ id: "b_posts1", type: "post-list", props: { title: "Journal", query: { kind: "latest", limit: 2 } } }] };

  it("runs resolvers in parallel into the declared prop", async () => {
    const posts = vi.fn(async (q: unknown) => [{ slug: "autumn-menu", title: "The autumn menu", q }]);
    const p = await resolveDoc(prepareDoc(doc, { registry: testRegistry }), { posts });
    expect(posts).toHaveBeenCalledWith({ kind: "latest", limit: 2 }, expect.objectContaining({ locale: "en" }));
    expect(p.body[0]!.props.posts).toHaveLength(1);
  });

  it("logs failures and leaves the block to its empty state", async () => {
    const onIssue = vi.fn();
    const p = await resolveDoc(prepareDoc(doc, { registry: testRegistry }), { posts: () => Promise.reject(new Error("db down")) }, onIssue);
    expect(p.body[0]!.props.posts).toBeUndefined();
    expect(onIssue).toHaveBeenCalledWith(expect.objectContaining({ code: "resolver-failed" }));
  });
});
