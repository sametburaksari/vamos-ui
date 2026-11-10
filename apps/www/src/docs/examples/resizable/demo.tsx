import { FileText, Folder } from "lucide-react";
import { ResizableGroup, ResizableHandle, ResizablePanel } from "@vamos-ui/react";

const folders = [
  { name: "Contracts", count: 18 },
  { name: "Invoices", count: 64 },
  { name: "Brand assets", count: 31 },
  { name: "Menus", count: 9 },
];

const files = [
  { name: "Northwind — master services agreement.pdf", size: "412 KB", edited: "Nov 4" },
  { name: "Kadıköy Bistro — renewal 2027.pdf", size: "286 KB", edited: "Oct 29" },
  { name: "Lumen Architects — NDA.pdf", size: "118 KB", edited: "Oct 12" },
];

export default function ResizableDemo() {
  return (
    <ResizableGroup className="h-64 w-full max-w-2xl rounded-ui-lg border border-line text-sm">
      <ResizablePanel id="nav" defaultSize="30%" minSize="20%">
        <ul className="grid gap-0.5 p-2">
          {folders.map((f, i) => (
            <li key={f.name} className={`flex items-center gap-2 rounded-ui-sm px-2 py-1.5 ${i === 0 ? "bg-selected text-fg" : "text-fg-muted"}`}>
              <Folder className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              <span className="text-xs tabular text-fg-subtle">{f.count}</span>
            </li>
          ))}
        </ul>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize folders" />
      <ResizablePanel id="content" minSize="30%">
        <ul className="divide-y divide-line px-3">
          {files.map((f) => (
            <li key={f.name} className="flex items-center gap-2.5 py-2.5">
              <FileText className="size-4 shrink-0 text-fg-subtle" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-fg">{f.name}</span>
              <span className="shrink-0 text-xs tabular text-fg-subtle">
                {f.size} · {f.edited}
              </span>
            </li>
          ))}
        </ul>
      </ResizablePanel>
    </ResizableGroup>
  );
}
