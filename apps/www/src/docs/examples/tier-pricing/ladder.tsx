"use client";

import * as React from "react";
import { Slider, TierPricing, type PriceTier } from "@vamos-ui/react";

const tiers: PriceTier[] = [
  { min: 1, price: 2.4, label: "Single" },
  { min: 100, price: 2.1, label: "Box" },
  { min: 500, price: 1.85, label: "Carton" },
  { min: 2000, price: 1.6, label: "Pallet" },
];

export default function TierPricingLadder() {
  const [qty, setQty] = React.useState(240);
  return (
    <div className="grid w-full max-w-xl gap-6">
      <Slider value={[qty]} onValueChange={(v) => setQty(v[0] ?? qty)} min={1} max={3000} step={10} withInputs thumbLabels={["Labels"]} />
      <TierPricing variant="ladder" tiers={tiers} quantity={qty} onQuantityChange={setQty} unit="label" showSaving={false} />
    </div>
  );
}
