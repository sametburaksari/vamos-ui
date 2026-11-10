"use client";

import * as React from "react";
import { Field, RecordPicker, arrayRecordSource } from "@vamos-ui/react";

interface Vendor {
  id: string;
  name: string;
  category: string;
}

const initial: Vendor[] = [
  { id: "v1", name: "Anadolu Packaging", category: "Packaging" },
  { id: "v2", name: "Brightline Print Co.", category: "Printing" },
  { id: "v3", name: "Cobalt Couriers", category: "Logistics" },
  { id: "v4", name: "Delta Office Supply", category: "Office" },
];

export default function RecordPickerCreate() {
  const [vendors, setVendors] = React.useState(initial);
  const [vendorId, setVendorId] = React.useState<string | null>(null);
  const source = React.useMemo(
    () => arrayRecordSource(`vendors-${vendors.length}`, vendors, { getId: (v) => v.id, getLabel: (v) => v.name, getDescription: (v) => v.category }),
    [vendors],
  );

  return (
    <div className="w-full max-w-sm">
      <Field label="Supplier" hint="Type a new name to add it to your vendor list.">
        <RecordPicker
          source={source}
          value={vendorId}
          onValueChange={setVendorId}
          placeholder="Choose a supplier"
          onCreate={async (name) => {
            await new Promise((r) => setTimeout(r, 400)); // POST /vendors
            const vendor = { id: `v${Date.now()}`, name, category: "New vendor" };
            setVendors((list) => [...list, vendor]);
            return vendor;
          }}
        />
      </Field>
    </div>
  );
}
