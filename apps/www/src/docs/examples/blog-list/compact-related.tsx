import { BlogList } from "@vamos-ui/react/blocks";
import { posts } from "../_site-2/data";

// Compact: titles and dates only, for sidebars, footers and "related posts".
export default function BlogListCompact() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-ui border border-line">
      <BlogList variant="compact" title="Related reading" posts={posts.slice(1, 5)} theme={{ rhythm: "tight" }} />
    </div>
  );
}
