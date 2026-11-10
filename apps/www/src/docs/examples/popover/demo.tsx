import { Tag } from "lucide-react";
import { Button, Field, Input, Popover, PopoverClose, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "@vamos-cms/ui";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Tag /> Add tag
        </Button>
      </PopoverTrigger>
      <PopoverContent size="sm" align="start">
        {/* The header title becomes the popover's accessible name. */}
        <PopoverHeader title="Tag contact" description="Tags group contacts for segments and campaigns." />
        <Field label="Tag name">
          <Input placeholder="e.g. Enterprise" size="sm" />
        </Field>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button size="sm" variant="ghost">
              Cancel
            </Button>
          </PopoverClose>
          <Button size="sm" variant="primary">
            Add tag
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}
