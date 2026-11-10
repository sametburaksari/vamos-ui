import { BlogList } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { posts } from "../_site-2/data";

// Editorial: the latest post large beside its cover, the rest as a two-column title list.
// `posts` is plain data (PostSummary[]) — map any CMS into it.
export default function BlogListDemo() {
  return (
    <SiteFrame>
      <BlogList title="From the *journal*" allLink={{ href: "/journal", label: "All posts" }} posts={posts.slice(0, 5)} />
    </SiteFrame>
  );
}
