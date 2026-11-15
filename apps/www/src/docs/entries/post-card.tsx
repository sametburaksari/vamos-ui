import { ex, type DocEntry } from "../types";
import Demo from "../examples/post-card/demo";
import Ranked from "../examples/post-card/ranked";

const entry: DocEntry = {
  slug: "post-card",
  title: "Post card",
  group: "Site blocks",
  description:
    "One story in a news or magazine layout, in five shapes: overlay (title over the photo), stack (photo, then title), row (small thumbnail), list (wide thumbnail with excerpt) and text. Each is an article whose title link covers the card — one tab stop — with the section badge as its own link above it. Byline: author, time[datetime], comment count (announced in full), reading time. Server component.",
  source: ["blocks/site/post-card.tsx", "blocks/site/shared/news.tsx", "blocks/site/shared/labels-news.ts", "styles/blocks.css"],
  usage: `import { PostCard, type NewsPost } from "@vamos-ui/react/blocks";

// NewsPost is a superset of BlogList's PostSummary: the same CMS mapping feeds both.
<PostCard post={post} variant="overlay" size="xl" priority />
<PostCard post={post} variant="stack" excerpt />
<PostCard post={post} variant="row" />
<PostCard post={post} variant="text" rank={1} meta={{ author: false }} />`,
  demo: ex("demo", "The five shapes", "post-card/demo.tsx", Demo),
  examples: [ex("ranked", "Ranked text cards, Turkish", "post-card/ranked.tsx", Ranked, "rank prints a large number before the title (hidden from screen readers: the list order carries it). newsLabelsTr translates the byline, comments and reading time.")],
  api: [
    {
      name: "PostCard",
      props: [
        { name: "post", type: "NewsPost", description: "href, title, excerpt?, cover?, category? { label, href? }, publishedAt, updatedAt?, author? { name, href? }, commentCount?, readingMinutes?, format? (video | gallery | live), id?." },
        { name: "variant", type: '"overlay" | "stack" | "row" | "list" | "text"', default: '"stack"', description: "Card shape." },
        { name: "size", type: '"xl" | "lg" | "md" | "sm"', default: "by variant", description: "Title scale: xl/lg in the display face, md/sm in the text face." },
        { name: "excerpt", type: "boolean", default: "false", description: "Show the standfirst (stack, list, text)." },
        { name: "meta", type: "PostMetaFields | false", default: "all on", description: "{ author, date, comments, readingTime } toggles; false hides the byline." },
        { name: "category", type: "boolean", default: "true (row: false)", description: "Show the section badge." },
        { name: "rank", type: "number", description: "Large rank number before the title (most-read lists)." },
        { name: "headingLevel", type: "2 | 3 | 4", default: "3", description: "Title level — one below the module heading." },
        { name: "aspect", type: '"16:10" | "3:2" | "4:3" | "1:1" | "16:9"', description: "Crop of the cover." },
        { name: "fill", type: "boolean", description: "overlay: fill the parent box (grid cells) instead of keeping the ratio." },
        { name: "priority / sizes", type: "boolean / string", description: "Image loading hints (the lead story is the LCP)." },
        { name: "locale / labels / components / className", type: "…", description: "labels: NewsBlockLabels (newsLabelsTr for Turkish)." },
      ],
    },
    { name: "PostMeta · CategoryBadge · ModuleHeading · NewsDate", props: [{ name: "—", type: "server components", description: "The card's byline row, section badge, the section heading with a heavy rule (lg / sm) and the date element, for your own layouts." }] },
    { name: "newsArticleJsonLd(post, opts) · newsItemListJsonLd(posts, opts)", props: [{ name: "opts", type: "{ origin?, publisher?: { name, logo?, url? }, name? }", description: "NewsArticle (with NewsMediaOrganization publisher) and ItemList nodes for <JsonLd>." }] },
  ],
  notes: [
    "Overlay text sits on a bottom-weighted scrim; titles are clamped to four lines in small cells.",
    "Hover underlines the title (an animated 1px rule) and nudges the photo; both are off under reduced motion.",
  ],
  covers: ["Post card"],
};

export default entry;
