import { Bell, Menu, Plus, Search } from "lucide-react";
import { Button, IconButton } from "@vamos-ui/react";

export function TopBar({ title, onMenu }: { title: string; onMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-[color-mix(in_srgb,var(--scene)_72%,transparent)] px-4 backdrop-blur-xl md:px-6">
      {onMenu && (
        <IconButton size="sm" label="Open menu" className="md:hidden" onClick={onMenu}>
          <Menu />
        </IconButton>
      )}
      <span className="min-w-0 truncate text-[13px] font-medium text-fg-muted">{title}</span>
      <div className="flex-1" />
      <button className="hidden h-8 w-64 items-center gap-2 rounded-full border border-field-border bg-field px-3 text-[13px] text-fg-subtle hover:border-field-border-hover focus-ring md:flex">
        <Search className="size-3.5" />
        <span className="flex-1 text-start">Search or run a command…</span>
        <kbd className="rounded border border-line px-1 font-mono text-[10.5px]">⌘K</kbd>
      </button>
      <IconButton size="sm" label="Notifications"><Bell /></IconButton>
      <Button variant="primary" size="sm"><Plus /> New</Button>
      <span className="grid size-8 place-items-center rounded-full bg-fg text-[12px] font-semibold text-scene">SB</span>
    </header>
  );
}
