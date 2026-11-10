import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge, IconButton, TooltipProvider } from "@vamos-ui/react";

const posts = [
  { title: "Spring menu: five new small plates", author: "Leyla Aksoy", status: "Published", tone: "success" },
  { title: "How we cut delivery times by 18%", author: "Daniel Okafor", status: "Draft", tone: "neutral" },
  { title: "Behind the bar with our head mixologist", author: "Mira Castell", status: "Scheduled", tone: "info" },
] as const;

export default function TooltipTableActions() {
  return (
    <TooltipProvider>
      <div className="w-full max-w-xl divide-y divide-line overflow-hidden rounded-ui-lg surface">
        {posts.map((p) => (
          <div key={p.title} className="group flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{p.title}</p>
              <p className="text-xs text-fg-subtle">{p.author}</p>
            </div>
            <Badge tone={p.tone}>{p.status}</Badge>
            {/* Inside a TooltipProvider every IconButton shows its label as a tooltip. */}
            <div className="flex items-center">
              <IconButton label="Preview" size="xs">
                <Eye />
              </IconButton>
              <IconButton label="Edit" shortcut="e" size="xs">
                <Pencil />
              </IconButton>
              <IconButton label="Duplicate" size="xs">
                <Copy />
              </IconButton>
              <IconButton label="Move to trash" variant="danger-ghost" size="xs">
                <Trash2 />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
