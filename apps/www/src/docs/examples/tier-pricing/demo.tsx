"use client";

import * as React from "react";
import { TierPricing, type PriceTier } from "@vamos-ui/react";

const tiers: PriceTier[] = [
  { min: 1, price: 52 },
  { min: 10, price: 48, label: "Trade" },
  { min: 25, price: 45, label: "Bulk" },
  { min: 60, price: 41.5, label: "Pallet" },
];

export default function TierPricingDemo() {
  const [cases, setCases] = React.useState(8);
  return (
    <div className="w-full max-w-lg">
      <TierPricing tiers={tiers} quantity={cases} onQuantityChange={setCases} quantityInput unit="case" maxQuantity={500} />
    </div>
  );
}
