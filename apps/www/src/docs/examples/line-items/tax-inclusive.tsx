"use client";

import { LineItems } from "@vamos-cms/ui/business";

export default function LineItemsTaxInclusive() {
  // Retail prices already include VAT; the summary shows the net base per rate.
  return (
    <div className="w-full">
      <LineItems
        aria-label="Order lines"
        currency="GBP"
        pricesIncludeTax
        columns={["description", "quantity", "unitPrice", "tax", "total"]}
        defaultValue={[
          { id: "r1", description: "Merino crew jumper, charcoal, M", quantity: "1", unitPrice: "89.00", taxRate: "20" },
          { id: "r2", description: "Children's rain boots, size 28", quantity: "2", unitPrice: "24.00", taxRate: "0" },
          { id: "r3", description: "Gift wrapping", quantity: "1", unitPrice: "4.50", taxRate: "20" },
        ]}
      />
    </div>
  );
}
