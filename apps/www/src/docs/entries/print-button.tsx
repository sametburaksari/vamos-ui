import { ex, type DocEntry } from "../types";
import PrintButtonDemo from "../examples/print-button/demo";
import PrintButtonStylesheet from "../examples/print-button/stylesheet";

const entry: DocEntry = {
  slug: "print-button",
  title: "Print button",
  group: "Foundations",
  description:
    "Print or \"Download PDF\" for pages people keep on paper — a CV, an invoice, a recipe, a ticket. PrintButton opens the browser's print dialog and suggests a file name for Save as PDF; PrintStyles (or the printStyles() string) is a small print stylesheet that hides the site chrome, prints link addresses and keeps blocks together.",
  source: ["components/print-button.tsx"],
  usage: `import { PrintButton, PrintStyles } from "@vamos-ui/react";

<PrintStyles />
<PrintButton fileName="cv-2026">Download PDF</PrintButton>`,
  demo: ex("demo", "Print and save as PDF", "print-button/demo.tsx", PrintButtonDemo, "fileName swaps the document title while the dialog is open, so Save as PDF suggests meal-plan-week-46.pdf. The buttons never print."),
  examples: [
    ex("stylesheet", "The stylesheet", "print-button/stylesheet.tsx", PrintButtonStylesheet, "printStyles(options) returns plain CSS — inline it, or write it into your own stylesheet."),
  ],
  api: [
    { name: "PrintButton", props: [
      { name: "fileName", type: "string", description: "Suggested PDF name (the title is restored after the dialog)." },
      { name: "onBeforePrint / onAfterPrint", type: "() => void", description: "Expand collapsed sections before, clean up after." },
      { name: "noHint", type: "boolean", description: "Drop the screen-reader description (\"Opens the print dialog…\")." },
      { name: "children", type: "ReactNode", default: '"Print"', description: "Label. All Button props pass through (variant defaults to secondary)." },
      { name: "labels", type: "Partial<PrintButtonLabels>", description: 'Dictionary namespace "printButton": print, hint.' },
    ] },
    { name: "PrintStyles / printStyles(options)", props: [
      { name: "hide", type: "string[]", description: "Extra selectors to hide on paper." },
      { name: "hideChrome", type: "boolean", default: "true", description: "Hide nav, banner header, contentinfo footer, TopBar and Sidebar." },
      { name: "showUrls", type: "boolean", default: "true", description: "Print external link addresses after the text; data-print-url=\"off\" opts a link out." },
      { name: "margin / size", type: "string", default: '"16mm" / printer', description: "@page margin and size (\"A4\")." },
      { name: "nonce", type: "string", description: "CSP nonce for the inline style (PrintStyles)." },
    ] },
  ],
  notes: [
    "Markup hooks: data-print=\"hide\" (never on paper), data-print=\"only\" (only on paper), data-print=\"keep\" (no page break inside).",
    "Print forces a light colour scheme and drops shadows and backdrop blur, so any theme prints as readable black on white.",
  ],
  covers: [],
};

export default entry;
