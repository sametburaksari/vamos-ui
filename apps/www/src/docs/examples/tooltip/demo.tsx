import { Bold, Italic, Link2, List, Quote } from "lucide-react";
import { IconButton, Separator, TooltipProvider } from "@vamos-ui/react";

export default function TooltipDemo() {
  return (
    // One provider at the app root: moving between buttons opens the next tooltip instantly.
    <TooltipProvider>
      <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5 rounded-ui surface p-1">
        <IconButton label="Bold" shortcut="mod+b" size="sm">
          <Bold />
        </IconButton>
        <IconButton label="Italic" shortcut="mod+i" size="sm">
          <Italic />
        </IconButton>
        <IconButton label="Insert link" shortcut="mod+k" size="sm">
          <Link2 />
        </IconButton>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <IconButton label="Bulleted list" size="sm">
          <List />
        </IconButton>
        <IconButton label="Pull quote" size="sm">
          <Quote />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}
