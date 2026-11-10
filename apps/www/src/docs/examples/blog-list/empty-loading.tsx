import { BlogList, BlogListSkeleton, BlockLink } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Empty category with a newsletter action, and the Suspense fallback used while posts stream in:
// <Suspense fallback={<BlogListSkeleton />}><LatestPosts /></Suspense>
export default function BlogListEmptyLoading() {
  return (
    <SiteFrame>
      <BlogList
        title="Events"
        posts={[]}
        empty={{
          title: "No events planned yet",
          text: "Wine nights and fish suppers are announced here and by email, usually two weeks ahead.",
          action: <BlockLink href="/newsletter" appearance="secondary">Get event emails</BlockLink>,
        }}
      />
      <BlogListSkeleton variant="grid" count={3} />
    </SiteFrame>
  );
}
