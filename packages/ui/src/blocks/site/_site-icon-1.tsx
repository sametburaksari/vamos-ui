// Icon by name for `f.icon()` values. Separate file: it references the whole lucide set, so only
// blocks that accept icon names (Feature grid) import it.

import * as React from "react";
import * as Lucide from "lucide-react";
import { cn } from "../../lib/cn";

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
const pascal = (s: string) => s.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());

/** A lucide icon from its kebab-case name, or the node itself. 20px, stroke 1.5, never boxed (D6-3). */
export function SiteIcon({ icon, className }: { icon?: React.ReactNode; className?: string }) {
  if (!icon) return null;
  if (typeof icon !== "string") return <span aria-hidden className={cn("inline-flex size-5 shrink-0 text-fg-muted [&_svg]:size-5", className)}>{icon}</span>;
  const Comp = (Lucide as unknown as Record<string, IconComponent | undefined>)[pascal(icon)] ?? (Lucide as unknown as Record<string, IconComponent | undefined>)[`${pascal(icon)}Icon`];
  if (!Comp) return null;
  return <Comp aria-hidden strokeWidth={1.5} className={cn("size-5 shrink-0 text-fg-muted", className)} />;
}

