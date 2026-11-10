import { BlockRenderer } from "@vamos-ui/react/render";
import { siteBlocks, kiyiPage } from "./_site-blocks";

// The same kind of page stored as JSON (VamosDoc) and rendered by the async server renderer:
// migrate → validate → localize → resolve → render, with the first intro block as the h1.
export default function BlocksApiJsonPage() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line">
      <BlockRenderer doc={kiyiPage} registry={siteBlocks} locale="en" />
    </div>
  );
}
