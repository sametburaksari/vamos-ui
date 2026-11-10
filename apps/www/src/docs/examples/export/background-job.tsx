"use client";

import { Button } from "@vamos-ui/react";
import { ExportDialog, type ExportColumn, type ExportJobState } from "@vamos-ui/react/business";
import { Download } from "lucide-react";

const columns: ExportColumn[] = [
  { id: "id", label: "Order ID" },
  { id: "date", label: "Date" },
  { id: "customer", label: "Customer" },
  { id: "items", label: "Items" },
  { id: "total", label: "Total" },
  { id: "channel", label: "Channel" },
];

// A fake job API: 0 → 100% in ~5 s, then a download URL.
const jobs = new Map<string, number>();
async function pollJob(id: string): Promise<ExportJobState> {
  const p = Math.min(100, (jobs.get(id) ?? 0) + 22);
  jobs.set(id, p);
  if (p < 100) return { status: "running", progress: p };
  const url = URL.createObjectURL(new Blob(["Order ID,Date\r\nORD-118204,2026-11-09\r\n"], { type: "text/csv" }));
  return { status: "done", url };
}

export default function ExportBackgroundJob() {
  // Above syncLimit rows the dialog explains the export runs in the background; onExport returns a jobId.
  return (
    <ExportDialog
      resource="orders"
      columns={columns}
      filteredCount={48210}
      totalCount={182340}
      defaultScope="all"
      syncLimit={10000}
      trigger={
        <Button>
          <Download /> Export orders
        </Button>
      }
      onExport={async () => {
        const id = `job_${Date.now()}`;
        jobs.set(id, 0);
        return { jobId: id };
      }}
      pollJob={pollJob}
    />
  );
}
