import { ArticleLayout } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { article, posts } from "../_site-2/data";

// Classic: 42rem text column, sticky mono table of contents from the body's h2s, cover wider
// than the text, share links (plain URLs), author box, related posts.
export default function ArticleLayoutDemo() {
  return (
    <SiteFrame>
      <ArticleLayout post={article} url="https://kiyimeyhane.com/journal/morning-boats" related={posts.slice(1, 4)} share={["copy", "whatsapp", "x", "linkedin", "email"]} />
    </SiteFrame>
  );
}
