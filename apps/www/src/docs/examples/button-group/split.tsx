"use client";

import { CalendarClock, ChevronDown, FileClock, Send } from "lucide-react";
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from "@vamos-cms/ui";

export default function ButtonGroupSplit() {
  return (
    <ButtonGroup aria-label="Publish" variant="primary">
      <Button>
        <Send /> Publish
      </Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label="More publishing options" variant="primary">
            <ChevronDown />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem icon={<CalendarClock />} description="Pick a date and time">
            Schedule…
          </DropdownMenuItem>
          <DropdownMenuItem icon={<FileClock />} description="Only editors can see it">
            Save as draft
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
