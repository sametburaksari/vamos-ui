"use client";

import { toast } from "@vamos-ui/react";
import { ImportWizard, type ImportField } from "@vamos-ui/react/business";

const fields: ImportField[] = [
  { id: "name", label: "Full name", aliases: ["Name", "Contact", "Ad Soyad"], required: true, type: "text" },
  { id: "email", label: "Email", aliases: ["E-mail", "E-posta", "Mail"], required: true, type: "email" },
  { id: "company", label: "Company", aliases: ["Organisation", "Firma"], type: "text" },
  { id: "phone", label: "Phone", aliases: ["Mobile", "Telefon"], type: "phone" },
  {
    id: "stage",
    label: "Lifecycle stage",
    aliases: ["Stage", "Status"],
    type: "enum",
    options: [
      { value: "lead", label: "Lead" },
      { value: "opportunity", label: "Opportunity", aliases: ["Opp"] },
      { value: "customer", label: "Customer", aliases: ["Client"] },
    ],
  },
  { id: "value", label: "Deal value", aliases: ["Amount", "Tutar"], type: "money" },
];

const sample = [
  "Name,E-mail,Organisation,Mobile,Stage,Amount",
  "Ayşe Yılmaz,ayse.yilmaz@northwind.com,Northwind Traders,+90 532 418 22 09,Customer,48500.00",
  "Ben Hartley,ben@contoso,Contoso Ltd,+44 20 7946 0958,Lead,12000",
  "Chloé Duarte,chloe.duarte@fabrikam.fr,Fabrikam,+33 1 84 88 32 00,Opp,30250.50",
  "Deniz Aydın,deniz@kuzeybilisim.com.tr,Kuzey Bilişim,0532 111 22 33,Prospect,9800",
  "Ayşe Yılmaz,AYSE.YILMAZ@northwind.com,Northwind Traders,,Customer,",
].join("\n");

export default function ImportWizardDemo() {
  return (
    <div className="w-full max-w-3xl">
      <ImportWizard
        fields={fields}
        dedupeKeys={["email"]}
        sampleFile={{ name: "contacts-sample.csv", href: `data:text/csv;charset=utf-8,${encodeURIComponent(sample)}` }}
        onImport={async (rows, { signal, onProgress, dryRun }) => {
          // Pretend the API rejects one address per chunk that it already has.
          for (let i = 0; i < rows.length; i++) {
            if (signal.aborted) break;
            await new Promise((r) => setTimeout(r, 120));
            onProgress(i + 1);
          }
          const dup = rows.findIndex((r) => String(r.email).endsWith("@fabrikam.fr"));
          return { ok: rows.length - (dup >= 0 ? 1 : 0), failed: dup >= 0 && !dryRun ? [{ row: dup, error: "A contact with this email already exists in another workspace" }] : [] };
        }}
        onDone={(r) => toast.success(`${r.ok} contacts imported`)}
      />
    </div>
  );
}
