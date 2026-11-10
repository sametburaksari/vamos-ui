"use client";

import { LineItems } from "@vamos-cms/ui/business";

export default function LineItemsMobile() {
  // Container query: under 40rem the rows stack into cards, each field keeps its header as a label.
  return (
    <div className="w-full max-w-[22rem] rounded-ui-lg border border-dashed border-line p-2">
      <LineItems
        aria-label="Expense claim"
        currency="EUR"
        columns={["description", "quantity", "unitPrice", "tax", "total"]}
        defaultValue={[
          { id: "e1", description: "Train Berlin → Hamburg", quantity: "2", unitPrice: "79.90", taxRate: "7" },
          { id: "e2", description: "Client dinner, 4 people", quantity: "1", unitPrice: "212.40", taxRate: "19" },
        ]}
        taxRates={[
          { value: "0", label: "0%" },
          { value: "7", label: "7%" },
          { value: "19", label: "19%" },
        ]}
      />
    </div>
  );
}
