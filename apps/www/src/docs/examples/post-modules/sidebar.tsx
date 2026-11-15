import { PostBlock } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// featured-list in a sidebar: a photo lead over three text items, small heading.
export default function PostBlockSidebar() {
  return (
    <SiteFrame width={360}>
      <div className="p-5">
        <PostBlock title="Opinion" href="/opinion" headingSize="sm" layout="featured-list" posts={stories.slice(3, 7)} />
      </div>
    </SiteFrame>
  );
}
