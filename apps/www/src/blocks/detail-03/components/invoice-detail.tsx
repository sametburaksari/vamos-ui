"use client";

import * as React from "react";
import { BellRing, CircleDollarSign, Download, ReceiptText } from "lucide-react";
import {
  ActivityTimeline,
  AttachmentList,
  Avatar,
  Badge,
  Button,
  DescriptionGroup,
  DescriptionList,
  EntityCard,
  Progress,
  RecordAside,
  RecordAsideSection,
  RecordHeader,
  RecordLayout,
  RecordMain,
  RecordSection,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  toast,
  useFormat,
} from "@vamos-ui/react";
import { computeLineTotals, LineItems } from "@vamos-ui/react/business";
import { activity, attachments, customer, documentDiscount, invoice, lines, NOW, payments, seller } from "./data";

/** Decimal string → integer cents, so money math never touches floats. */
const cents = (v: string) => {
  const [whole = "0", frac = ""] = v.replace("-", "").split(".");
  const n = BigInt(whole) * 100n + BigInt((frac + "00").slice(0, 2));
  return v.startsWith("-") ? -n : n;
};
const decimal = (c: bigint) => `${c < 0n ? "-" : ""}${(c < 0n ? -c : c) / 100n}.${String((c < 0n ? -c : c) % 100n).padStart(2, "0")}`;

