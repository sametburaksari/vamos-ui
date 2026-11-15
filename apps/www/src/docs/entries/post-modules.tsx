import { ex, type DocEntry } from "../types";
import Demo from "../examples/post-modules/demo";
import Quad from "../examples/post-modules/quad";
import Layouts from "../examples/post-modules/layouts";
import Latest from "../examples/post-modules/latest";
import Sidebar from "../examples/post-modules/sidebar";

const entry: DocEntry = {
  slug: "post-modules",
  title: "Post modules",
  group: "Site blocks",
  description:
    "The building blocks of a news front page. FeaturedPosts is the lead grid under the masthead (one large story, three smaller, optional slider arrows). PostBlock is a section module — heading with “View all”, then the stories in one of seven layouts — with pager arrows or numbered pagination (“Page 1 of 17”). Both lay out by their own width (container queries), so a module works in a wide main column, a narrow one or a sidebar. Server components; the arrows and pagination are small islands.",
  source: ["blocks/site/post-modules.tsx", "blocks/site/news-pagination.tsx", "blocks/site/shared/post-slider.tsx", "blocks/site/post-card.tsx", "blocks/site/shared/news.tsx"],
  usage: `import { FeaturedPosts, PostBlock, NewsPagination } from "@vamos-ui/react/blocks";

<FeaturedPosts posts={lead} label="Top stories" slider />
<PostBlock title="City" href="/city" layout="lead-list" posts={city} />
<PostBlock title="Economy" layout="big-2" posts={economy} pages={[olderEconomy]} />
<PostBlock title="Latest" layout="list" posts={latest}
  pagination={{ page, total: 17, hrefTemplate: "/latest?page={page}" }} />`,
  demo: ex("demo", "Lead grid with slider", "post-modules/demo.tsx", Demo),
  examples: [
    ex("quad", "Quad lead (section front)", "post-modules/quad.tsx", Quad, "A wide lead with three stacked beside it. Under 48rem both layouts become a 4:3 lead, a 16:9 story and two 4:5 cards."),
    ex("layouts", "Category layouts", "post-modules/layouts.tsx", Layouts, "lead-list (lead with excerpt + four thumbnail rows), big-2 with pager arrows, grid with excerpts. Also: lead-grid, featured-list, trio, list."),
    ex("latest", "Latest with numbered pagination", "post-modules/latest.tsx", Latest, "NewsPagination wraps the kit Pagination (real links, compact under 640px) and adds “Page 1 of 17”; page 1 drops ?page=1."),
    ex("sidebar", "featured-list in a sidebar", "post-modules/sidebar.tsx", Sidebar, "headingSize=\"sm\" gives the small-caps sidebar heading."),
  ],
  api: [
    {
      name: "FeaturedPosts",
      props: [
        { name: "posts", type: "NewsPost[]", description: "Four per page; with slider, every further four make a page." },
        { name: "layout", type: '"mosaic" | "quad"', default: '"mosaic"', description: "mosaic: lead on the start half, a wide story and two squares. quad: wide lead, three stacked." },
        { name: "slider", type: "boolean", default: "false", description: "Previous / next arrows and a polite “1 of 2” counter. Hidden pages stay in the DOM." },
        { name: "label", type: "string", description: "Accessible name of the region and slider." },
        { name: "headingLevel", type: "2 | 3", default: "2", description: "Card title level." },
        { name: "priority", type: "boolean", default: "true", description: "Eager lead image." },
      ],
    },
    {
      name: "PostBlock",
      props: [
        { name: "title / href / hrefLabel", type: "ReactNode / string", description: "Section heading and its “View all” link. Omit title inside PostTabs." },
        { name: "layout", type: '"lead-list" | "lead-grid" | "big-2" | "featured-list" | "trio" | "list" | "grid"', default: '"lead-list"', description: "See the examples." },
        { name: "posts / pages", type: "NewsPost[] / NewsPost[][]", description: "pages adds pager arrows through further sets." },
        { name: "columns", type: "2 | 3", default: "2", description: "grid columns on wide containers." },
        { name: "excerpts", type: "boolean", description: "grid / trio / list excerpts (list: default on)." },
        { name: "pagination", type: "{ page; total; hrefTemplate? }", description: "Numbered pagination + “Page x of y”." },
        { name: "headingSize", type: '"lg" | "sm"', default: '"lg"', description: "sm for sidebars." },
        { name: "headingLevel", type: "2 | 3", default: "2", description: "Card titles go one level deeper." },
        { name: "footer", type: "ReactNode", description: "After the stories (an ad, a load-more)." },
      ],
    },
    { name: "PostLayout", props: [{ name: "layout, posts, columns?, excerpts?, level?, common?, empty?", type: "PostLayoutProps", description: "Just the arrangement, without a heading — for PostTabs panels." }] },
    { name: "NewsPagination", props: [{ name: "page, total, hrefTemplate?, onPageChange?", type: "NewsPaginationProps", description: "Client island; hrefTemplate is a string so server components can pass it. newsPageHref(template, page) is exported." }] },
  ],
  notes: ["Each module is a section named by its heading; every story is an article. Use one h1 per page (the masthead or a visually hidden one)."],
  covers: ["Post modules (featured grid, category blocks)"],
};

export default entry;
