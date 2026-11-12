"use client";

import * as React from "react";
import { TooltipProvider } from "@vamos-ui/react";

/**
 * The root layout's only client boundary. Keep it a local module that nothing else imports:
 * Next (webpack) looks a client reference up in a manifest merged from every route at the app
 * root, and for a module shared with another route (TooltipProvider is imported by every Button)
 * it can pick that route's chunk list — this is how every /view preview once shipped the home
 * page's 3 MB. A module only the root layout uses always resolves to the layout's own chunks.
 */
export function RootProviders({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
