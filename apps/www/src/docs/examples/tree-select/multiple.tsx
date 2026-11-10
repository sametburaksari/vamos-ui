"use client";

import * as React from "react";
import { Field, TreeSelect, type TreeNode } from "@vamos-ui/react";

const regions: TreeNode[] = [
  {
    id: "emea",
    label: "EMEA",
    children: [
      { id: "tr", label: "Türkiye", children: [{ id: "tr-ist", label: "İstanbul" }, { id: "tr-ank", label: "Ankara" }, { id: "tr-izm", label: "İzmir" }] },
      { id: "de", label: "Germany", children: [{ id: "de-ber", label: "Berlin" }, { id: "de-muc", label: "Munich" }] },
      { id: "nl", label: "Netherlands" },
    ],
  },
  {
    id: "amer",
    label: "Americas",
    children: [
      { id: "us", label: "United States", children: [{ id: "us-east", label: "US East" }, { id: "us-west", label: "US West" }] },
      { id: "ca", label: "Canada" },
    ],
  },
];

export default function TreeSelectMultiple() {
  const [territories, setTerritories] = React.useState<string[]>(["tr"]);
  return (
    <div className="grid w-full max-w-md gap-2">
      <Field label="Partner territories" hint="Check a country to cover all of its cities. The value lists the topmost checked nodes.">
        <TreeSelect multiple valueMode="parent" nodes={regions} value={territories} onValueChange={setTerritories} placeholder="Add territory" />
      </Field>
      <p className="font-mono text-xs text-fg-subtle">value: {JSON.stringify(territories)}</p>
    </div>
  );
}
