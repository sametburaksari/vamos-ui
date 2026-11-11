"use client";

import * as React from "react";
import { Heading2, ImagePlus, Link2, Quote, Table } from "lucide-react";
import {
  Badge,
  Button,
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@vamos-ui/react";

// A CMS post editor: menus on the start side, the primary action on the end.
export default function MenubarCmsToolbar() {
  const [focusMode, setFocusMode] = React.useState(false);
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Menubar aria-label="Post editor" className="min-w-0">
        <MenubarMenu>
          <MenubarTrigger>Insert</MenubarTrigger>
          <MenubarContent>
            <MenubarItem icon={<Heading2 />} shortcut="mod+alt+2">Heading</MenubarItem>
            <MenubarItem icon={<ImagePlus />} shortcut="mod+shift+i">Image</MenubarItem>
            <MenubarItem icon={<Table />}>Table</MenubarItem>
            <MenubarItem icon={<Quote />}>Pull quote</MenubarItem>
            <MenubarSeparator />
            <MenubarItem icon={<Link2 />} shortcut="mod+k">Link</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Format</MenubarTrigger>
          <MenubarContent>
            <MenubarItem shortcut="mod+b">Bold</MenubarItem>
            <MenubarItem shortcut="mod+i">Italic</MenubarItem>
            <MenubarItem shortcut="mod+shift+x">Clear formatting</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem checked={focusMode} onCheckedChange={setFocusMode} shortcut="mod+shift+f">
              Focus mode
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Badge tone="neutral">Draft · saved 2 min ago</Badge>
      <Button variant="primary" size="sm" className="ms-auto">
        Publish
      </Button>
    </div>
  );
}
