import { PostCard, newsLabelsTr } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

// Text cards with a rank, Turkish labels, byline and comments hidden.
export default function PostCardRanked() {
  return (
    <SiteFrame width={420}>
      <ol className="flex flex-col divide-y divide-line p-5">
        {stories.slice(0, 4).map((post, i) => (
          <li key={post.href} className="py-3">
            <PostCard post={post} variant="text" size="sm" rank={i + 1} category={false} meta={{ author: false, comments: false }} locale="tr-TR" labels={newsLabelsTr} />
          </li>
        ))}
      </ol>
    </SiteFrame>
  );
}
