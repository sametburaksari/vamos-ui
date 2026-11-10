"use client";

import * as React from "react";
import { Field, RegionSelect } from "@vamos-cms/ui";
import { trAddress } from "@vamos-cms/ui/locale-data";

export default function RegionSelectExample() {
  const [province, setProvince] = React.useState("Antalya");
  const [district, setDistrict] = React.useState("");
  return (
    <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
      <Field label="Province">
        <RegionSelect
          source={trAddress}
          level="province"
          value={province}
          onValueChange={(p) => {
            setProvince(p);
            setDistrict("");
          }}
          size="sm"
        />
      </Field>
      <Field label="District">
        <RegionSelect source={trAddress} level="district" province={province} value={district} onValueChange={setDistrict} placeholder="All districts" size="sm" />
      </Field>
      <p className="text-xs text-fg-subtle sm:col-span-2">Filtering 14 spa partners by location — {district ? `${district}, ${province}` : province}.</p>
    </div>
  );
}
