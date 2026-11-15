import { ex, type DocEntry } from "../types";
import Demo from "../examples/news-widgets/demo";
import Columns from "../examples/news-widgets/columns";

const entry: DocEntry = {
  slug: "news-widgets",
  title: "Sidebar widgets",
  group: "Site blocks",
  description:
    "The sidebar of a news or magazine site and the grid it lives in. NewsColumns: main column + 20rem sidebar that stacks under the main column on narrow containers; its asideSticky tail (an ad, sections) sticks below the header once the rest has scrolled by. Widgets: FollowCounts (followers per network, compact and locale-formatted, one link per row), PopularPosts (numbered or thumbnails), RecentComments (who commented on which story), CategoryCounts (sections with story counts) and SidebarWidget for your own. Server components.",
  source: ["blocks/site/news-widgets.tsx", "blocks/site/post-card.tsx", "blocks/site/shared/brand-icons.tsx", "styles/blocks.css"],
  usage: `import { NewsColumns, FollowCounts, PopularPosts, RecentComments, CategoryCounts, AdSlot } from "@vamos-ui/react/blocks";

<NewsColumns asideLabel="More from the Ledger"
  aside={<>
    <FollowCounts title="Stay connected" accounts={[{ network: "youtube", href, count: 22900, unit: "subscribers", action: "Subscribe" }]} />
    <PopularPosts title="Most read" posts={mostRead} />
    <RecentComments title="Recent comments" comments={comments} />
  </>}
  asideSticky={<><AdSlot size="rectangle" /><CategoryCounts title="Sections" categories={sections} /></>}>
  {modules}
</NewsColumns>`,
  demo: ex("demo", "The widget set", "news-widgets/demo.tsx", Demo),
  examples: [ex("columns", "Columns with a sticky tail", "news-widgets/columns.tsx", Columns, "A whole sidebar taller than the screen can't stick usefully; only asideSticky does. Offset: --news-sticky-offset (default 4.5rem, the section bar).")],
  api: [
    { name: "NewsColumns", props: [{ name: "children / aside / asideSticky / asideLabel / asideStart", type: "ReactNode / string / boolean", description: "Main column, sidebar, sticky tail, sidebar name, sidebar on the start side." }] },
    { name: "FollowCounts", props: [{ name: "accounts", type: "{ network; href; count; unit?; action? }[]", description: "network: any BrandName (x, instagram, facebook, youtube, linkedin, tiktok…). Opens in a new tab (announced)." }] },
    { name: "PopularPosts", props: [{ name: "posts / variant / limit", type: 'NewsPost[] / "numbered" | "thumbs" / number', description: "Ordered list; default 5 items." }] },
    { name: "RecentComments", props: [{ name: "comments", type: "{ author; postTitle; postHref; href?; excerpt?; at? }[]", description: "href points at the comment anchor." }] },
    { name: "CategoryCounts", props: [{ name: "categories", type: "{ label; href; count }[]", description: "Count is visible as a number and read as “271 stories”." }] },
    { name: "SidebarWidget", props: [{ name: "title / href / headingLevel / children", type: "…", description: "Small-caps heading on a rule + any content." }] },
  ],
  covers: ["Sidebar widgets (follow counts, popular, comments, categories)"],
};

export default entry;
