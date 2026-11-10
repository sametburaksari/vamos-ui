"use client";

import * as React from "react";
import { LineItems, type LineDiscount } from "@vamos-ui/react/business";

export default function LineItemsDiscounts() {
  // Row discounts toggle between % and an amount; the document discount is spread pro-rata over the lines.
  const [doc, setDoc] = React.useState<LineDiscount | undefined>({ type: "percent", value: "5" });
  return (
    <div className="w-full">
      <LineItems
        aria-label="Annual plan quote"
        currency="USD"
        documentDiscount={doc}
        onDocumentDiscountChange={setDoc}
        columns={["description", "quantity", "unitPrice", "discount", "tax", "total"]}
        defaultValue={[
          { id: "d1", description: "Growth plan — 25 seats, 12 months", quantity: "25", unitPrice: "348.00", taxRate: "0", discount: { type: "percent", value: "15" } },
          { id: "d2", description: "Onboarding & data migration", quantity: "1", unitPrice: "2400.00", taxRate: "0", discount: { type: "amount", value: "400.00" } },
          { id: "d3", description: "Priority support add-on", quantity: "12", unitPrice: "150.00", taxRate: "0" },
        ]}
      />
    </div>
  );
}
