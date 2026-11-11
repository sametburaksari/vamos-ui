"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, Field, Input, Popover, PopoverContent, PopoverTrigger, RadioGroup, Select, Switch } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { columnLabels, priceKeys, type EditKey, type PriceKey } from "./grid-data";

export type AdjustTarget = PriceKey | "all-prices" | "stock";
export type AdjustMode = "up" | "down" | "set";
export interface Adjustment {
  target: AdjustTarget;
  mode: AdjustMode;
  amount: number;
  round90: boolean;
}

interface AdjustPopoverProps {
  /** Rows the adjustment applies to. */
  count: number;
  scopeLabel: string;
  onApply: (a: Adjustment) => void;
}

/** Change many cells at once: raise or lower prices by a percentage, set a price, or move stock. */
export function AdjustPopover({ count, scopeLabel, onApply }: AdjustPopoverProps) {
  const { c, t, lang } = useBlockFormat();
  const [open, setOpen] = React.useState(false);
  const [target, setTarget] = React.useState<AdjustTarget>("price");
  const [mode, setMode] = React.useState<AdjustMode>("up");
  const [amount, setAmount] = React.useState("5");
  const [round90, setRound90] = React.useState(true);

  const isStock = target === "stock";
  const n = Number(lang === "tr" ? amount.trim().replace(/\./g, "").replace(",", ".") : amount.trim().replace(/,/g, ""));
  const valid = Number.isFinite(n) && n > 0 && (isStock || mode === "set" || mode === "up" || n < 100);

  const unitLabel = isStock ? c("units", "adet") : mode === "set" ? "₺" : "%";
  const modeItems = isStock
    ? [
        { value: "up", label: c("Add", "Ekle") },
        { value: "down", label: c("Remove", "Düş") },
        { value: "set", label: c("Set to", "Eşitle") },
      ]
    : [
        { value: "up", label: c("Raise", "Artır") },
        { value: "down", label: c("Lower", "Düşür") },
        { value: "set", label: c("Set to", "Eşitle") },
      ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button disabled={count === 0}>
          <SlidersHorizontal /> {c("Adjust", "Toplu düzenle")} <span className="font-mono text-xs text-fg-subtle tabular">{count}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onApply({ target, mode, amount: n, round90: round90 && !isStock });
            setOpen(false);
          }}
        >
          <div>
            <p className="text-sm font-medium text-fg">{c("Adjust in bulk", "Toplu düzenle")}</p>
            <p className="text-xs text-fg-muted">{scopeLabel}</p>
          </div>
          <Field label={c("Column", "Sütun")}>
            <Select
              value={target}
              onValueChange={(v) => v && setTarget(v as AdjustTarget)}
              items={[
                ...priceKeys.map((k) => ({
                  value: k,
                  label: t(columnLabels[k as EditKey]),
                })),
                {
                  value: "all-prices",
                  label: c("All three prices", "Üç fiyatın hepsi"),
                },
                { value: "stock", label: t(columnLabels.stock) },
              ]}
            />
          </Field>
          <Field label={c("Change", "Değişiklik")}>
            <RadioGroup variant="segmented" value={mode} onValueChange={(v) => setMode(v as AdjustMode)} items={modeItems} />
          </Field>
          <Field
            label={c("Amount", "Miktar")}
            error={amount && !valid ? c("Enter a positive amount (under 100% when lowering).", "Pozitif bir miktar girin (düşürürken %100'ün altında).") : undefined}
          >
            <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} addonEnd={unitLabel} className="font-mono" />
          </Field>
          {!isStock ? (
            <Switch checked={round90} onCheckedChange={setRound90} label={c("Round to ,90", ",90'a yuvarla")} description={c("₺573.41 becomes ₺572.90", "₺573,41 → ₺572,90")} />
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" size="sm" variant="solid" disabled={!valid}>
              {c(`Apply to ${count}`, `${count} ürüne uygula`)}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
