import { render, screen } from "@testing-library/react";
import { createRegistry } from "../schema/define-block";
import { lintPage } from "../schema/lint";
import { renderDoc } from "../../render/block-renderer";
import type { VamosDoc } from "../schema/types";
import { siteBlocks1, statsBlock } from "./registry-1";

const registry = createRegistry(siteBlocks1);

describe("registry-1", () => {
  it("every variant's sample content validates against its schema", () => {
    for (const def of siteBlocks1) {
      for (const v of def.variants ?? [undefined]) {
        const sample = def.sample(v, "en");
        const r = def.schema.safeParse(sample);
        if (!r.success) throw new Error(`${def.type}/${v}: ${r.error.message}`);
      }
    }
  });

  it("renders a full page from JSON: one h1, header region, FAQPage + BreadcrumbList JSON-LD", () => {
    const doc: VamosDoc = {
      version: 1,
      layout: {
        header: [
          { id: "b_ann001", type: "announcement", props: announcement() },
          { id: "b_nav001", type: "navbar", variant: "bar", props: navbar() },
        ],
      },
      blocks: siteBlocks1
        .filter((d) => d.region === "body")
        .map((d, i) => ({ id: `b_${d.type.replace(/-/g, "")}${i}`, type: d.type, v: 1, variant: d.defaultVariant, props: d.sample(d.defaultVariant, "en") as Record<string, unknown> })),
    };
    const { container } = render(<div>{renderDoc(doc, { registry, dev: true, mainId: "content" })}</div>);
    expect(container.querySelectorAll("[data-block-notice]")).toHaveLength(0);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.innerHTML);
    const types = (ld["@graph"] as { "@type": string }[]).map((n) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["FAQPage", "BreadcrumbList"]));
  });

  it("block lint: unsourced stats are flagged", () => {
    const doc: VamosDoc = { version: 1, blocks: [{ id: "b_stats01", type: "stats", props: { items: [{ value: 340, label: "Sites" }, { value: 12, label: "Years", source: "Studio records" }] } }] };
    const report = lintPage(doc, registry);
    expect(report.issues.some((i) => i.code === "stat-missing-source" && i.path === "props.items.0.source")).toBe(true);
    expect(statsBlock.region).toBe("body");
  });
});

function announcement() {
  return { text: "Closed 1–3 April for Eid.", link: { href: "/hours", label: "Holiday hours" } };
}
function navbar() {
  return { wordmark: "Kıyı", items: [{ label: "Menu", href: "/menu" }], actions: [{ link: { href: "/book", label: "Book a table" }, style: "primary" }] };
}
