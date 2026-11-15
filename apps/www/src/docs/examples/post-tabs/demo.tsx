import { PostLayout, PostTabs } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

const common = { locale: "en-GB" };
const panel = (offset: number) => <PostLayout layout="lead-list" posts={[...stories.slice(offset), ...stories.slice(0, offset)].slice(0, 5)} columns={2} level={3} common={common} empty="No stories yet." />;

// "Don't miss": one tab per section; the ones that don't fit fold into More.
export default function PostTabsDemo() {
  return (
    <SiteFrame width={860}>
      <div className="p-8">
        <PostTabs
          title="Don’t miss"
          tabs={[
            { id: "all", label: "All", content: panel(0) },
            { id: "city", label: "City", content: panel(4) },
            { id: "economy", label: "Economy", content: panel(1) },
            { id: "science", label: "Science", content: panel(2) },
            { id: "culture", label: "Culture", content: panel(5) },
            { id: "sport", label: "Sport", content: panel(3) },
            { id: "technology", label: "Technology", content: panel(6) },
            { id: "environment", label: "Environment", content: panel(7) },
            { id: "opinion", label: "Opinion", content: panel(1) },
          ]}
        />
      </div>
    </SiteFrame>
  );
}
