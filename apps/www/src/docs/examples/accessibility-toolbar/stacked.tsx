"use client";

import { AccessibilityToolbar, Button, Popover, PopoverContent, PopoverTrigger } from "@vamos-ui/react";
import { Accessibility } from "lucide-react";

export default function AccessibilityToolbarStacked() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <Accessibility aria-hidden />
          Display settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <AccessibilityToolbar layout="stacked" storageKey="docs-display-settings" />
      </PopoverContent>
    </Popover>
  );
}
