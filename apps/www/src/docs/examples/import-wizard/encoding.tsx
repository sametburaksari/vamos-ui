"use client";

import * as React from "react";
import { Button } from "@vamos-ui/react";
import { ImportWizard, type ImportField } from "@vamos-ui/react/business";

const fields: ImportField[] = [
  { id: "name", label: "Müşteri", aliases: ["Customer"], required: true, type: "text" },
  { id: "city", label: "Şehir", aliases: ["City"], type: "text" },
  { id: "balance", label: "Bakiye", aliases: ["Balance"], type: "money" },
];

// Excel on Turkish Windows saves "CSV" as Windows-1254 with ";" — the classic broken-characters file.
const W1254: Record<string, number> = { Ç: 0xc7, ç: 0xe7, Ğ: 0xd0, ğ: 0xf0, İ: 0xdd, ı: 0xfd, Ö: 0xd6, ö: 0xf6, Ş: 0xde, ş: 0xfe, Ü: 0xdc, ü: 0xfc };
const encode1254 = (s: string) => new Uint8Array([...s].map((ch) => W1254[ch] ?? ch.charCodeAt(0)));
const text = "Müşteri;Şehir;Bakiye\r\nGüneş Tekstil;İzmir;12.450,75\r\nÇağlar Gıda;Eskişehir;3.980,00\r\nÖzkan Yapı;Muğla;-1.200,50\r\n";

export default function ImportWizardEncoding() {
  const [href, setHref] = React.useState<string>();
  React.useEffect(() => {
    const url = URL.createObjectURL(new Blob([encode1254(text)], { type: "text/csv" }));
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <Button asChild variant="secondary" className="self-start">
        <a href={href} download="musteriler-1254.csv">Download a Windows-1254 file</a>
      </Button>
      <ImportWizard fields={fields} onImport={async (rows) => ({ ok: rows.length, failed: [] })} />
    </div>
  );
}
