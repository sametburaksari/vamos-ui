import { FeaturedPosts } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// The lead grid under a masthead, with slider arrows for a second group of four.
export default function FeaturedPostsDemo() {
  return (
    <SiteFrame>
      <div className="vb-container py-8">
        <FeaturedPosts posts={stories} slider label="Top stories" />
      </div>
    </SiteFrame>
  );
}
