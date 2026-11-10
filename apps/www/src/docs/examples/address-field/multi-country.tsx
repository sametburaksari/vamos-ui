"use client";

import * as React from "react";
import { AddressField, formatAddress, type Address } from "@vamos-ui/react";

export default function AddressMultiCountry() {
  const [address, setAddress] = React.useState<Address>({ country: "DE", line1: "Torstraße 109", region2: "Berlin", postalCode: "10119" });
  return (
    <div className="grid w-full max-w-xl gap-4">
      <AddressField legend="Billing address" countries={["TR", "DE", "NL", "GB", "US", "AE"]} value={address} onValueChange={setAddress} />
      <div className="rounded-ui bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-fg-muted">
        {formatAddress(address).map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}
