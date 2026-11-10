import { Eye, Search, Settings, Trash2 } from "lucide-react";
import { IconButton } from "@vamos-ui/react";

export default function IconButtonDemo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* label is required: used as the accessible name and the tooltip */}
      <IconButton label="Settings">
        <Settings />
      </IconButton>
      <IconButton label="Preview" variant="secondary">
        <Eye />
      </IconButton>
      <IconButton label="Search" variant="soft" size="sm">
        <Search />
      </IconButton>
      <IconButton label="Delete" variant="danger-ghost" size="xs">
        <Trash2 />
      </IconButton>
    </div>
  );
}
