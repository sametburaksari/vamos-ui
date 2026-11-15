import { PostBlock } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// Latest stories as thumbnail rows with numbered pagination ("Page 1 of 17").
export default function PostBlockLatest() {
  return (
    <SiteFrame width={900}>
      <div className="p-8">
        <PostBlock title="Latest" layout="list" posts={stories.slice(0, 4)} pagination={{ page: 1, total: 17, hrefTemplate: "/latest?page={page}" }} />
      </div>
    </SiteFrame>
  );
}
