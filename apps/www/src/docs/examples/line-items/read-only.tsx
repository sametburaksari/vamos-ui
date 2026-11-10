import { LineItems } from "@vamos-cms/ui/business";

export default function LineItemsReadOnly() {
  // Printable summary for an invoice preview or a PDF: no inputs, numbered rows.
  return (
    <div className="w-full">
      <LineItems
        readOnly
        aria-label="Invoice INV-2026-0418"
        currency="USD"
        columns={["description", "quantity", "unit", "unitPrice", "tax", "total"]}
        defaultValue={[
          { id: "i1", description: "Brand identity refresh", quantity: "1", unit: "project", unitPrice: "6800.00", taxRate: "0" },
          { id: "i2", description: "Website design system (Figma)", quantity: "24", unit: "hour", unitPrice: "120.00", taxRate: "0" },
          { id: "i3", description: "Stock photography licence", quantity: "8", unit: "image", unitPrice: "45.00", taxRate: "0" },
        ]}
      />
    </div>
  );
}
