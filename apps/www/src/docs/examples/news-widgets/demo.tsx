import { CategoryCounts, FollowCounts, PopularPosts, RecentComments } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// The sidebar set: follower counts, most read, recent comments, editor's picks, sections with counts.
export default function NewsWidgetsDemo() {
  return (
    <SiteFrame width={1000}>
      <div className="grid gap-10 p-8 md:grid-cols-3">
        <div className="flex flex-col gap-10">
          <FollowCounts
            title="Stay connected"
            accounts={[
              { network: "facebook", href: "https://facebook.com/example", count: 48210, unit: "fans", action: "Like" },
              { network: "x", href: "https://x.com/example", count: 21340 },
              { network: "youtube", href: "https://youtube.com/@example", count: 9120, unit: "subscribers", action: "Subscribe" },
            ]}
          />
          <CategoryCounts title="Sections" categories={[{ label: "City", href: "/city", count: 271 }, { label: "Economy", href: "/economy", count: 197 }, { label: "Science", href: "/science", count: 86 }, { label: "Culture", href: "/culture", count: 197 }]} />
        </div>
        <PopularPosts title="Most read" posts={stories.slice(0, 5)} />
        <div className="flex flex-col gap-10">
          <RecentComments
            title="Recent comments"
            comments={[
              { author: "Leyla K.", postTitle: stories[0]!.title, postHref: stories[0]!.href, excerpt: "Finally. My shift ends at 00:30.", at: "2026-11-15T08:12:00+03:00" },
              { author: "Tomasz W.", postTitle: stories[4]!.title, postHref: stories[4]!.href },
            ]}
          />
          <PopularPosts title="Editor’s picks" variant="thumbs" posts={stories.slice(4, 7)} />
        </div>
      </div>
    </SiteFrame>
  );
}
