import { Bold, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { IconButton, Separator } from "@vamos-cms/ui";

export default function SeparatorToolbar() {
  // Between meaningful groups, decorative={false} announces the separator to screen readers.
  return (
    <div role="toolbar" aria-label="Formatting" className="surface flex h-11 items-center gap-1 rounded-ui px-1.5">
      <IconButton label="Bold" size="sm"><Bold /></IconButton>
      <IconButton label="Italic" size="sm"><Italic /></IconButton>
      <IconButton label="Link" size="sm"><Link2 /></IconButton>
      <Separator orientation="vertical" decorative={false} inset className="mx-1" />
      <IconButton label="Bulleted list" size="sm"><List /></IconButton>
      <IconButton label="Numbered list" size="sm"><ListOrdered /></IconButton>
      <IconButton label="Quote" size="sm"><Quote /></IconButton>
    </div>
  );
}
