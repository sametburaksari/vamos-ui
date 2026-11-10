import { Archive, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, IconButton } from "@vamos-cms/ui";

const deals = [
  { name: "Northwind Logistics — fleet renewal", value: "$48,200", stage: "Negotiation" },
  { name: "Harbor & Pine — POS rollout (14 sites)", value: "$126,500", stage: "Proposal" },
];

export default function DropdownMenuRowActions() {
  return (
    <div className="w-full max-w-xl divide-y divide-line overflow-hidden rounded-ui-lg surface">
      {deals.map((d) => (
        <div key={d.name} className="flex items-center gap-3 px-4 py-2.5">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{d.name}</p>
          <Badge tone="neutral">{d.stage}</Badge>
          <span className="w-20 text-end text-sm tabular text-fg">{d.value}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label={`Actions for ${d.name}`} size="xs" tooltip={false}>
                <MoreHorizontal />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" size="sm">
              <DropdownMenuItem icon={<Pencil />} shortcut="e">
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Copy />} shortcut="mod+d">
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#deal">
                  <ExternalLink /> Open in new tab
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Archive />} disabled>
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem icon={<Trash2 />} tone="danger" shortcut="mod+backspace">
                Move to trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
