import { FeaturedPosts } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// A section front: wide lead, three stories stacked beside it.
export default function FeaturedPostsQuad() {
  return (
    <SiteFrame>
      <div className="vb-container py-8">
        <FeaturedPosts posts={stories.slice(4)} layout="quad" label="Lead stories in City" />
      </div>
    </SiteFrame>
  );
}
