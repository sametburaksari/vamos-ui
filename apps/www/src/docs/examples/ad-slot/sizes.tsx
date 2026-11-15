import { AdSlot, newsLabelsTr } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Reserved boxes for the common IAB sizes (nothing sold: the size shows). Turkish label on the last one.
export default function AdSlotSizes() {
  return (
    <SiteFrame>
      <div className="vb-container grid items-start gap-8 py-10 md:grid-cols-3">
        <AdSlot size="rectangle" />
        <AdSlot size="half-page" />
        <AdSlot size={{ width: 300, height: 100 }} locale="tr-TR" labels={newsLabelsTr} />
      </div>
    </SiteFrame>
  );
}
