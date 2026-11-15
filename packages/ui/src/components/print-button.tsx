"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { useLabels } from "../lib/labels";
import { Button, type ButtonProps } from "./button";

export const printButtonLabels = {
  print: "Print",
  /** Screen-reader hint after the label. */
  hint: "Opens the print dialog. Choose Save as PDF to download a copy.",
};
export type PrintButtonLabels = typeof printButtonLabels;

export interface PrintButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  /**
   * Suggested file name for "Save as PDF". Browsers name the file after the document title, so the
   * title is swapped while the dialog is open (`"cv-2026"` → `cv-2026.pdf`).
   */
  fileName?: string;
  /** Called right before the dialog opens (expand collapsed sections, load lazy images). */
  onBeforePrint?: () => void;
  /** Called after the dialog closed. */
  onAfterPrint?: () => void;
  /** Hide the screen-reader hint ("Opens the print dialog…"). */
  noHint?: boolean;
  labels?: Partial<PrintButtonLabels>;
}

/**
 * Opens the browser's print dialog — "Print" or "Download PDF" for a CV, an invoice, a recipe, a
 * ticket. Pair it with `PrintStyles` so the paper version drops the site chrome. The button
 * itself never prints (`data-print="hide"`).
 *
 * ```tsx
 * <PrintStyles />
 * <PrintButton fileName="cv-2026">Download PDF</PrintButton>
 * ```
 */
export const PrintButton = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, PrintButtonProps>(function PrintButton(
  { fileName, onBeforePrint, onAfterPrint, noHint, labels, children, variant = "secondary", ...props },
  ref,
) {
  const t = useLabels("printButton", printButtonLabels, labels);
  const hintId = React.useId();
  const print = () => {
    onBeforePrint?.();
    const previous = document.title;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      if (fileName) document.title = previous;
      window.removeEventListener("afterprint", restore);
      onAfterPrint?.();
    };
    if (fileName) document.title = fileName;
    window.addEventListener("afterprint", restore);
    window.print();
    // Some browsers return from print() before (or without) afterprint: never leave the title swapped.
    window.setTimeout(restore, 1000);
  };
  return (
    <>
      <Button ref={ref} type="button" variant={variant} data-print="hide" onClick={print} aria-describedby={noHint ? undefined : hintId} {...props}>
        <Printer aria-hidden />
        {children ?? t("print")}
      </Button>
      {noHint ? null : (
        <span id={hintId} hidden>
          {t("hint")}
        </span>
      )}
    </>
  );
});


// Server-safe: the stylesheet lives in its own module so server components can call printStyles().
export { PrintStyles, printStyles, type PrintStylesOptions, type PrintStylesProps } from "./print-styles";
