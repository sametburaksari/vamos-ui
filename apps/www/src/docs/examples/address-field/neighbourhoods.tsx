"use client";

import * as React from "react";
import { AddressField, formatAddress, type Address } from "@vamos-ui/react";
import { trAddressWithNeighbourhoods } from "@vamos-ui/react/locale-data/tr-neighbourhoods";

// Each province's neighbourhoods load as their own small chunk, the first time it is picked.
const sources = { TR: trAddressWithNeighbourhoods };

export default function AddressNeighbourhoods() {
  const [address, setAddress] = React.useState<Address>({ country: "TR", region1: "İstanbul", region2: "Maltepe" });
  return (
    <div className="grid w-full max-w-xl gap-4">
      <AddressField
        legend="Delivery address"
        hint="Picking a neighbourhood fills its postal code; a code you type yourself is kept."
        sources={sources}
        countries={["TR"]}
        value={address}
        onValueChange={setAddress}
        required={["region1", "region2", "region3", "line1"]}
      />
      <div className="rounded-ui bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-fg-muted">
        {formatAddress(address, { includeCountry: false }).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
