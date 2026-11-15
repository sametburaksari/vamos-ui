import { ProductGrid } from "@vamos-ui/react/blocks";
import { listItems } from "./_data";

// variant="list": one row per product, photo beside the text. `bare` drops the section for pages with their own layout.
export default function ProductListDemo() {
  return (
    <div className="w-full max-w-2xl">
      <ProductGrid bare variant="list" products={listItems} listLabel="Search results" cardProps={{ aspect: "1:1", saleStyle: "label", rangeStyle: "range" }} />
    </div>
  );
}
