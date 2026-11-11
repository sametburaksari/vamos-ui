import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import * as React from "react";
import { createBlocks, fieldAttrs } from "./create-blocks";
import { blockLabelsTr } from "./labels";
import { JsonLd, mergeJsonLd, serializeJsonLd } from "./json-ld";
import type { VamosLinkProps } from "../lib/provider";
import type { BlockBaseProps } from "./types";

const RouterLink = (p: VamosLinkProps) => <a {...p} data-router="" />;

describe("createBlocks", () => {
  it("binds adapters and labels into primitives and custom blocks", async () => {
    const blocks = createBlocks({ Link: RouterLink, labels: blockLabelsTr, locale: "tr-TR" });
    function Cta({ components, labels }: BlockBaseProps) {
      return <blocks.BlockLink href="https://wa.me/902160000000" newTab components={components} labels={labels}>WhatsApp</blocks.BlockLink>;
    }
    const BoundCta = blocks.bind(Cta);
    const { container } = render(
      <>
        <blocks.BlockLink href="/rezervasyon">Masa ayırtın</blocks.BlockLink>
        <BoundCta />
        <blocks.SkipLink />
      </>,
    );
    expect(screen.getByRole("link", { name: "Masa ayırtın" })).toHaveAttribute("data-router");
    expect(screen.getByRole("link", { name: "WhatsApp (yeni sekmede açılır)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "İçeriğe geç" })).toBeInTheDocument();
    expect(blocks.adapters.Link).toBe(RouterLink);
    expect(BoundCta.displayName).toBe("Bound(Cta)");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("fieldAttrs only in edit mode", () => {
    expect(fieldAttrs(false, "title")).toEqual({});
    expect(fieldAttrs(true, "title")).toEqual({ "data-field": "props.title" });
  });
});

describe("JsonLd", () => {
  it("escapes and merges into one @graph", () => {
    const merged = mergeJsonLd([{ "@type": "Restaurant", "@id": "#org", name: "Kıyı" }, { "@id": "#org", telephone: "+902160000000" }, null]);
    expect(merged).toEqual({ "@context": "https://schema.org", "@graph": [{ "@type": "Restaurant", "@id": "#org", name: "Kıyı", telephone: "+902160000000" }] });
    expect(serializeJsonLd({ x: "</script><script>" })).not.toContain("</script>");
    const { container } = render(<JsonLd data={{ "@type": "Restaurant", name: "Kıyı" }} />);
    expect(JSON.parse(container.querySelector("script")!.innerHTML)).toMatchObject({ "@context": "https://schema.org", name: "Kıyı" });
  });
});
