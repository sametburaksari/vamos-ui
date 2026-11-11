"use client";

import * as React from "react";
import { Download, FileText } from "lucide-react";
import {
  Badge, Button, Card, CardHeader, Checkbox, IconButton, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader,
  Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow, ToggleGroup, ToggleGroupItem, toast,
} from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { billStatusLabels, billStatusTone, bills, billingProfile, type Bill } from "./billing-data";

/** Subscription invoices: year filter, multi-select download, and a sheet with the invoice lines. */
export function InvoiceTable() {
  const { c, f, t, money } = useBlockFormat();
  const years = Array.from(new Set(bills.map((b) => b.issued.slice(0, 4))));
  const [year, setYear] = React.useState(years[0]!);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [open, setBill] = React.useState<Bill | null>(null);
  const [sheet, setSheet] = React.useState(false);
  const setOpen = (b: Bill) => {
    setBill(b);
    setSheet(true);
  };
  const rows = bills.filter((b) => b.issued.startsWith(year));
  const all = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const some = rows.some((r) => selected.has(r.id));

  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const download = (list: Bill[]) =>
    toast.success(list.length === 1 ? c(`${list[0]!.number}.pdf downloaded`, `${list[0]!.number}.pdf indirildi`) : c(`${list.length} invoices zipped`, `${list.length} fatura sıkıştırıldı`), {
      description: list.length === 1 ? undefined : c("invoices-kiln-linen.zip is in your downloads.", "faturalar-kiln-linen.zip indirilenlerde."),
    });

  return (
    <Card className="min-w-0">
      <CardHeader
        titleAs="h2"
        title={c("Invoices", "Faturalar")}
        description={c(`Sent to ${billingProfile.emails[0]} on the last day of each cycle.`, `Her dönemin son günü ${billingProfile.emails[0]} adresine gönderilir.`)}
        action={
          <ToggleGroup
            aria-label={c("Year", "Yıl")}
            size="sm"
            value={year}
            onValueChange={(v) => {
              if (!v) return;
              setYear(v);
              setSelected(new Set());
            }}
          >
            {years.map((y) => (
              <ToggleGroupItem key={y} value={y}>
                {y}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        }
      />
      {some ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-line bg-selected px-(--card-p) py-2 ui-fade" role="status">
          <span className="text-[13px] text-fg">{c(`${selected.size} selected`, `${selected.size} seçili`)}</span>
          <span className="flex gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              {c("Clear", "Temizle")}
            </Button>
            <Button size="sm" onClick={() => download(bills.filter((b) => selected.has(b.id)))}>
              <Download /> {c("Download as ZIP", "ZIP olarak indir")}
            </Button>
          </span>
        </div>
      ) : null}
      <TableContainer className="border-t border-line">
        <Table aria-label={c("Invoices", "Faturalar")}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label={c("Select all invoices", "Tüm faturaları seç")}
                  checked={all ? true : some ? "indeterminate" : false}
                  onCheckedChange={(v) => setSelected(v === true ? new Set(rows.map((r) => r.id)) : new Set())}
                />
              </TableHead>
              <TableHead>{c("Invoice", "Fatura")}</TableHead>
              <TableHead className="max-sm:hidden">{c("Issued", "Tarih")}</TableHead>
              <TableHead align="end">{c("Total", "Toplam")}</TableHead>
              <TableHead className="max-md:hidden">{c("Status", "Durum")}</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">{c("Download", "İndir")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((b) => (
              <TableRow key={b.id} selected={selected.has(b.id)}>
                <TableCell>
                  <Checkbox aria-label={c(`Select ${b.number}`, `${b.number} seç`)} checked={selected.has(b.id)} onCheckedChange={(v) => toggle(b.id, v === true)} />
                </TableCell>
                <TableCell>
                  <button type="button" onClick={() => setOpen(b)} className="block text-start focus-ring rounded-ui-sm">
                    <span className="block text-[13px] font-medium text-fg hover:underline">{t(b.period)}</span>
                    <span className="block font-mono text-[11.5px] text-fg-subtle">{b.number}</span>
                  </button>
                </TableCell>
                <TableCell className="text-fg-muted tabular max-sm:hidden">{f.date(b.issued, "medium")}</TableCell>
                <TableCell align="end" className="font-mono tabular">
                  <span className={b.status === "refunded" ? "text-fg-subtle line-through" : "text-fg"}>{money(b.total)}</span>
                  <span className="mt-0.5 block md:hidden">
                    <Badge tone={billStatusTone[b.status]}>{t(billStatusLabels[b.status])}</Badge>
                  </span>
                </TableCell>
                <TableCell className="max-md:hidden">
                  <Badge tone={billStatusTone[b.status]}>{t(billStatusLabels[b.status])}</Badge>
                  {b.note ? <span className="mt-1 block max-w-[24ch] text-[11.5px] leading-snug text-fg-subtle">{t(b.note)}</span> : null}
                </TableCell>
                <TableCell>
                  <IconButton label={c(`Download ${b.number}`, `${b.number} indir`)} size="sm" variant="ghost" onClick={() => download([b])}>
                    <Download />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="end">
          {open ? (
            <>
              <SheetHeader
                icon={<FileText />}
                title={c(`Invoice ${open.number}`, `${open.number} numaralı fatura`)}
                description={`${t(open.period)} · ${f.date(open.issued, "long")}`}
                action={<Badge tone={billStatusTone[open.status]}>{t(billStatusLabels[open.status])}</Badge>}
              />
              <SheetBody>
                <dl className="grid gap-1 text-[13px]">
                  <dt className="text-fg-subtle">{c("Billed to", "Fatura adresi")}</dt>
                  <dd className="text-fg">{billingProfile.legalName}</dd>
                  <dd className="text-fg-muted">{billingProfile.address}</dd>
                  <dd className="text-fg-muted">
                    {c("Tax office", "Vergi dairesi")} {billingProfile.taxOffice} · {billingProfile.taxId}
                  </dd>
                </dl>
                <table className="mt-6 w-full text-[13px]">
                  <caption className="sr-only">{c("Invoice lines", "Fatura kalemleri")}</caption>
                  <tbody>
                    {open.lines.map((l) => (
                      <tr key={l.label.en} className="border-b border-line">
                        <th scope="row" className="py-2.5 text-start font-normal text-fg-muted">
                          {t(l.label)}
                        </th>
                        <td className="py-2.5 text-end font-mono text-fg tabular">{f.currency(l.amount, { currency: "USD" })}</td>
                      </tr>
                    ))}
                    <tr>
                      <th scope="row" className="pt-3 text-start font-medium text-fg">
                        {c("Total", "Toplam")}
                      </th>
                      <td className="pt-3 text-end font-mono text-base font-medium text-fg tabular">{money(open.total)}</td>
                    </tr>
                  </tbody>
                </table>
                {open.note ? <p className="mt-4 text-xs text-fg-muted">{t(open.note)}</p> : null}
              </SheetBody>
              <SheetFooter>
                <Button onClick={() => download([open])}>
                  <Download /> {c("Download PDF", "PDF indir")}
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
