"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Spinner } from "@vamos-ui/react";

export default function DropdownMenuAsyncItem() {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  const run = (format: string) => (event: Event) => {
    // keep the menu open while the export runs
    event.preventDefault();
    setBusy(format);
    setTimeout(() => {
      setBusy(null);
      setOpen(false);
    }, 1400);
  };

  return (
    <DropdownMenu open={open} onOpenChange={(next) => !busy && setOpen(next)}>
      <DropdownMenuTrigger asChild>
        <Button>
          <Download /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-busy={busy ? true : undefined}>
        <DropdownMenuItem icon={busy === "csv" ? <Spinner size="xs" /> : <FileText />} disabled={!!busy && busy !== "csv"} onSelect={run("csv")} description="2,418 contacts · UTF-8">
          {busy === "csv" ? "Exporting CSV…" : "CSV"}
        </DropdownMenuItem>
        <DropdownMenuItem icon={busy === "xlsx" ? <Spinner size="xs" /> : <FileSpreadsheet />} disabled={!!busy && busy !== "xlsx"} onSelect={run("xlsx")} description="Keeps column formats">
          {busy === "xlsx" ? "Exporting Excel…" : "Excel workbook"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
