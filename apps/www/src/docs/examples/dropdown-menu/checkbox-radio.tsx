"use client";

import * as React from "react";
import { Columns3 } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vamos-cms/ui";

const columns = ["Email", "Department", "Manager", "Start date", "Location"];

export default function DropdownMenuCheckboxRadio() {
  const [visible, setVisible] = React.useState<string[]>(["Email", "Department", "Start date"]);
  const [sort, setSort] = React.useState("name");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Columns3 /> View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel inset>Columns</DropdownMenuLabel>
        {columns.map((c) => (
          <DropdownMenuCheckboxItem
            key={c}
            checked={visible.includes(c)}
            onCheckedChange={(on) => setVisible((v) => (on ? [...v, c] : v.filter((x) => x !== c)))}
            // keep the menu open while toggling several columns
            onSelect={(e) => e.preventDefault()}
          >
            {c}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="start">Start date</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="department">Department</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
