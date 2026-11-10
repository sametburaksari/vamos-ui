"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge, Input, cn } from "@vamos-cms/ui";
import { directory, type DirectoryCategory } from "@/lib/directory";

const categories: ("All" | DirectoryCategory)[] = ["All", "Components", "Blocks", "Charts", "Locale"];

export function DirectoryList() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<(typeof categories)[number]>("All");
  const query = q.trim().toLocaleLowerCase();
  const items = directory.filter(
    (e) => (cat === "All" || e.category === cat) && (!query || `${e.name} ${e.description}`.toLocaleLowerCase().includes(query)),
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input leading={<Search />} placeholder="Search registries…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full max-w-xs" aria-label="Search registries" />
        <div role="group" aria-label="Category" className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              className={cn("rounded-full border px-3 py-1 text-[12.5px] transition focus-ring", cat === c ? "border-fg bg-fg text-scene" : "border-field-border text-fg-muted hover:text-fg")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((e, i) => {
          const open = e.status === "open-slot";
          const body = (
            <>
              <div className="flex items-center gap-2">
                <span className={cn("font-mono text-[14px] font-medium", open ? "text-fg-subtle" : "text-fg")}>{e.name}</span>
                <Badge tone={e.status === "first-party" ? "accent" : e.status === "verified" ? "success" : "outline"}>{e.status === "open-slot" ? "Open slot" : e.status}</Badge>
                <span className="ms-auto text-[11.5px] text-fg-subtle">{e.category}</span>
              </div>
              <p className="mt-1.5 text-[13px] text-fg-muted">{e.description}</p>
            </>
          );
          return (
            <li key={`${e.name}-${i}`}>
              {e.href ? (
                <Link href={e.href} className={cn("block h-full rounded-ui p-4 transition focus-ring", open ? "border border-dashed border-field-border hover:border-field-border-hover" : "surface hover:bg-hover")}>{body}</Link>
              ) : (
                <div className="surface h-full rounded-ui p-4">{body}</div>
              )}
            </li>
          );
        })}
        {items.length === 0 && <li className="text-[13px] text-fg-subtle">No registries match.</li>}
      </ul>
    </div>
  );
}
