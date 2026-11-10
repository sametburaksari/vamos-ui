"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input, TreeView, type TreeNode } from "@vamos-cms/ui";

const org: TreeNode[] = [
  {
    id: "ceo",
    label: "Office of the CEO",
    children: [
      { id: "finance", label: "Finance", children: [{ id: "fp", label: "Financial planning" }, { id: "ap", label: "Accounts payable" }] },
      {
        id: "eng",
        label: "Engineering",
        children: [
          { id: "platform", label: "Platform", children: [{ id: "sre", label: "Site reliability" }, { id: "data", label: "Data infrastructure" }] },
          { id: "apps", label: "Applications", children: [{ id: "web", label: "Web" }, { id: "ios", label: "iOS" }, { id: "android", label: "Android" }] },
        ],
      },
      { id: "people", label: "People", children: [{ id: "ta", label: "Talent acquisition" }, { id: "ld", label: "Learning & development" }] },
      { id: "sales", label: "Sales", children: [{ id: "smb", label: "SMB · İzmir" }, { id: "ent", label: "Enterprise · İstanbul" }] },
    ],
  },
];

export default function TreeViewFilter() {
  const [query, setQuery] = React.useState("data");
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Input aria-label="Filter departments" placeholder="Filter departments…" value={query} onChange={(e) => setQuery(e.target.value)} leading={<Search />} clearable />
      <div className="rounded-ui border border-line bg-surface p-1.5">
        <TreeView aria-label="Departments" data={org} filter={query} defaultExpanded={["ceo"]} size="sm" />
      </div>
    </div>
  );
}
