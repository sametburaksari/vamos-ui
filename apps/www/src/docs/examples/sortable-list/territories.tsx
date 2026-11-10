"use client";

import * as React from "react";
import { Globe2, MapPin } from "lucide-react";
import { Switch, Label, Toaster } from "@vamos-ui/react";
import { SortableTree, moveTreeNode, type SortableTreeMoveEvent } from "@vamos-ui/react/sortable";

interface Territory {
  id: string;
  label: string;
  partner?: string;
  region?: boolean;
  children?: Territory[];
}

const initial: Territory[] = [
  {
    id: "emea",
    label: "EMEA",
    region: true,
    children: [
      { id: "dach", label: "DACH", partner: "Alpine Systems GmbH" },
      { id: "nordics", label: "Nordics", partner: "Fjordline AS" },
      { id: "tr", label: "Türkiye", partner: "Boğaziçi Bilişim" },
    ],
  },
  {
    id: "amer",
    label: "Americas",
    region: true,
    children: [
      { id: "us-west", label: "US West", partner: "Pacific Crest Partners" },
      { id: "latam", label: "Latin America", partner: "Andes Digital" },
    ],
  },
  { id: "apac", label: "APAC", region: true, children: [{ id: "anz", label: "Australia & NZ", partner: "Southern Cross IT" }] },
];

const save = (e: SortableTreeMoveEvent, fail: boolean) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Conflict")) : resolve()), 800));

export default function SortableTreeTerritories() {
  const [tree, setTree] = React.useState(initial);
  const [fail, setFail] = React.useState(false);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Toaster />
      <span className="flex items-center gap-2 text-sm">
        <Switch id="terr-fail" checked={fail} onCheckedChange={setFail} />
        <Label htmlFor="terr-fail">Server rejects the next save</Label>
      </span>
      <div className="rounded-ui-lg border border-line bg-surface p-1.5">
        <SortableTree
          aria-label="Partner territories"
          nodes={tree}
          maxDepth={2}
          canDrop={(c) => {
            const isRegion = initial.some((r) => r.id === c.id);
            if (isRegion && c.parentId) return "Regions stay at the top level";
            if (!isRegion && !c.parentId) return "Territories belong to a region";
            return true;
          }}
          onMove={async (e) => {
            // Optimistic: the tree shows the move right away and rolls back if this rejects.
            await save(e, fail);
            setTree((t) => moveTreeNode(t, e.id, e.parentId, e.index));
          }}
          renderItem={(t) => (
            <>
              {t.region ? <Globe2 aria-hidden className="size-4 shrink-0 text-fg-subtle" /> : <MapPin aria-hidden className="size-4 shrink-0 text-fg-subtle" />}
              <span className={t.region ? "truncate font-semibold" : "truncate"}>{t.label}</span>{" "}
              {t.partner ? (
                // Text only: the row's accessible name is this label, so initials in an avatar would be
                // visible text that is missing from the name (WCAG 2.5.3 label-in-name).
                <span className="ms-auto min-w-0 truncate text-xs text-fg-muted">{t.partner}</span>
              ) : null}
            </>
          )}
        />
      </div>
    </div>
  );
}
