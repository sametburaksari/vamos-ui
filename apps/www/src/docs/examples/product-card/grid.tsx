import { ProductGrid } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { ceramics } from "./_data";

// A section: header, "Shop all", four columns that step down with the container, ItemList JSON-LD.
export default function ProductGridDemo() {
  return (
    <SiteFrame>
      <ProductGrid
        eyebrow="Fresh from the kiln"
        title="New this *week*"
        columns={4}
        products={ceramics}
        allLink={{ href: "#shop", label: "Shop all" }}
        priorityCount={4}
        jsonLd
        siteUrl="https://shop.example.com"
      />
    </SiteFrame>
  );
}
