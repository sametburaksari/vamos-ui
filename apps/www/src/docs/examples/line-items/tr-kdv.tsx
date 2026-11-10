"use client";

import * as React from "react";
import { LocaleProvider } from "@vamos-cms/ui";
import { LineItems, trLineTaxPack, type LineItem } from "@vamos-cms/ui/business";
import { trAmountInWords } from "@vamos-cms/ui/locale-data";

// KDV rates in force on the invoice date (0 / 1 / 10 / 20) and tevkifat codes as withholding.
const pack = trLineTaxPack("2026-11-10", undefined, { localLabels: true });

const invoice: LineItem[] = [
  { id: "k1", description: "Yazılım danışmanlığı — Kasım", quantity: "40", unit: "saat", unitPrice: "1750.00", taxRate: "20", withholding: "602" },
  { id: "k2", description: "Sunucu bakım paketi", quantity: "1", unit: "ay", unitPrice: "6500.00", taxRate: "20" },
  { id: "k3", description: "Eğitim kitabı", quantity: "12", unit: "adet", unitPrice: "380.00", taxRate: "10" },
];

export default function LineItemsTrKdv() {
  const [rows, setRows] = React.useState(invoice);
  const [payable, setPayable] = React.useState("");
  return (
    <LocaleProvider locale="tr-TR" currency="TRY">
      <div className="w-full">
        <LineItems
          aria-label="Fatura kalemleri"
          taxPack={pack}
          units={["saat", "gün", "ay", "adet"]}
          value={rows}
          onValueChange={(next, totals) => {
            setRows(next);
            setPayable(totals.payable);
          }}
          summaryFooter={payable ? <p className="pt-2 text-[11px] text-fg-muted">{trAmountInWords(payable, "TRY")}</p> : null}
          labels={{ item: "Ürün", description: "Açıklama", quantity: "Miktar", unit: "Birim", unitPrice: "Fiyat", discount: "İskonto", tax: "KDV", withholding: "Tevkifat", total: "Tutar", addRow: "Kalem ekle", subtotal: "Ara toplam", net: "Matrah", grandTotal: "Genel toplam", payable: "Ödenecek tutar", withheldLine: "KDV tevkifatı {code} · {ratio}" }}
        />
      </div>
    </LocaleProvider>
  );
}
