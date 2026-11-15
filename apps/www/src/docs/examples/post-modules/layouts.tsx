import { PostBlock } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// Category modules in a main column: lead + list, big + 2, and a grid with excerpts.
export default function PostBlockLayouts() {
  return (
    <SiteFrame width={900}>
      <div className="flex flex-col gap-14 p-8">
        <PostBlock title="City" href="/city" layout="lead-list" posts={stories} />
        <PostBlock title="Economy" href="/economy" layout="big-2" posts={stories.slice(1, 4)} pages={[stories.slice(4, 7)]} />
        <PostBlock title="Culture" href="/culture" layout="grid" excerpts posts={stories.slice(4, 8)} />
      </div>
    </SiteFrame>
  );
}
