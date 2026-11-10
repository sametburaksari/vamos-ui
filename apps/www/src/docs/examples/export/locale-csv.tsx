"use client";

import * as React from "react";
import { LocaleProvider } from "@vamos-cms/ui";
import { exportToBlob, QuickExportButton, toExportMatrix, type ExportColumn } from "@vamos-cms/ui/business";

const rows = [
  { sku: "VT-PVC-01", name: "NFC card, PVC", price: 500, stock: 1240 },
  { sku: "VT-MET-02", name: "NFC card, metal; matte black", price: 1250.5, stock: 86 },
  { sku: "=cmd|' /C calc'!A0", name: "Suspicious import", price: 0, stock: 0 },
];
const columns: ExportColumn[] = [
  { id: "sku", label: "SKU" },
  { id: "name", label: "Product" },
  { id: "price", label: "Price", type: "number" },
  { id: "stock", label: "Stock", type: "number" },
];

function Preview({ locale }: { locale: string }) {
  const [text, setText] = React.useState("");
  React.useEffect(() => {
    void exportToBlob({ rows, columns, format: "csv", locale })
      .then((b) => b.text())
      .then((t) => setText(t.replace(/^﻿/, "[BOM]")));
  }, [locale]);
  return (
    <pre tabIndex={0} role="region" aria-label={`CSV output, ${locale}`} className="focus-ring overflow-x-auto rounded-ui surface-2 p-3 font-mono text-[11px] leading-relaxed text-fg">
      {text}
    </pre>
  );
}

export default function ExportLocaleCsv() {
  // tr-TR: ";" + decimal comma + UTF-8 BOM so Excel (Turkish) opens it in columns. en-US: "," + ".".
  // Cells starting with = + - @ get a ' prefix (formula-injection guard).
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {(["en-US", "tr-TR"] as const).map((locale) => (
        <LocaleProvider key={locale} locale={locale}>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-fg-muted">{locale}</span>
              <QuickExportButton size="sm" variant="secondary" onExport={async () => ({ blob: await exportToBlob({ rows, columns, format: "csv", locale }), filename: `products-${locale}.csv` })} />
            </div>
            <Preview locale={locale} />
            <span className="sr-only">{toExportMatrix(rows, columns).length - 1} rows</span>
          </div>
        </LocaleProvider>
      ))}
    </div>
  );
}
