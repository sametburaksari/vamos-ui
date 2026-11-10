"use client";

import { LocaleProvider } from "@vamos-ui/react";
import { ImportWizard, type ImportField } from "@vamos-ui/react/business";
import { validateTckn, validateTrIban } from "@vamos-ui/react/locale-data";

// HR bulk employees: national ID and IBAN checked with the tr locale pack, dates and money in Turkish format.
const fields: ImportField[] = [
  { id: "name", label: "Ad Soyad", aliases: ["Full name", "Name"], required: true, type: "text" },
  { id: "tckn", label: "TC Kimlik No", aliases: ["TCKN", "National ID"], required: true, type: "id", validate: (v) => (validateTckn(v).valid ? null : "TC kimlik numarası geçersiz") },
  { id: "iban", label: "IBAN", required: true, type: "iban", validate: (v) => (validateTrIban(v).valid ? null : "Türk IBAN'ı değil") },
  { id: "start", label: "İşe giriş", aliases: ["Start date"], type: "date" },
  { id: "salary", label: "Brüt maaş", aliases: ["Salary"], type: "money" },
];

const sample = [
  "Ad Soyad;TCKN;IBAN;İşe giriş;Brüt maaş",
  "Elif Şahin;10000000146;TR33 0006 1005 1978 6457 8413 26;01.12.2026;96.000,00",
  "Mert Kaya;12345678901;TR33 0006 1005 1978 6457 8413 27;15.12.2026;72.500,50",
  "Zeynep Kaya;10000000078;DE89 3704 0044 0532 0130 00;02.01.2027;110.000",
].join("\n");

export default function ImportWizardValidation() {
  return (
    <LocaleProvider locale="tr-TR">
      <div className="w-full max-w-3xl">
        <ImportWizard
          fields={fields}
          dedupeKeys={["tckn"]}
          sampleFile={{ name: "personel.csv", href: `data:text/csv;charset=utf-8,${encodeURIComponent(sample)}` }}
          onImport={async (rows) => ({ ok: rows.length, failed: [] })}
        />
      </div>
    </LocaleProvider>
  );
}
