"use client";

import { Folder, Image as ImageIcon } from "lucide-react";
import { TreeView, type TreeNode } from "@vamos-ui/react";

const folder = (id: string, label: string, count: number): TreeNode => ({ id, label, hasChildren: true, icon: <Folder />, badge: count });

const roots = [folder("brand", "Brand assets", 3), folder("blog", "Blog images", 2), folder("products", "Product photos", 0)];

const db: Record<string, TreeNode[]> = {
  brand: [folder("logos", "Logos", 2), { id: "brand-guide", label: "brand-guide.pdf" }, { id: "palette", label: "palette.svg" }],
  logos: [{ id: "logo-dark", label: "logo-dark.svg", icon: <ImageIcon /> }, { id: "logo-light", label: "logo-light.svg", icon: <ImageIcon /> }],
  blog: [{ id: "cover-gdpr", label: "cover-gdpr-banner.jpg", icon: <ImageIcon /> }, { id: "cover-pricing", label: "cover-pricing.jpg", icon: <ImageIcon /> }],
  products: [],
};

let calls = 0;
// GET /media/folders/:id — the second request in this demo fails once, to show the retry row.
async function loadFolder(node: TreeNode, signal: AbortSignal) {
  await new Promise((r) => setTimeout(r, 600));
  signal.throwIfAborted();
  if (++calls === 2) throw new Error("Timed out");
  return db[node.id] ?? [];
}

export default function TreeViewLazy() {
  return (
    <div className="w-full max-w-sm rounded-ui border border-line bg-surface p-1.5">
      <TreeView aria-label="Media folders" data={roots} loadChildren={loadFolder} selectionMode="single" />
    </div>
  );
}
