"use client";

import * as React from "react";
import { FileText, LayoutGrid, List, PenTool, Search, Upload } from "lucide-react";
import { Button, Input, ListContent, ListFooter, ListLayout, ListToolbar, ListViewSwitch, PageHeader } from "@vamos-cms/ui";

// Sample photos (Unsplash); files without a preview show their type instead.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=400&h=300&q=70&auto=format&fit=crop`;

const media = [
  { name: "dining-room-dusk.jpg", size: "2.4 MB", src: photo("1517248135467-4c7edcad34c4") },
  { name: "menu-spring-2027.pdf", size: "860 KB", icon: FileText },
  { name: "team-offsite.jpg", size: "3.1 MB", src: photo("1522071820081-009f0129c71c") },
  { name: "logo-mark.svg", size: "12 KB", icon: PenTool },
  { name: "grilled-sea-bass.webp", size: "1.2 MB", src: photo("1504674900247-0877df9cc836") },
  { name: "studio-window.jpg", size: "2.9 MB", src: photo("1497366216548-37526070297c") },
];

// CMS media library: the view switch swaps a grid for a compact list.
export default function ListLayoutGrid() {
  const [view, setView] = React.useState("grid");
  return (
    <ListLayout stickyToolbar={false} className="w-full">
      <PageHeader title="Media" description="6 of 418 files · 1.9 GB used" actions={<Button variant="primary"><Upload /> Upload</Button>} />
      <ListToolbar
        search={<Input leading={<Search />} placeholder="Search files" aria-label="Search files" />}
        viewSwitch={
          <ListViewSwitch
            value={view}
            onValueChange={setView}
            options={[
              { value: "grid", label: "Grid", icon: <LayoutGrid /> },
              { value: "list", label: "List", icon: <List /> },
            ]}
          />
        }
      />
      <ListContent>
        {view === "grid" ? (
          <ul className="grid grid-cols-2 gap-3 @xl/list:grid-cols-3 @4xl/list:grid-cols-6">
            {media.map((m) => (
              <li key={m.name} className="surface overflow-hidden rounded-ui">
                {m.src ? (
                  <img src={m.src} alt="" loading="lazy" className="aspect-[4/3] w-full bg-surface-2 object-cover" />
                ) : m.icon ? (
                  <div aria-hidden className="grid aspect-[4/3] place-items-center bg-surface-2 text-fg-subtle">
                    <span className="grid justify-items-center gap-1.5">
                      <m.icon className="size-6" strokeWidth={1.5} />
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em]">{m.name.split(".").pop()}</span>
                    </span>
                  </div>
                ) : null}
                <div className="px-2.5 py-2">
                  <p className="truncate text-[12.5px] font-medium">{m.name}</p>
                  <p className="text-[11.5px] text-fg-subtle">{m.size}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-line rounded-ui-lg border border-line">
            {media.map((m) => (
              <li key={m.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{m.name}</span>
                <span className="tabular text-[13px] text-fg-subtle">{m.size}</span>
              </li>
            ))}
          </ul>
        )}
      </ListContent>
      <ListFooter>
        <Button size="sm">Load more</Button>
        <span className="text-[13px] text-fg-subtle">Showing 6 of 418</span>
      </ListFooter>
    </ListLayout>
  );
}
