"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { HierarchyChart, HierarchyNodeCard, Input, Toggle } from "@vamos-cms/ui";

interface Page {
  id: string;
  parentId: string | null;
  label: string;
  path: string;
}

const pages: Page[] = [
  { id: "home", parentId: null, label: "Home", path: "/" },
  { id: "menu", parentId: "home", label: "Menu", path: "/menu" },
  { id: "breakfast", parentId: "menu", label: "Breakfast", path: "/menu/breakfast" },
  { id: "dinner", parentId: "menu", label: "Dinner", path: "/menu/dinner" },
  { id: "wine", parentId: "menu", label: "Wine list", path: "/menu/wine" },
  { id: "visit", parentId: "home", label: "Visit us", path: "/visit" },
  { id: "hours", parentId: "visit", label: "Opening hours", path: "/visit/hours" },
  { id: "parking", parentId: "visit", label: "Parking & access", path: "/visit/parking" },
  { id: "events", parentId: "home", label: "Private events", path: "/events" },
  { id: "weddings", parentId: "events", label: "Weddings", path: "/events/weddings" },
  { id: "journal", parentId: "home", label: "Journal", path: "/journal" },
];

export default function HierarchyListView() {
  const [q, setQ] = React.useState("");
  const [list, setList] = React.useState(false);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Find a page" placeholder="Find a page" value={q} onChange={(e) => setQ(e.target.value)} leading={<Search />} className="max-w-60" />
        <Toggle pressed={list} onPressedChange={setList} variant="outline" size="sm">
          List view
        </Toggle>
      </div>
      <HierarchyChart
        aria-label="Site structure"
        view={list ? "list" : "chart"}
        nodes={pages}
        nodeSize={{ width: 172, height: 52 }}
        gap={{ x: 16, y: 44 }}
        height="24rem"
        highlight={q}
        getLabel={(p) => p.label}
        getDescription={(p) => p.path}
        renderNode={(p) => <HierarchyNodeCard title={p.label} subtitle={<span className="font-mono">{p.path}</span>} />}
      />
    </div>
  );
}
