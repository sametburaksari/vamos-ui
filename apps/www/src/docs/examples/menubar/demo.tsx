"use client";

import * as React from "react";
import { Copy, FilePlus2, FolderOpen, Printer, Redo2, Save, Scissors, Undo2 } from "lucide-react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@vamos-ui/react";

export default function MenubarDemo() {
  const [ruler, setRuler] = React.useState(true);
  const [wordCount, setWordCount] = React.useState(false);
  const [zoom, setZoom] = React.useState("100");

  return (
    <Menubar aria-label="Document">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem icon={<FilePlus2 />} shortcut="mod+n">New document</MenubarItem>
          <MenubarItem icon={<FolderOpen />} shortcut="mod+o">Open…</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger inset>Open recent</MenubarSubTrigger>
            <MenubarSubContent size="sm">
              <MenubarItem>Q4 board memo</MenubarItem>
              <MenubarItem>Harbour Street lease draft</MenubarItem>
              <MenubarItem>Onboarding checklist</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem icon={<Save />} shortcut="mod+s">Save</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger inset>Export as</MenubarSubTrigger>
            <MenubarSubContent size="sm">
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>Word (.docx)</MenubarItem>
              <MenubarItem>Markdown</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem icon={<Printer />} shortcut="mod+p" disabled>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem icon={<Undo2 />} shortcut="mod+z">Undo</MenubarItem>
          <MenubarItem icon={<Redo2 />} shortcut="mod+shift+z">Redo</MenubarItem>
          <MenubarSeparator />
          <MenubarItem icon={<Scissors />} shortcut="mod+x">Cut</MenubarItem>
          <MenubarItem icon={<Copy />} shortcut="mod+c">Copy</MenubarItem>
          <MenubarItem inset shortcut="mod+shift+v">Paste without formatting</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler} shortcut="mod+r">
            Show ruler
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={wordCount} onCheckedChange={setWordCount}>
            Word count
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel inset>Zoom</MenubarLabel>
          <MenubarRadioGroup value={zoom} onValueChange={setZoom}>
            <MenubarRadioItem value="75">75%</MenubarRadioItem>
            <MenubarRadioItem value="100" shortcut="mod+0">100%</MenubarRadioItem>
            <MenubarRadioItem value="150">150%</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="mod+/">Keyboard shortcuts</MenubarItem>
          <MenubarItem>What’s new in 4.2</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
