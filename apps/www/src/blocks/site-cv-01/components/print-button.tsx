"use client";

import * as React from "react";
import { FileDown } from "lucide-react";
import { Button, type ButtonProps } from "@vamos-ui/react";

export interface PrintButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Suggested file name for "Save as PDF" (browsers use the document title). */
  fileName: string;
  /** Hint read after the label: "opens the print dialog — choose Save as PDF". */
  hint?: string;
}

/**
 * "Download PDF": opens the browser's print dialog on the print stylesheet (A4, one column of
 * paper, no site chrome). The document title is swapped for the file name while the dialog is
 * open, so "Save as PDF" suggests `Deniz-Arcan-CV.pdf` instead of the page title.
 */
export function PrintButton({ fileName, hint, children, ...props }: PrintButtonProps) {
  const hintId = React.useId();
  const print = () => {
    const previous = document.title;
    const restore = () => {
      document.title = previous;
      window.removeEventListener("afterprint", restore);
    };
    document.title = fileName;
    window.addEventListener("afterprint", restore);
    window.print();
    // Some browsers return from print() before afterprint; never leave the title swapped.
    window.setTimeout(restore, 1000);
  };
  return (
    <>
      <Button type="button" onClick={print} aria-describedby={hint ? hintId : undefined} {...props}>
        <FileDown aria-hidden />
        {children}
      </Button>
      {hint ? (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      ) : null}
    </>
  );
}
