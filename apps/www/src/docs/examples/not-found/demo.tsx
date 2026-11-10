import { NotFound } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Plain: a small mono code, a sentence title (h1) and one way home — no giant numerals.
// app/not-found.tsx → export default function NotFoundPage() { return <NotFound />; }
export default function NotFoundDemo() {
  return (
    <SiteFrame>
      <NotFound />
    </SiteFrame>
  );
}
