"use client";

import * as React from "react";
import { Download, Folder, FolderInput, Link2, Pencil, Star, Trash2 } from "lucide-react";
import { ContextMenu, cn, type MenuEntry } from "@vamos-cms/ui";

const files = [
  { name: "harbour-sunrise.jpg", size: "2.4 MB", hue: "var(--accent-soft)" },
  { name: "spring-menu-cover.png", size: "1.1 MB", hue: "color-mix(in srgb, var(--info) 18%, transparent)" },
  { name: "team-offsite-2026.jpg", size: "3.8 MB", hue: "color-mix(in srgb, var(--warning) 18%, transparent)" },
  { name: "logo-mark.svg", size: "12 KB", hue: "var(--surface-2)" },
  { name: "store-front-night.jpg", size: "4.2 MB", hue: "color-mix(in srgb, var(--success) 16%, transparent)" },
  { name: "press-release.pdf", size: "208 KB", hue: "color-mix(in srgb, var(--danger) 12%, transparent)" },
];

export default function ContextMenuGrid() {
  const [starred, setStarred] = React.useState<string[]>(["logo-mark.svg"]);
  const [selected, setSelected] = React.useState<string | null>(null);

  const actions = (name: string): MenuEntry[] => [
    { type: "label", label: name },
    { id: "rename", label: "Rename", icon: <Pencil />, shortcut: "f2" },
    { id: "link", label: "Copy link", icon: <Link2 />, shortcut: "mod+shift+c" },
    { id: "download", label: "Download", icon: <Download /> },
    {
      type: "checkbox",
      id: "star",
      label: "Starred",
      checked: starred.includes(name),
      onCheckedChange: (on) => setStarred((s) => (on ? [...s, name] : s.filter((x) => x !== name))),
    },
    {
      type: "submenu",
      id: "move",
      label: "Move to",
      icon: <FolderInput />,
      items: ["Campaigns", "Press kit", "Product shots"].map((f) => ({ id: f, label: f, icon: <Folder /> })),
    },
    { type: "separator" },
    { id: "delete", label: "Delete", icon: <Trash2 />, tone: "danger", shortcut: "delete" },
  ];

  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((f) => (
        <ContextMenu key={f.name} items={actions(f.name)} onOpenChange={(open) => open && setSelected(f.name)}>
          <button
            type="button"
            onClick={() => setSelected(f.name)}
            className={cn(
              "group grid gap-2 rounded-ui-lg p-1.5 text-start focus-ring",
              selected === f.name ? "bg-accent-soft ring-1 ring-[color-mix(in_srgb,var(--accent-ink)_35%,transparent)]" : "hover:bg-hover",
            )}
          >
            <span className="relative block aspect-[4/3] rounded-ui border border-line" style={{ background: f.hue }}>
              {starred.includes(f.name) ? <Star aria-hidden className="absolute end-2 top-2 size-3.5 fill-current text-fg" /> : null}
            </span>
            <span className="grid px-0.5">
              <span className="truncate text-[13px] font-medium text-fg">{f.name}</span>
              <span className="text-xs tabular text-fg-subtle">
                {f.size}
                {starred.includes(f.name) ? <span className="sr-only">, starred</span> : null}
              </span>
            </span>
          </button>
        </ContextMenu>
      ))}
    </div>
  );
}
