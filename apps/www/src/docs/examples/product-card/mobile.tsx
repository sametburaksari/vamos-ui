import { ProductGrid } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { ceramics } from "./_data";

// Phone width: two columns stop at 1 below 36rem; quick add stays visible on touch screens.
export default function ProductGridMobile() {
  return (
    <SiteFrame width={390}>
      <ProductGrid title="New this *week*" products={ceramics.slice(0, 3)} columns={3} />
    </SiteFrame>
  );
}
