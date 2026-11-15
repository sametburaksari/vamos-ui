import { AdSlot, NewsColumns, PopularPosts, PostBlock } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// Main column + sidebar. `asideSticky` (the ad) sticks once the rest of the sidebar has scrolled by.
export default function NewsColumnsDemo() {
  return (
    <SiteFrame>
      <div className="vb-container py-10">
        <NewsColumns asideLabel="More from the Ledger" aside={<PopularPosts title="Most read" posts={stories.slice(0, 4)} />} asideSticky={<AdSlot size="rectangle" />}>
          <PostBlock title="City" href="/city" layout="lead-grid" posts={stories.slice(0, 6)} />
          <PostBlock title="Latest" layout="list" posts={stories.slice(2, 6)} />
        </NewsColumns>
      </div>
    </SiteFrame>
  );
}
