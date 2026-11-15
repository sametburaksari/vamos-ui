import { printStyles } from "@vamos-ui/react";

export default function PrintButtonStylesheet() {
  const css = printStyles({ hide: [".cookie-banner"], size: "A4", margin: "14mm" });
  return (
    <pre className="w-full max-w-2xl overflow-x-auto rounded-ui border border-line bg-surface-2 p-4 font-mono text-xs whitespace-pre-wrap break-all text-fg">
      {css.replace(/([{}])/g, "$1\n")}
    </pre>
  );
}
