"use client";

import { Button } from "@vamos-cms/ui";
import { ExportDialog, exportToBlob, type ExportColumn } from "@vamos-cms/ui/business";
import { FileSpreadsheet } from "lucide-react";

const invoices = [
  { no: "INV-2026-0418", customer: "Kuzey Bilişim", issued: new Date("2026-11-02"), due: new Date("2026-12-02"), total: 72540, status: "Sent" },
  { no: "INV-2026-0417", customer: "Moda Atölye", issued: new Date("2026-10-28"), due: new Date("2026-11-27"), total: 18900.5, status: "Paid" },
  { no: "INV-2026-0416", customer: "Ege Otelcilik", issued: new Date("2026-10-21"), due: new Date("2026-11-20"), total: 126000, status: "Overdue" },
];

const columns: ExportColumn[] = [
  { id: "no", label: "Invoice" },
  { id: "customer", label: "Customer" },
  { id: "issued", label: "Issued", type: "date" },
  { id: "due", label: "Due", type: "date" },
  { id: "total", label: "Total (TRY)", type: "number" },
  { id: "status", label: "Status" },
];

export default function ExportXlsx() {
  // write-excel-file loads only when XLSX is chosen; numbers and dates stay typed cells.
  return (
    <ExportDialog
      resource="invoices"
      columns={columns}
      formats={["xlsx", "csv", "json"]}
      selectedCount={2}
      filteredCount={invoices.length}
      totalCount={418}
      trigger={
        <Button>
          <FileSpreadsheet /> Export invoices
        </Button>
      }
      onExport={async (r) => ({
        blob: await exportToBlob({ rows: invoices, columns: r.columns.map((id) => columns.find((c) => c.id === id)!), format: r.format, sheetName: "Invoices" }),
        filename: r.filename,
      })}
    />
  );
}
