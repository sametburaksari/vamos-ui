"use client";

import * as React from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Avatar, Badge, Button, Card, Input, ThemeScope, useMediaQuery } from "@vamos-ui/react";
import { FontProvider, type FontPairing } from "@vamos-ui/react/fonts";
import type { PreferencesForm } from "./data";

const deals = [
  { name: "Harbor & Pine", stage: "Proposal", tone: "info", value: "₺184,000" },
  { name: "Karaköy Bistro", stage: "Won", tone: "success", value: "₺62,500" },
  { name: "Lena Spa", stage: "Negotiation", tone: "warning", value: "₺96,000" },
] as const;

/**
 * A small panel rendered with the chosen theme axes and type pairing, scoped to this box only —
 * the rest of the settings page keeps the current theme until the changes are saved.
 */
export function AppearancePreview({ form, pairing }: { form: PreferencesForm; pairing: FontPairing }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = form.theme === "system" ? (prefersDark ? "dark" : "light") : form.theme;

  return (
    <ThemeScope
      theme={theme}
      material={form.material}
      accent={form.accent}
      density={form.density}
      className="vb-appearance-preview overflow-hidden rounded-ui-lg border border-line"
      aria-hidden
      inert
    >
      <FontProvider pairing={pairing} className="grid gap-(--gap) p-(--gap) font-sans text-fg">
        <div className="flex items-center gap-3">
          <span className="grid size-7 place-items-center rounded-[9px] bg-accent font-display text-[17px] italic leading-none text-accent-fg">n</span>
          <span className="text-[13px] font-medium">Northwind · CRM</span>
          <div className="flex-1" />
          <Input size="sm" placeholder="Search deals" addonStart={<Search />} className="hidden w-44 sm:flex" readOnly />
          <Avatar size="sm" name="Samet Burak" />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11.5px] text-fg-subtle">Pipeline · November</p>
            <p className="font-display text-[length:calc(30px*var(--display-scale))] leading-[1.05] text-fg">
              Weighted value <em>₺342,500</em>
            </p>
          </div>
          <span className="inline-flex items-center gap-0.5 font-mono text-xs font-medium text-success tabular">
            <ArrowUpRight className="size-3.5" />
            +18.2%
          </span>
        </div>

        <Card className="divide-y divide-line">
          {deals.map((d) => (
            <div key={d.name} className="flex items-center gap-3 px-(--gap) py-[calc(var(--gap)*0.6)] text-[13px]">
              <span className="min-w-0 flex-1 truncate font-medium">{d.name}</span>
              <Badge tone={d.tone}>{d.stage}</Badge>
              <span className="w-20 text-end font-mono tabular text-fg-muted">{d.value}</span>
            </div>
          ))}
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm">
            Export
          </Button>
          <Button size="sm" variant="primary">
            New deal
          </Button>
        </div>
      </FontProvider>
    </ThemeScope>
  );
}
