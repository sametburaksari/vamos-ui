"use client";

import { FilePlus2, FileText, Image, Settings, UserPlus, Users } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@vamos-cms/ui";

export default function CommandDemo() {
  return (
    <Command className="surface-popover w-full max-w-md rounded-ui-lg">
      <CommandInput />
      <CommandList>
        <CommandEmpty />
        <CommandGroup heading="Actions">
          <CommandItem icon={<FilePlus2 />} shortcut="mod+shift+n">New post</CommandItem>
          <CommandItem icon={<UserPlus />} keywords={["person", "lead"]}>New contact</CommandItem>
          <CommandItem icon={<Image />}>Upload media</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Go to">
          <CommandItem icon={<FileText />} description="Content">Posts</CommandItem>
          <CommandItem icon={<Users />} description="CRM">Contacts</CommandItem>
          <CommandItem icon={<Settings />} shortcut="mod+comma">Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
