"use client";

import * as React from "react";
import { AddressField, type Address } from "@vamos-ui/react";
import { citiesFromUrl } from "@vamos-ui/react/locale-data";

// The city files this site publishes (https://ui.vamos.ist/data/cities/{cc}.json). Serve your own
// copy with citiesFromUrl("/data/cities/{cc}.json"); one file loads per country, on first focus.
const cities = citiesFromUrl("/data/cities/{cc}.json");

export default function AddressCities() {
  const [address, setAddress] = React.useState<Address>({ country: "DE", line1: "Leopoldstraße 21" });
  return (
    <div className="grid w-full max-w-xl gap-3">
      <AddressField legend="Shipping address" countries={["DE", "US", "JP", "BR", "IT", "TR"]} cities={cities} value={address} onValueChange={setAddress} />
      <p className="text-xs text-fg-subtle">
        City suggestions: data ©{" "}
        <a className="underline underline-offset-2" href="https://www.geonames.org" target="_blank" rel="noreferrer">
          GeoNames
        </a>
        , CC BY 4.0.
      </p>
    </div>
  );
}
