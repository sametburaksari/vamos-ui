"use client";

import { arrayRecordSource } from "@vamos-cms/ui";
import { LineItems } from "@vamos-cms/ui/business";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  unit: string;
  tax: string;
}

const products: Product[] = [
  { id: "p1", sku: "VT-PVC-01", name: "NFC business card, PVC", price: "500.00", unit: "pcs", tax: "20" },
  { id: "p2", sku: "VT-MET-02", name: "NFC business card, metal", price: "1250.00", unit: "pcs", tax: "20" },
  { id: "p3", sku: "VR-POS-12", name: "Restaurant POS licence, 12 months", price: "9600.00", unit: "year", tax: "20" },
  { id: "p4", sku: "SV-INST", name: "On-site installation", price: "1800.00", unit: "day", tax: "20" },
  { id: "p5", sku: "SV-TRAIN", name: "Staff training (2 hours)", price: "900.00", unit: "session", tax: "20" },
];

const productSource = arrayRecordSource("products", products, {
  getId: (p) => p.id,
  getLabel: (p) => p.name,
  getDescription: (p) => `${p.sku} · ₺${p.price}`,
  getKeywords: (p) => [p.sku],
});

export default function LineItemsItemPicker() {
  return (
    <div className="w-full">
      <LineItems<Product>
        aria-label="Order lines"
        currency="TRY"
        itemSource={productSource}
        onItemPick={(p) => ({ description: p.name, unitPrice: p.price, unit: p.unit, taxRate: p.tax })}
        columns={["item", "description", "quantity", "unitPrice", "tax", "total"]}
        defaultValue={[{ id: "o1", itemId: "p3", description: "Restaurant POS licence, 12 months", quantity: "1", unit: "year", unitPrice: "9600.00", taxRate: "20" }]}
      />
    </div>
  );
}
