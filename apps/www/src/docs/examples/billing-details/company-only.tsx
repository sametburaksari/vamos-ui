"use client";

import { BillingDetailsFields } from "@vamos-ui/react/business";
import { trAddressWithNeighbourhoods } from "@vamos-ui/react/locale-data/tr-neighbourhoods";

// A B2B panel: companies only, phone required, neighbourhood picker in the address.
export default function BillingDetailsCompanyOnly() {
  return (
    <BillingDetailsFields
      types={["company"]}
      phone="required"
      legend="Invoice party"
      addressProps={{ sources: { TR: trAddressWithNeighbourhoods } }}
      defaultValue={{ type: "company", address: { country: "TR" } }}
      className="w-full max-w-xl"
    />
  );
}
