import { ClipboardPaste, Copy, RefreshCw, Scissors } from "lucide-react";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@vamos-ui/react";

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-40 w-72 place-items-center rounded-ui-lg border border-dashed border-field-border text-sm text-fg-subtle select-none">
        Right-click here (or long-press)
      </ContextMenuTrigger>
      <ContextMenuContent size="sm">
        <ContextMenuItem icon={<Scissors />} shortcut="mod+x">
          Cut
        </ContextMenuItem>
        <ContextMenuItem icon={<Copy />} shortcut="mod+c">
          Copy
        </ContextMenuItem>
        <ContextMenuItem icon={<ClipboardPaste />} shortcut="mod+v" disabled>
          Paste
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem icon={<RefreshCw />} shortcut="mod+r">
          Reload preview
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
