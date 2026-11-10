import { Folder, FolderInput, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  IconButton,
} from "@vamos-cms/ui";

const folders = [
  { name: "Campaigns", count: 214 },
  { name: "Press kit", count: 38 },
  { name: "Product shots", count: 1_206 },
  { name: "Team", count: 57 },
];

export default function DropdownMenuSubmenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label="File actions" variant="secondary" tooltip={false}>
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<Pencil />} shortcut="f2">
          Rename
        </DropdownMenuItem>
        {/* → opens the submenu (← in RTL); it is one layer deeper, so it is opaque in glass mode */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<FolderInput />}>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent size="sm">
            {folders.map((f) => (
              <DropdownMenuItem key={f.name} icon={<Folder />} badge={f.count.toLocaleString("en-US")}>
                {f.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<Share2 />}>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Copy public link</DropdownMenuItem>
            <DropdownMenuItem>Email to a colleague</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Trash2 />} tone="danger">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
