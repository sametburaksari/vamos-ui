import { describe, expect, it } from "vitest";
import { lintPage, oklchHue } from "./lint";
import { testRegistry, sampleDoc } from "../../render/_fixtures";
import type { VamosDoc } from "./types";

const codes = (doc: VamosDoc) => lintPage(doc, testRegistry).issues.map((i) => i.code);

describe("lintPage", () => {
  it("passes the sample page except for one missing translation", () => {
    const report = lintPage(sampleDoc, testRegistry);
    expect(report.errorCount).toBe(0);
    expect(report.issues.filter((i) => i.code === "missing-translation").map((i) => i.path)).toEqual(["props.lead"]);
    expect(report.completeness.en).toBe(100);
    expect(report.completeness.tr).toBeLessThan(100);
  });

  it("flags structure problems", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        { id: "b_aaaa01", type: "intro", props: { title: "One" }, v: 2 },
        { id: "b_aaaa01", type: "heading", props: { level: 1 }, content: [{ text: "Two" }] },
        { id: "b_cccc01", type: "carousel-3d" },
      ],
    };
    expect(codes(doc)).toEqual(expect.arrayContaining(["duplicate-id", "multiple-h1", "unknown-block"]));
  });

  it("flags copy and design rules", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        {
          id: "b_intro2",
          type: "intro",
          v: 2,
          theme: { accent: "oklch(0.6 0.2 290)" },
          props: {
            title: "Unlock seamless dining with our next-gen restaurant experience platform today",
            actions: [
              { link: { href: "/a", label: "Book" }, style: "primary" },
              { link: { href: "/b", label: "Call" }, style: "primary" },
            ],
          },
        },
        ...["s1", "s2", "s3"].map((s) => ({ id: `b_card_${s}`, type: "faq", v: 1, theme: { surface: "surface" as const }, props: { title: "Hours", items: [{ q: "Open?", a: { type: "doc", content: [] } }] } })),
      ],
    };
    expect(codes(doc)).toEqual(expect.arrayContaining(["heading-too-long", "cliche-copy", "multiple-primary-cta", "violet-accent", "too-many-cards"]));
  });

  it("reads oklch hues", () => {
    expect(oklchHue("oklch(0.7 0.15 290)")).toBe(290);
    expect(oklchHue("oklch(0.7 0 290)")).toBeNull();
    expect(oklchHue("lime")).toBeNull();
  });
});
