"use client";

import * as React from "react";
import * as Tabs from "radix-ui/tabs";
import { cn } from "../../lib/cn";

export interface FeatureTabsItem {
  value: string;
  /** Tab label (feature title). */
  title: React.ReactNode;
  /** Short text under the active tab. */
  text?: React.ReactNode;
  /** Server-rendered panel (large image / screenshot + link). */
  panel: React.ReactNode;
}

export interface FeatureTabsProps {
  items: FeatureTabsItem[];
  /** Accessible name of the tab list (the section title as text). */
  label?: string;
  defaultValue?: string;
  className?: string;
}

/**
 * Tabs island of the Feature grid `tabs` variant (WAI-ARIA Tabs via Radix, vertical arrow keys).
 * Feature titles on the start side, the selected feature's media on the end side.
 */
export function FeatureTabs({ items, label, defaultValue, className }: FeatureTabsProps) {
  return (
    <Tabs.Root orientation="vertical" defaultValue={defaultValue ?? items[0]?.value} className={cn("grid gap-x-(--gutter) gap-y-8 @4xl:grid-cols-12", className)}>
      <Tabs.List aria-label={label} className="flex flex-col border-s border-line @4xl:col-span-5">
        {items.map((it) => (
          <Tabs.Trigger
            key={it.value}
            value={it.value}
            className="vb-feature-tab group/ft relative -ms-px flex flex-col items-start gap-2 border-s-2 border-transparent py-4 ps-6 pe-2 text-start outline-none transition-colors focus-ring data-[state=active]:border-accent"
          >
            <span className="text-h3 font-semibold tracking-[-0.012em] text-fg-muted transition-colors group-hover/ft:text-fg group-data-[state=active]/ft:text-fg">{it.title}</span>
            {it.text ? <span className="hidden max-w-[52ch] text-body text-fg-muted group-data-[state=active]/ft:block">{it.text}</span> : null}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {items.map((it) => (
        <Tabs.Content key={it.value} value={it.value} className="outline-none focus-ring @4xl:col-span-7 vb-feature-panel">
          {it.panel}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
