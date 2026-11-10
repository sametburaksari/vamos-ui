import { ChevronDown, FileText, Image, LayoutTemplate, Newspaper } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@vamos-cms/ui";

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary">
          New <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Create</DropdownMenuLabel>
        <DropdownMenuItem icon={<Newspaper />} shortcut="mod+alt+n">
          Post
        </DropdownMenuItem>
        <DropdownMenuItem icon={<FileText />} shortcut="mod+alt+p">
          Page
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Image />} shortcut="mod+u">
          Upload media
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LayoutTemplate />} description="Start from one of 12 saved layouts">
          From template
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
