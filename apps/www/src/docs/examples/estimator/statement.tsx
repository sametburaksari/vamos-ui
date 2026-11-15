"use client";

import * as React from "react";
import { Button, Estimator, Field, Input, type EstimateResult, type EstimatorInput, type EstimatorValues } from "@vamos-ui/react";

const types: Record<string, number> = { sole: 1800, ltd: 3200, corp: 5400 };

const inputs: EstimatorInput[] = [
  {
    type: "options",
    id: "type",
    label: "What kind of company?",
    columns: 3,
    options: [
      { value: "sole", label: "Sole trader", description: "One owner, simple books", meta: "$1,800" },
      { value: "ltd", label: "Limited company", description: "Double-entry, quarterly returns", meta: "$3,200" },
      { value: "corp", label: "Corporation", description: "Board, audit-ready year end", meta: "$5,400" },
    ],
  },
  { type: "slider", id: "staff", label: "People on payroll", min: 0, max: 60, defaultValue: 4, hint: "$90 per person a month: payslips and filings.", format: (n) => (n ? `${n} people` : "No employees") },
  {
    type: "options",
    id: "invoices",
    label: "Invoices a month",
    variant: "segmented",
    options: [
      { value: "50", label: "Up to 50" },
      { value: "200", label: "Up to 200" },
      { value: "500", label: "Up to 500" },
    ],
  },
  {
    type: "addons",
    id: "extras",
    label: "Anything extra?",
    options: [
      { value: "review", label: "Monthly review meeting", meta: "+ $600" },
      { value: "audit", label: "Audit-ready year end", meta: "+ $900", description: "For companies with an independent audit.", when: (v) => v.type === "corp" },
    ],
  },
];

function fee(v: EstimatorValues): EstimateResult {
  const staff = v.staff as number;
  const band = { "50": 0, "200": 700, "500": 1600 }[v.invoices as string] ?? 0;
  const extras = v.extras as string[];
  const items = [
    { id: "base", label: "Bookkeeping and returns", amount: types[v.type as string]! },
    ...(staff ? [{ id: "payroll", label: "Payroll", amount: staff * 90, detail: `${staff} × $90` }] : []),
    ...(band ? [{ id: "volume", label: "Invoice volume", amount: band }] : []),
    ...(extras.includes("review") ? [{ id: "review", label: "Monthly review", amount: 600 }] : []),
    ...(extras.includes("audit") ? [{ id: "audit", label: "Audit-ready year end", amount: 900 }] : []),
  ];
  const net = items.reduce((s, l) => s + l.amount, 0);
  const tax = Math.round(net * 0.2);
  return {
    total: net + tax,
    lines: [...items, { id: "net", label: "Monthly, excl. tax", amount: net, kind: "subtotal" }, { id: "tax", label: "Tax 20%", amount: tax, kind: "tax" }],
    notes: ["Valid for engagements signed this year."],
  };
}

export default function EstimatorStatement() {
  const [sent, setSent] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-4xl gap-8">
      <Estimator inputs={inputs} formula={fee} numbered title="Fee statement" totalLabel="Monthly total" totalSuffix="/ month" name="estimate" form="fee-contact" />
      <form
        id="fee-contact"
        className="grid gap-4 rounded-ui-lg border border-line p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(String(new FormData(e.currentTarget).get("estimate")));
        }}
      >
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        </Field>
        <Button type="submit" variant="primary">
          Book a call about this estimate
        </Button>
        {sent ? <pre className="m-0 overflow-x-auto rounded-ui-sm bg-surface-2 p-3 text-xs sm:col-span-2">{sent}</pre> : null}
      </form>
    </div>
  );
}
