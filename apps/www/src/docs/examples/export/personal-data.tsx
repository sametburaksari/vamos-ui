"use client";

import { Button } from "@vamos-ui/react";
import { ExportDialog, exportToBlob, type ExportColumn } from "@vamos-ui/react/business";
import { Download } from "lucide-react";

const people = [
  { name: "Deniz Aydın", department: "Engineering", email: "deniz.aydin@vamos.ist", phone: "+90 532 418 22 09", nationalId: "10000000146", salary: 128000 },
  { name: "Elif Şahin", department: "Design", email: "elif.sahin@vamos.ist", phone: "+90 533 771 40 12", nationalId: "10000000078", salary: 96000 },
];

const columns: ExportColumn[] = [
  { id: "name", label: "Full name" },
  { id: "department", label: "Department" },
  { id: "email", label: "Work email", personalData: true },
  { id: "phone", label: "Mobile", personalData: true, maskByDefault: true },
  { id: "nationalId", label: "National ID (TCKN)", personalData: true, maskByDefault: true },
  { id: "salary", label: "Gross salary", personalData: true, maskByDefault: true, defaultSelected: false },
];

export default function ExportPersonalData() {
  // Sensitive columns are masked by default. Unmasking any of them shows a KVKK / GDPR notice and
  // requires a reason; onExport receives it so the app can write its audit log.
  return (
    <ExportDialog
      resource="employees"
      columns={columns}
      filteredCount={people.length}
      totalCount={86}
      requireReason="personal-data"
      presentation="sheet"
      trigger={
        <Button>
          <Download /> Export personnel list
        </Button>
      }
      onExport={async (r) => ({
        blob: await exportToBlob({ rows: people, columns: r.columns.map((id) => columns.find((c) => c.id === id)!), format: r.format, masked: r.masked, locale: "tr-TR" }),
        filename: r.filename,
      })}
    />
  );
}
