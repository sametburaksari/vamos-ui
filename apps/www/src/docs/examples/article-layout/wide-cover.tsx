import { ArticleLayout } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { article, photos } from "../_site-2/data";

// Wide cover: a full-width 21:9 image, the title below it, the TOC as a row of links.
export default function ArticleWideCover() {
  return (
    <SiteFrame>
      <ArticleLayout variant="wide-cover" post={{ ...article, cover: photos.diningRoom, coverCaption: "The dining room on a Tuesday, before the first seating." }} url="https://kiyimeyhane.com/journal/morning-boats" />
    </SiteFrame>
  );
}
