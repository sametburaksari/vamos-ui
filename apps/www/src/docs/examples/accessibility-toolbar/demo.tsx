"use client";

import * as React from "react";
import { AccessibilityToolbar, Button, Input } from "@vamos-ui/react";

export default function AccessibilityToolbarDemo() {
  const target = React.useRef<HTMLDivElement>(null);
  return (
    <div className="grid w-full max-w-3xl gap-0 overflow-hidden rounded-ui-lg border border-line">
      <AccessibilityToolbar target={target} features={["highContrast", "readableFont", "underlineLinks", "reduceMotion"]} className="border-b border-line bg-surface px-4 py-3">
        <a href="#statement" className="rounded-ui-sm text-small font-medium text-accent-ink underline underline-offset-[0.2em] focus-ring">
          Accessibility statement
        </a>
      </AccessibilityToolbar>
      <div ref={target} className="grid gap-3 bg-scene p-6 text-fg">
        <h3 className="m-0 font-display text-h3">Library opening hours</h3>
        <p className="m-0 text-fg-muted">
          Open Monday to Saturday, 9:00–19:00. The reading room closes thirty minutes earlier. <a href="#hours">See holiday hours</a>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Input aria-label="Search the catalogue" placeholder="Search the catalogue" className="max-w-xs" />
          <Button>Search</Button>
        </div>
      </div>
    </div>
  );
}
