"use client";

import * as React from "react";
import { VersionHistory, type Version } from "@vamos-cms/ui";

const bodies: Record<string, string> = {
  v4: `# QR menus: the complete guide for restaurants

Printed menus cost a restaurant up to $1,800 a year in reprints.
A QR menu updates in seconds and works on every phone.

## What you need
- A menu builder with photos and allergens
- Table stickers or tent cards
- Ten minutes to train your staff

Book a free 20-minute demo and we'll set up your first menu with you.`,
  v3: `# QR menus: the complete guide for restaurants

Printed menus cost a restaurant up to $1,200 a year in reprints.
A QR menu updates in seconds and works on any phone.

## What you need
- A menu builder with photos
- Table stickers or tent cards

Book a demo and we'll set up your first menu.`,
  v2: `# QR menus: a guide for restaurants

Printed menus are expensive to reprint.
A QR menu updates in seconds.

Book a demo and we'll set up your first menu.`,
  v1: `# QR menus

Draft — outline only.`,
};

const initial: Version[] = [
  { id: "v4", createdAt: "2026-11-10T09:12:00Z", label: "v4 · Pricing and allergens", author: { name: "İlker Şahin" }, current: true, summary: "Updated reprint cost, added allergens and staff training." },
  { id: "v3", createdAt: "2026-11-08T16:40:00Z", label: "v3", author: { name: "Meltem Öz" }, kind: "published" },
  { id: "v2", createdAt: "2026-11-07T11:05:00Z", label: "v2", author: { name: "İlker Şahin" }, kind: "autosave" },
  { id: "v1", createdAt: "2026-11-05T08:30:00Z", label: "v1 · Outline", author: { name: "İlker Şahin" } },
];

export default function VersionHistoryDemo() {
  const [versions, setVersions] = React.useState(initial);
  return (
    <VersionHistory
      className="w-full"
      versions={versions}
      loadVersion={async (id) => {
        await new Promise((r) => setTimeout(r, 250));
        return bodies[id] ?? bodies[id.split("-")[0]!] ?? "";
      }}
      onRestore={async (id) => {
        await new Promise((r) => setTimeout(r, 500));
        const id2 = `${id}-restored-${versions.length}`;
        bodies[id2] = bodies[id]!;
        setVersions((all) => [
          { id: id2, createdAt: new Date().toISOString(), label: `v${all.length + 1} · Restored ${id}`, author: { name: "You" }, current: true, kind: "manual" },
          ...all.map((v) => ({ ...v, current: false })),
        ]);
      }}
    />
  );
}
