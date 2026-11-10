"use client";

import * as React from "react";
import { Field, RecordPicker, arrayRecordSource } from "@vamos-cms/ui";

const first = ["Ayla", "Ben", "Chloé", "Deniz", "Elif", "Farah", "Gabriel", "Hana", "Ilker", "Jonas", "Kerem", "Lina", "Mateo", "Nora", "Omar", "Pınar"];
const last = ["Aksoy", "Brooks", "Çelik", "Duarte", "Ekström", "Fischer", "Güneş", "Hartley", "Ivanova", "Jansen"];
const plans = ["Starter", "Growth", "Scale"];

const customers = Array.from({ length: 160 }, (_, i) => {
  const name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`;
  return { id: `cus_${1000 + i}`, name, email: `${name.split(" ")[0]!.toLowerCase()}.${1000 + i}@mail.example`, plan: plans[i % 3]! };
});

const customerSource = arrayRecordSource("customers", customers, {
  getId: (c) => c.id,
  getLabel: (c) => c.name,
  getDescription: (c) => `${c.email} · ${c.plan}`,
  getKeywords: (c) => [c.id, c.plan],
  getAvatar: (c) => ({ name: c.name }),
  pageSize: 20,
  delay: 250,
});

export default function RecordPickerBrowse() {
  const [ids, setIds] = React.useState<string[]>([]);
  return (
    <div className="w-full max-w-md">
      <Field label="Campaign recipients" hint="160 customers — search, load more, or open Browse all for a bigger list.">
        <RecordPicker multiple browse source={customerSource} value={ids} onValueChange={setIds} placeholder="Add customers" />
      </Field>
    </div>
  );
}
