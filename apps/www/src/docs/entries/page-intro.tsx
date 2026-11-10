import { ex, type DocEntry } from "../types";
import Demo from "../examples/page-intro/demo";
import WithMedia from "../examples/page-intro/with-media";
import Ruled from "../examples/page-intro/ruled";

const entry: DocEntry = {
  slug: "page-intro",
  title: "Page intro",
  group: "Site blocks",
  description:
    "The h1 and breadcrumb of an inner page — About, Services, Contact — where a hero is too heavy. Breadcrumb as a labelled nav with aria-current, and BreadcrumbList JSON-LD from the same data. Server component.",
  source: ["blocks/site/page-intro.tsx", "blocks/site/registry-1.ts"],
  usage: `import { PageIntro, breadcrumbJsonLd, JsonLd } from "@vamos-ui/react/blocks";

const crumbs = [{ label: "Home", href: "/" }, { label: "Treatments" }];
<PageIntro breadcrumb={crumbs} title="Treatments, *by the hour*" lead="…" />
<JsonLd data={breadcrumbJsonLd(crumbs, "https://hamam.example")} />   // the renderer does this for you`,
  demo: ex("demo", "Simple", "page-intro/demo.tsx", Demo),
  examples: [
    ex("with-media", "With media", "page-intro/with-media.tsx", WithMedia, "A 21:9 image bleeding past the container, loaded with priority."),
    ex("ruled", "Ruled", "page-intro/ruled.tsx", Ruled, "Up to three facts behind a vertical rule, a full-width hairline below."),
  ],
  api: [
    {
      name: "PageIntro",
      props: [
        { name: "variant", type: '"simple" | "with-media" | "ruled"', default: '"simple"', description: "Layout (see examples)." },
        { name: "breadcrumb", type: "{ label; href? }[]", description: "Ancestors first; the last crumb is the current page (aria-current=\"page\"). Separators mirror in RTL." },
        { name: "eyebrow", type: "ReactNode", description: "Shown instead of the breadcrumb when there is none." },
        { name: "title", type: "ReactNode", description: "The h1. One *emphasis*." },
        { name: "lead", type: "ReactNode", description: "Beside the title on wide containers." },
        { name: "media", type: "ImageData", description: "with-media: the 21:9 image." },
        { name: "meta", type: "SiteMeta[]", description: "ruled: up to 3 facts." },
        { name: "headingLevel", type: "1 | 2 | 3", default: "1", description: "The renderer gives the page's first intro block h1." },
        { name: "theme / anchor / id / className / labels / locale / components / editMode", type: "BlockBaseProps", description: "labels.breadcrumb names the nav." },
      ],
    },
    { name: "breadcrumbJsonLd(crumbs, origin?)", props: [{ name: "returns", type: "object | null", description: "A BreadcrumbList node; the current page has no item URL." }] },
  ],
  covers: ["Page intro"],
};

export default entry;
