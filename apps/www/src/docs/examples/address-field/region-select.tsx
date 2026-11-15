"use client";

import * as React from "react";
import { Field, RegionSelect } from "@vamos-ui/react";
import { trAddress } from "@vamos-ui/react/locale-data";

export default function RegionSelectExample() {
  const [province, setProvince] = React.useState("Antalya");
  const [district, setDistrict] = React.useState("");
  const [state, setState] = React.useState("CA");
  const [prefecture, setPrefecture] = React.useState("");
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
      <Field label="US state">
        <RegionSelect country="US" value={state} onValueChange={setState} size="sm" />
      </Field>
      <Field label="Prefecture">
        <RegionSelect country="JP" value={prefecture} onValueChange={setPrefecture} placeholder="All prefectures" size="sm" />
      </Field>
      <p className="text-xs text-fg-subtle sm:col-span-2">
        Stored values: <code>{state || "—"}</code> · <code>{prefecture || "—"}</code> (US states as the post writes them, ISO 3166-2 codes on the option).
      </p>
    </div>
  );
}
