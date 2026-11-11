"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@vamos-ui/react";

/**
 * Docs-only: remounts its children so the entrance plays again. In your app the motion simply
 * runs when the content scrolls into view.
 */
export function Replay({ children, className }: { children: React.ReactNode; className?: string }) {
  const [run, setRun] = React.useState(0);
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <Button size="sm" variant="ghost" className="absolute end-0 -top-1 z-10" onClick={() => setRun((n) => n + 1)}>
        <RotateCcw /> Replay
      </Button>
      <React.Fragment key={run}>{children}</React.Fragment>
    </div>
  );
}
