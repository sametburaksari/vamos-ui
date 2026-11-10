import { ex, type DocEntry } from "../types";
import Demo from "../examples/article-layout/demo";
import WideCover from "../examples/article-layout/wide-cover";
import Minimal from "../examples/article-layout/minimal";
import ProseElements from "../examples/article-layout/prose-elements";

const entry: DocEntry = {
  slug: "article-layout",
  title: "Article layout",
  group: "Site blocks",
  description:
    "The single-post template: breadcrumb, category, h1, dek, byline with published/updated dates and reading time, cover, table of contents generated on the server from the body's h2s (hidden under three), the RichDoc body, share links as plain URLs (no SDKs), tags and an author box, then related posts. Heading anchors are locale-aware slugs (Çiroz → ciroz). Only “Copy link” is an island.",
  source: ["blocks/site/article-layout.tsx", "blocks/site/shared/copy-link.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  usage: `import { ArticleLayout } from "@vamos-cms/ui/blocks";

// app/journal/[slug]/page.tsx
<ArticleLayout
  post={{ title, dek, body /* RichDoc */, cover, author, publishedAt, updatedAt, category, tags, breadcrumb }}
  url={\`https://kiyimeyhane.com/journal/\${slug}\`}
  related={related}
  share={["copy", "whatsapp", "linkedin", "email"]}
/>`,
  demo: ex("demo", "Classic", "article-layout/demo.tsx", Demo),
  examples: [
    ex("wide-cover", "Wide cover", "article-layout/wide-cover.tsx", WideCover, "Full-width 21:9 cover, title below, TOC as a row of links."),
    ex("minimal", "Minimal + draft preview", "article-layout/minimal.tsx", Minimal, "No cover, mono date above a large title. draft adds a “Preview” strip — also set noindex in the page metadata."),
    ex("prose-elements", "Every body element (Turkish)", "article-layout/prose-elements.tsx", ProseElements, "Headings, ordered and unordered lists, a quote with cite, highlight, a rule and a code block."),
  ],
  api: [
    {
      name: "ArticleLayout",
      props: [
        { name: "variant", type: '"classic" | "wide-cover" | "minimal"', default: '"classic"', description: "Layout." },
        { name: "post", type: "ArticlePost", description: "{ title, dek?, body: RichDoc, cover?, coverCaption?, author?, publishedAt, updatedAt?, category?, tags?, breadcrumb?, readingMinutes? }" },
        { name: "toc", type: "boolean", default: "true", description: "Table of contents from h2s; hidden under three headings." },
        { name: "share", type: '("copy" | "whatsapp" | "x" | "linkedin" | "email")[]', default: '["copy","whatsapp","linkedin","email"]', description: "Share targets. Network links need url." },
        { name: "url", type: "string", description: "Absolute URL to share (copy falls back to location.href)." },
        { name: "related", type: "PostSummary[]", description: "Rendered as a compact Blog list after the article." },
        { name: "cta", type: "ReactNode", description: "Any block after the article (newsletter, booking)." },
        { name: "draft", type: "boolean", default: "false", description: "Preview strip on top." },
        { name: "headingLevel", type: "1 | 2 | 3", default: "1", description: "The title is the page's h1." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "On this page, Share, Updated {date}, {count} min read…" },
        { name: "theme / anchor / id / className / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    { name: "shareUrl(target, url, title)", props: [{ name: "returns", type: "string", description: "wa.me / x.com intent / LinkedIn share-offsite / mailto URL." }] },
  ],
  notes: ["The renderer's articleBlock emits BlogPosting JSON-LD (headline, dates, image, author)."],
  covers: ["Article layout"],
};

export default entry;
