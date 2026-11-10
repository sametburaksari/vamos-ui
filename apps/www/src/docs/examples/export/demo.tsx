"use client";

import { Button } from "@vamos-cms/ui";
import { ExportDialog, exportToBlob, type ExportColumn } from "@vamos-cms/ui/business";
import { Download } from "lucide-react";

const contacts = [
  { name: "Ayşe Yılmaz", company: "Northwind Traders", email: "ayse.yilmaz@northwind.com", city: "İstanbul", stage: "Customer", value: 48500 },
  { name: "Ben Hartley", company: "Contoso Ltd", email: "ben@contoso.co.uk", city: "London", stage: "Lead", value: 12000 },
  { name: "Chloé Duarte", company: "Fabrikam", email: "chloe.duarte@fabrikam.fr", city: "Lyon", stage: "Opportunity", value: 30250.5 },
];

const columns: ExportColumn[] = [
  { id: "name", label: "Name" },
  { id: "company", label: "Company" },
  { id: "email", label: "Email" },
  { id: "city", label: "City" },
  { id: "stage", label: "Lifecycle stage" },
  { id: "value", label: "Open deal value", type: "number" },
];

export default function ExportDemo() {
  return (
    <ExportDialog
      resource="contacts"
      columns={columns}
      selectedCount={0}
      filteredCount={contacts.length}
      totalCount={1240}
      trigger={
        <Button>
          <Download /> Export
        </Button>
      }
      onExport={async (r) => ({
        blob: await exportToBlob({ rows: contacts, columns: r.columns.map((id) => columns.find((c) => c.id === id)!), format: r.format, masked: r.masked, csv: r.csv }),
        filename: r.filename,
      })}
    />
  );
}
