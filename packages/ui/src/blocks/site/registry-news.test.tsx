import { render, screen, within } from "@testing-library/react";
import { createRegistry } from "../schema/define-block";
import { lintPage } from "../schema/lint";
import { renderDoc } from "../../render/block-renderer";
import type { VamosDoc } from "../schema/types";
import { siteBlocks1 } from "./registry-1";
import { siteBlocks2 } from "./registry-2";
import { newsBlocks, adSlotBlock, reviewScoreBlock } from "./registry-news";

const registry = createRegistry(newsBlocks);
const sample = (type: string) => registry.get(type)!.sample(undefined, "en") as Record<string, unknown>;

describe("registry-news", () => {
  it("combines with the other site registries without type collisions", () => {
    const all = createRegistry([...siteBlocks1, ...siteBlocks2, ...newsBlocks]);
    expect(all.types).toEqual(expect.arrayContaining(["news-masthead", "post-block", "product-grid", "review-score", "hero", "pricing"]));
  });

  it("every variant's sample content validates against its schema", () => {
    for (const def of newsBlocks) {
      for (const v of def.variants ?? [undefined]) {
        const r = def.schema.safeParse(def.sample(v, "en"));
        if (!r.success) throw new Error(`${def.type}/${v}: ${r.error.message}`);
      }
    }
  });

  it("renders a news front page from JSON: masthead, columns with a sidebar, ItemList + Review JSON-LD", () => {
    const doc: VamosDoc = {
      version: 1,
      layout: { header: [{ id: "b_mast01", type: "news-masthead", props: { ...sample("news-masthead"), currentPath: "/city" } }] },
      blocks: [
        { id: "b_tick01", type: "news-ticker", props: sample("news-ticker") },
        { id: "b_lead01", type: "featured-posts", variant: "quad", props: sample("featured-posts") },
        {
          id: "b_cols01",
          type: "news-columns",
          props: sample("news-columns"),
          slots: {
            main: [
              { id: "b_city01", type: "post-block", variant: "lead-list", props: sample("post-block") },
              { id: "b_tabs01", type: "post-tabs", props: sample("post-tabs") },
              { id: "b_card01", type: "post-card", variant: "row", props: sample("post-card") },
              { id: "b_grid01", type: "product-grid", variant: "grid", props: { ...sample("product-grid"), jsonLd: true } },
              { id: "b_revw01", type: "review-score", variant: "points", props: sample("review-score") },
            ],
            aside: [
              { id: "b_popu01", type: "popular-posts", variant: "thumbs", props: sample("popular-posts") },
              { id: "b_comm01", type: "recent-comments", props: sample("recent-comments") },
              { id: "b_cats01", type: "category-counts", props: sample("category-counts") },
              { id: "b_foll01", type: "follow-counts", props: sample("follow-counts") },
            ],
            asideSticky: [{ id: "b_adsl01", type: "ad-slot", props: { size: "rectangle", consent: "none", houseAd: { href: "/subscribe", image: { src: "https://cdn.example.com/house.png", alt: "Subscribe from 4 a week", width: 300, height: 250 } } } }],
          },
        },
      ],
    };
    const { container } = render(<div>{renderDoc(doc, { registry, dev: true, mainId: "content" })}</div>);
    expect(container.querySelectorAll("[data-block-notice]")).toHaveLength(0);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("button", { name: "City" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("region", { name: "Trending now" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "More from the Ledger" })).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subscribe from 4 a week" })).toHaveAttribute("href", "/subscribe");
    expect(screen.getByRole("region", { name: "Our score" })).toBeInTheDocument();
    expect(screen.getByText("Oak monitor stand")).toBeInTheDocument();
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1); // one merged @graph: the components do not emit their own
    const types = (JSON.parse(scripts[0]!.innerHTML)["@graph"] as { "@type": string }[]).map((n) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["ItemList", "Review"]));
  });

  it("block lint: an ad with no consent category needs to be a house ad; a score above the scale is flagged", () => {
    const doc: VamosDoc = {
      version: 1,
      blocks: [
        { id: "b_adsl01", type: "ad-slot", props: { size: "leaderboard", consent: "none" } },
        { id: "b_revw01", type: "review-score", props: { score: 12, max: 10 } },
      ],
    };
    const codes = lintPage(doc, registry).issues.map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(["ad-without-consent", "score-above-max"]));
    expect(adSlotBlock.region).toBe("body");
    expect(reviewScoreBlock.variants).toEqual(["points", "percent", "stars"]);
  });
});
