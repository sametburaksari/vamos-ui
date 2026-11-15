import { PostCard } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// The five card shapes side by side: overlay, stack, row, list and text.
export default function PostCardDemo() {
  return (
    <SiteFrame>
      <div className="vb-container grid gap-8 py-10 md:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[4/3]">
          <PostCard post={stories[0]!} variant="overlay" size="xl" fill className="absolute inset-0" />
        </div>
        <PostCard post={stories[1]!} variant="stack" excerpt />
        <div className="flex flex-col gap-5">
          <PostCard post={stories[4]!} variant="row" />
          <PostCard post={stories[5]!} variant="row" />
        </div>
        <PostCard post={stories[6]!} variant="text" excerpt />
        <PostCard post={stories[2]!} variant="list" excerpt className="md:col-span-2" />
      </div>
    </SiteFrame>
  );
}
