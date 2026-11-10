import { BlogList } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { posts } from "../_site-2/data";

// List: mono date · title + one-line excerpt · reading time. Category filter and URL pagination (?page=2).
export default function BlogListList() {
  return (
    <SiteFrame>
      <BlogList
        variant="list"
        eyebrow="Journal"
        title="Notes from the *kitchen*"
        categories={[
          { label: "All", href: "/journal" },
          { label: "Kitchen", href: "/journal/kitchen", active: true },
          { label: "Drinks", href: "/journal/drinks" },
          { label: "News", href: "/journal/news" },
        ]}
        posts={posts.filter((p) => p.category?.label === "Kitchen")}
        pagination={{ page: 1, total: 3, hrefTemplate: "/journal/kitchen?page={page}" }}
      />
    </SiteFrame>
  );
}
