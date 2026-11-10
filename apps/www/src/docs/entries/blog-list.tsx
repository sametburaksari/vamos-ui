import { ex, type DocEntry } from "../types";
import Demo from "../examples/blog-list/demo";
import List from "../examples/blog-list/list";
import Grid from "../examples/blog-list/grid";
import Compact from "../examples/blog-list/compact-related";
import EmptyLoading from "../examples/blog-list/empty-loading";

const entry: DocEntry = {
  slug: "blog-list",
  title: "Blog list",
  group: "Site blocks",
  description:
    "Latest posts and category archives. It receives posts as data (PostSummary) — any CMS maps into that shape; in stored pages an f.query field is resolved by the app's resolvers.posts. Each post is an article with one link on its title that covers the whole item (::after), dates are time[datetime], pagination is plain URLs in a labelled nav.",
  source: ["blocks/site/blog-list.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  usage: `import { BlogList, BlogListSkeleton, type PostSummary } from "@vamos-ui/react/blocks";

const posts: PostSummary[] = await cms.posts({ limit: 6 }).then(toPostSummary);

<BlogList title="From the *journal*" posts={posts} allLink={{ href: "/journal", label: "All posts" }}
  pagination={{ page, total, hrefTemplate: "/journal?page={page}" }} />

// Streaming
<Suspense fallback={<BlogListSkeleton />}><LatestPosts /></Suspense>`,
  demo: ex("demo", "Editorial (restaurant journal)", "blog-list/demo.tsx", Demo),
  examples: [
    ex("list", "List with categories and pagination", "blog-list/list.tsx", List, "Date · title + excerpt · reading time rows. Categories are links with aria-current; page 1 drops ?page=1."),
    ex("grid", "Grid (SaaS guides)", "blog-list/grid.tsx", Grid, "Three columns of 3:2 covers without card frames."),
    ex("compact-related", "Compact (related posts)", "blog-list/compact-related.tsx", Compact, "Titles and dates only, 3–5 items, no covers."),
    ex("empty-loading", "Empty state and skeleton", "blog-list/empty-loading.tsx", EmptyLoading, "No posts: a message and an optional action (newsletter). BlogListSkeleton is the Suspense fallback."),
  ],
  api: [
    {
      name: "BlogList",
      props: [
        { name: "variant", type: '"editorial" | "list" | "grid" | "compact"', default: '"editorial"', description: "Layout." },
        { name: "posts", type: "PostSummary[]", description: "{ href, title, excerpt?, cover?, category?, publishedAt, readingMinutes?, author? }." },
        { name: "categories", type: "{ label; href; active? }[]", description: "Category filter links." },
        { name: "pagination", type: "{ page; total; href?(p) ; hrefTemplate? }", description: "Prev / next links and “Page 2 of 5”. href() for code, hrefTemplate for JSON." },
        { name: "allLink", type: "{ href; label }", description: "“All posts” beside the header." },
        { name: "showCovers", type: "boolean", default: "true", description: "Covers in editorial and grid." },
        { name: "empty", type: "{ title?; text?; action? }", description: "Empty-state copy." },
        { name: "postHeadingLevel", type: "2 | 3 | 4", description: "Default 3 under a title, else 2." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "“{count} min read”, pagination strings; dates via Intl." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    { name: "BlogListSkeleton", props: [{ name: "variant / count", type: "BlogListVariant / number", default: '"grid" / 3', description: "aria-hidden placeholder shapes." }] },
  ],
  covers: ["Blog list"],
};

export default entry;
