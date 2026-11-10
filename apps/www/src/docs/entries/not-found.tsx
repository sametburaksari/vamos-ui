import { ex, type DocEntry } from "../types";
import Demo from "../examples/not-found/demo";
import LinksSearch from "../examples/not-found/links-search";
import Error500 from "../examples/not-found/error-500";

const entry: DocEntry = {
  slug: "not-found",
  title: "404",
  group: "Site blocks",
  description:
    "A branded, useful not-found, error or maintenance page for not-found.tsx and error.tsx. No giant numerals: a small mono code, a sentence title as the page's h1, and the way back — popular pages, a plain GET search form and a phone line in the links variant. Works as a server component and inside error.tsx (client) with Next's reset().",
  source: ["blocks/site/not-found.tsx", "blocks/site/registry-2.ts"],
  usage: `import { NotFound } from "@vamos-ui/react/blocks";

// app/not-found.tsx
export default function NotFoundPage() {
  return <NotFound variant="links" links={popular} search={{ action: "/search" }} phone="+902160000000" />;
}

// app/error.tsx ("use client")
export default function Error({ reset }: { reset: () => void }) {
  return <NotFound kind="500" reset={reset} />;
}`,
  demo: ex("demo", "Plain", "not-found/demo.tsx", Demo),
  examples: [
    ex("links-search", "Links, search and phone", "not-found/links-search.tsx", LinksSearch, "Popular pages in a hairline list, a GET search form (works without JS), “Still stuck? Call …”."),
    ex("error-500", "500 with reset, and maintenance", "not-found/error-500.tsx", Error500, "kind=\"500\" adds “Try again” wired to reset; kind=\"maintenance\" puts the phone number first."),
  ],
  api: [
    {
      name: "NotFound",
      props: [
        { name: "variant", type: '"plain" | "links"', default: '"plain"', description: "Layout." },
        { name: "kind", type: '"404" | "500" | "maintenance"', default: '"404"', description: "Default code, title and text per kind." },
        { name: "title / text", type: "ReactNode", description: "Overrides; title supports one *emphasis*." },
        { name: "links", type: "Link[]", description: "Up to 6 popular pages (links variant)." },
        { name: "homeHref", type: "string", default: '"/"', description: "“Back to home”." },
        { name: "search", type: "{ action; param? }", description: "GET search form (param default q)." },
        { name: "phone", type: "string (E.164)", description: "Phone line / maintenance call button." },
        { name: "reset", type: "() => void", description: "error.tsx only: renders “Try again”." },
        { name: "headingLevel", type: "1 | 2 | 3", default: "1", description: "The title is the page's h1." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Default copy in en / tr." },
        { name: "theme / anchor / id / className / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  covers: ["404"],
};

export default entry;
