import { renderDoc } from "@vamos-cms/ui/render";
import { blockLabelsTr } from "@vamos-cms/ui/blocks";
import { siteBlocks, kiyiPage } from "./_site-blocks";

// One document, field-level translations: the renderer picks tr, falling back to en per field.
export default function BlocksApiLocalized() {
  return (
    <div className="w-full overflow-hidden rounded-ui border border-line" lang="tr">
      {renderDoc(kiyiPage, { registry: siteBlocks, locale: "tr", fallbackLocales: ["en"], labels: blockLabelsTr, regions: ["body"], jsonLd: false })}
    </div>
  );
}
