import { render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { BlockRenderer, renderDoc } from "./block-renderer";
import { testRegistry, sampleDoc } from "./_fixtures";
import { blockLabelsTr } from "../blocks/labels";
import type { VamosDoc } from "../blocks/schema/types";
import type { VamosLinkProps } from "../lib/provider";

const RouterLink = (p: VamosLinkProps) => <a {...p} data-router="" />;

describe("renderDoc", () => {
  it("renders a localized page with one h1, prose groups and JSON-LD", async () => {
    const { container } = render(<main>{renderDoc(sampleDoc, { registry: testRegistry, locale: "tr", components: { Link: RouterLink }, dev: false })}</main>);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Akşam yemeği, yavaşça.");
    expect(screen.getByRole("link", { name: "Masa ayırtın" })).toHaveAttribute("data-router");
    const faq = screen.getByRole("region", { name: "Rezervasyondan önce" });
    expect(faq).toHaveAttribute("id", "faq");
    expect(faq).toHaveAttribute("data-surface", "surface-2");
    expect(within(faq).getByRole("link", { name: "booked online" })).toHaveAttribute("href", "/reservations");
    expect(container.querySelector(".vb-prose strong")).toHaveTextContent("6 pm");
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.innerHTML);
    expect(ld["@graph"][0]["@type"]).toBe("FAQPage");
    expect(container.querySelector("[data-block-id]")).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("edit mode: block ids, unknown-block placeholder, invalid strip — data kept", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        { id: "b_unk001", type: "pricing-matrix", props: { plans: 3 } },
        { id: "b_bad001", type: "faq", props: { title: "Questions", items: "x" } },
        { id: "b_hid001", type: "paragraph", hidden: true, content: [{ text: "Draft note" }] },
      ],
    };
    const { container } = render(<div>{renderDoc(doc, { registry: testRegistry, editMode: true, labels: blockLabelsTr })}</div>);
    expect(screen.getByText("Bilinmeyen blok “pricing-matrix”")).toBeInTheDocument();
    expect(screen.getByText("“faq” geçersiz içerik barındırıyor")).toBeInTheDocument();
    expect(container.querySelector('[data-block-id="b_bad001"]')).toHaveStyle({ display: "contents" });
    expect(container.querySelector('p[data-block-id="b_hid001"]')).toHaveAttribute("data-hidden");
    expect(screen.getAllByRole("note")).toHaveLength(2);
  });

  it("production: unknown blocks are skipped silently", () => {
    const doc: VamosDoc = { version: 1, blocks: [{ id: "b_unk001", type: "pricing-matrix" }] };
    const { container } = render(<div>{renderDoc(doc, { registry: testRegistry, dev: false })}</div>);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("renders regions and wraps the body in main", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [{ id: "b_p00001", type: "paragraph", content: [{ text: "Body" }] }],
      layout: { footer: [{ id: "b_f00001", type: "paragraph", content: [{ text: "Footer note" }] }] },
    };
    render(<div>{renderDoc(doc, { registry: testRegistry, mainId: "content" })}</div>);
    expect(screen.getByRole("main")).toHaveAttribute("id", "content");
    expect(within(screen.getByRole("main")).queryByText("Footer note")).toBeNull();
    expect(screen.getByText("Footer note")).toBeInTheDocument();
  });

  it("core text blocks: headings, nested lists, quote, code, divider", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        { id: "b_h00001", type: "heading", props: { level: 2 }, anchor: "why", content: [{ text: "Why we close on Mondays" }] },
        {
          id: "b_l00001",
          type: "list",
          props: { ordered: true },
          slots: { items: [{ id: "b_li0001", type: "list-item", content: [{ text: "Market day" }] }, { id: "b_li0002", type: "list-item", content: [{ text: "Staff rest" }] }] },
        },
        { id: "b_q00001", type: "quote", props: { cite: "Murat, owner" }, content: [{ text: "A rested kitchen cooks better." }] },
        { id: "b_c00001", type: "code", props: { language: "txt" }, content: [{ text: "closed: mon" }] },
        { id: "b_d00001", type: "divider" },
      ],
    };
    const { container } = render(<div>{renderDoc(doc, { registry: testRegistry })}</div>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "why");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector("blockquote footer")).toHaveTextContent("Murat, owner");
    expect(container.querySelector("pre code")).toHaveTextContent("closed: mon");
    expect(container.querySelectorAll(".vb-prose")).toHaveLength(1);
    expect(container.querySelector("hr")).not.toBeNull();
  });
});

describe("BlockRenderer (async server component)", () => {
  it("resolves queries before rendering", async () => {
    const doc: VamosDoc = { version: 1, blocks: [{ id: "b_posts1", type: "post-list", props: { title: "Journal", query: { kind: "latest" } } }] };
    const el = await BlockRenderer({ doc, registry: testRegistry, resolvers: { posts: async () => [{ slug: "autumn", title: "The autumn menu" }] } });
    render(<div>{el}</div>);
    expect(screen.getByRole("listitem")).toHaveTextContent("The autumn menu");
  });
});
