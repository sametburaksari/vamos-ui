"use client";

import * as React from "react";
import { Image as ImageIcon, LayoutGrid, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";

const files = [
  { name: "Hero — autumn campaign.jpg", meta: "2400 × 1350 · 1.8 MB" },
  { name: "Team offsite.jpg", meta: "1600 × 1067 · 940 KB" },
  { name: "Store front, Kadıköy.jpg", meta: "1920 × 1280 · 1.2 MB" },
  { name: "Product flat lay.jpg", meta: "2000 × 2000 · 2.1 MB" },
];

export default function TabsSegmented() {
  const [view, setView] = React.useState("grid");
  return (
    <Tabs value={view} onValueChange={setView} className="w-full max-w-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Media library</p>
        <TabsList variant="segmented" size="sm" aria-label="View">
          <TabsTrigger value="list" icon={<List />}>
            List
          </TabsTrigger>
          <TabsTrigger value="grid" icon={<LayoutGrid />}>
            Grid
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="list">
        <ul className="divide-y divide-line rounded-ui border border-line text-sm">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="truncate">{f.name}</span>
              <span className="shrink-0 text-xs tabular text-fg-subtle">{f.meta}</span>
            </li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="grid">
        <ul className="grid grid-cols-4 gap-2">
          {files.map((f) => (
            <li key={f.name} className="grid gap-1.5">
              <div className="grid aspect-square place-items-center rounded-ui border border-line bg-surface-2 text-fg-subtle">
                <ImageIcon className="size-5" aria-hidden />
              </div>
              <span className="truncate text-xs font-medium text-fg">{f.name}</span>
              <span className="-mt-1 truncate text-[11px] tabular text-fg-subtle">{f.meta}</span>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