/** Invoice detail: document with parties, line items and totals; payments, activity and status aside. */
export function InvoiceDetail() {
  const f = useFormat();
  const money = (v: string) => f.currency(v, invoice.currency);
  const totals = React.useMemo(() => computeLineTotals(lines, { documentDiscount }), []);
  const paidCents = payments.reduce((sum, p) => sum + cents(p.amount), 0n);
  const dueCents = cents(totals.payable) - paidCents;
  const paid = decimal(paidCents);
  const balance = decimal(dueCents);
  const paidRatio = Number(paidCents) / Number(cents(totals.payable));

  return (
    <RecordLayout className="mx-auto max-w-[1280px]">
      <RecordHeader
        back={{ href: "/work/invoices", label: "Invoices" }}
        media={<Avatar name={customer.name} size="xl" shape="square" fallback={<ReceiptText aria-hidden />} />}
        title={<span className="font-mono tracking-[-0.02em]">{invoice.number}</span>}
        subtitle={`${customer.name} · ${invoice.project}`}
        status={<Badge tone="warning" dot>Partially paid</Badge>}
        facts={[
          { label: "Issued", value: f.date(invoice.issued, "medium") },
          { label: "Due", value: `${f.date(invoice.due, "medium")} · in 16 days` },
          { label: "Total", value: <span className="tabular">{money(totals.payable)}</span> },
          { label: "Balance due", value: <span className="tabular font-semibold text-fg">{money(balance)}</span> },
        ]}
        actions={
          <>
            <Button onClick={() => toast(`Downloading ${invoice.number}.pdf`)}>
              <Download /> PDF
            </Button>
            <Button onClick={() => toast.success(`Reminder sent to ${customer.email}`)}>
              <BellRing /> Remind
            </Button>
            <Button variant="primary" onClick={() => toast.success("Payment form opened")}>
              <CircleDollarSign /> Record payment
            </Button>
          </>
        }
      />

      <RecordMain>
        <RecordSection title="Invoice" description={`Created from quote ${invoice.quote} · ${invoice.terms}`}>
          <div className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <DescriptionGroup title="From">
                <address className="text-[13.5px] not-italic leading-relaxed text-fg-muted">
                  <span className="block font-medium text-fg">{seller.name}</span>
                  {seller.lines.map((l) => <span key={l} className="block">{l}</span>)}
                  <span className="mt-1 block font-mono text-[12px] text-fg-subtle">{seller.taxId}</span>
                </address>
              </DescriptionGroup>
              <DescriptionGroup title="Bill to">
                <address className="text-[13.5px] not-italic leading-relaxed text-fg-muted">
                  <span className="block font-medium text-fg">{customer.name}</span>
                  <span className="block">{customer.contact}</span>
                  {customer.lines.map((l) => <span key={l} className="block">{l}</span>)}
                  <span className="mt-1 block font-mono text-[12px] text-fg-subtle">{customer.taxId}</span>
                </address>
              </DescriptionGroup>
            </div>

            <Separator />

            <LineItems
              readOnly
              aria-label={`${invoice.number} lines`}
              currency={invoice.currency}
              columns={["description", "quantity", "unit", "unitPrice", "discount", "tax", "total"]}
              defaultValue={lines}
              documentDiscount={documentDiscount}
              summaryFooter={
                <DescriptionList
                  size="sm"
                  labelWidth="9rem"
                  className="pt-2"
                  items={[
                    { key: "paid", label: "Paid", value: <span className="tabular text-success">−{money(paid)}</span> },
                    { key: "balance", label: <span className="font-semibold text-fg">Balance due</span>, value: <span className="tabular font-semibold text-fg">{money(balance)}</span> },
                  ]}
                />
              }
            />

            <p className="max-w-prose text-[12.5px] leading-relaxed text-fg-muted">
              Please pay by bank transfer to IBAN TR33 0006 1005 1978 6457 8413 26 (BIC TGBATRIS) and quote {invoice.number} as the reference. Questions about this invoice: {seller.email}.
            </p>
          </div>
        </RecordSection>

        <RecordSection title="Payments" padding="none" action={<Button size="sm" onClick={() => toast.success("Payment form opened")}>Record payment</Button>}>
          <TableContainer aria-label={`Payments for ${invoice.number}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="max-md:hidden">Reference</TableHead>
                  <TableHead numeric>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{f.date(p.date, "medium")}</TableCell>
                    <TableCell className="text-fg-muted">{p.method}</TableCell>
                    <TableCell className="font-mono text-[12px] text-fg-subtle max-md:hidden">{p.reference}</TableCell>
                    <TableCell numeric>{money(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </RecordSection>

        <RecordSection title="Activity">
          <ActivityTimeline items={activity} now={NOW} groupBy="day" />
        </RecordSection>
      </RecordMain>

      <RecordAside>
        <RecordAsideSection title="Payment">
          <Progress
            label="Collected"
            value={Math.round(paidRatio * 100)}
            size="md"
            valueText={`${money(paid)} of ${money(totals.payable)} collected`}
            showValue={() => <span className="tabular">{money(paid)} <span className="text-fg-subtle">of {money(totals.payable)}</span></span>}
            hint={`Next reminder on ${f.date("2026-11-24", "medium")}`}
          />
        </RecordAsideSection>
        <RecordAsideSection title="Customer" collapsible>
          <EntityCard kind="organization" variant="compact" name={customer.name} subtitle={customer.contact} href="#harbor-pine" contact={{ email: customer.email }} />
        </RecordAsideSection>
        <RecordAsideSection title="Details" collapsible>
          <DescriptionList
            layout="vertical"
            size="sm"
            items={[
              { key: "quote", label: "Quote", value: <a href="#q-2026-114" className="font-mono text-accent-ink hover:underline">{invoice.quote}</a> },
              { key: "po", label: "Customer PO", value: invoice.po, copyable: true },
              { key: "terms", label: "Payment terms", value: `${invoice.terms} · due ${f.date(invoice.due, "medium")}` },
              { key: "currency", label: "Currency", value: "Euro (EUR)" },
            ]}
          />
        </RecordAsideSection>
        <RecordAsideSection title="Attachments" collapsible>
          <AttachmentList items={attachments} size="sm" readOnly onPreview={(file) => toast(`Opening ${file.name}`)} />
        </RecordAsideSection>
      </RecordAside>
    </RecordLayout>
  );
}
