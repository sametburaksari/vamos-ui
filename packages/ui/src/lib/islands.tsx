"use client";

/**
 * Tiny client islands that let otherwise server-compatible components (Badge, Skeleton, Card)
 * show localized text without becoming client components themselves.
 */

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./cn";
import { useLabels, type LabelValues } from "./labels";
import { useFormat } from "./locale";

/** Renders one label from the dictionary: `<LocalizedText namespace="skeleton" id="loading" defaults={…} />`. */
export function LocalizedText<T extends LabelValues>({
  namespace,
  id,
  defaults,
  override,
  vars,
}: {
  namespace: string;
  id: keyof T & string;
  defaults: T;
  override?: Partial<T>;
  vars?: Record<string, unknown>;
}) {
  const t = useLabels(namespace, defaults, override);
  return <>{t(id, vars)}</>;
}

/** A locale-formatted count with an optional cap ("99+"). */
export function LocaleCount({ value, max }: { value: number; max?: number }) {
  const f = useFormat();
  return <>{max === undefined ? f.number(value) : f.count(value, max)}</>;
}

const chipLabels = { remove: "Remove {label}", removeGeneric: "Remove" };

export interface ChipRemoveButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  onRemove: () => void;
  /** Text of the chip, used in the accessible name ("Remove Design"). */
  itemLabel?: string;
  /** Full accessible name override. */
  removeLabel?: string;
  /** Label overrides for the `badge` namespace. */
  labels?: Partial<typeof chipLabels>;
}

/**
 * The remove (×) button of a chip — Badge `onRemove`, Tag input, Combobox multi, Filter bar.
 * Delete / Backspace on the focused button also remove.
 */
export const ChipRemoveButton = React.forwardRef<HTMLButtonElement, ChipRemoveButtonProps>(function ChipRemoveButton(
  { onRemove, itemLabel, removeLabel, labels, className, onKeyDown, disabled, ...props },
  ref,
) {
  const t = useLabels("badge", chipLabels, labels);
  const name = removeLabel ?? (itemLabel ? t("remove", { label: itemLabel }) : t("removeGeneric"));
  return (
    <button
      ref={ref}
      type="button"
      data-slot="chip-remove"
      aria-label={name}
      disabled={disabled}
      className={cn(
        "-me-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-current opacity-60 transition-[opacity,background-color]",
        "hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] hover:opacity-100 focus-ring disabled:pointer-events-none",
        "[&_svg]:size-3",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented && (e.key === "Delete" || e.key === "Backspace")) {
          e.preventDefault();
          onRemove();
        }
      }}
      {...props}
    >
      <X aria-hidden strokeWidth={2.25} />
    </button>
  );
});
