"use client";

import { Estimator, type EstimateResult, type EstimatorInput, type EstimatorValues } from "@vamos-ui/react";

const inputs: EstimatorInput[] = [
  { type: "slider", id: "editors", label: "Editors", min: 1, max: 40, defaultValue: 6, hint: "Viewers are free on every plan.", withInput: true },
  { type: "slider", id: "gb", label: "Data scanned per month", min: 10, max: 4000, step: 10, defaultValue: 800, format: (v) => `${v.toLocaleString("en-US")} GB` },
];

function plans(v: EstimatorValues): EstimateResult {
  const e = v.editors as number;
  const gb = v.gb as number;
  const team = e * 20 + Math.max(0, gb - 500) * 0.05;
  const business = e * 35 + Math.max(0, gb - 2000) * 0.05;
  const rows = [
    { id: "free", label: "Free", amount: e <= 3 && gb <= 50 ? 0 : null, detail: "Up to 3 editors and 50 GB" },
    { id: "team", label: "Team", amount: e <= 25 ? Math.round(team) : null, detail: `${e} × $20 + data over 500 GB` },
    { id: "business", label: "Business", amount: Math.round(business), detail: `${e} × $35 + data over 2,000 GB` },
  ];
  const best = rows.filter((r) => r.amount != null).sort((a, b) => a.amount! - b.amount!)[0]!;
  return {
    total: best.amount,
    lines: rows.map((r) => ({ ...r, text: r.amount == null ? "Doesn't fit" : undefined, highlight: r.id === best.id, badge: r.id === best.id ? "Best fit" : undefined })),
    notes: ["Monthly billing, excluding tax. Yearly billing takes two months off."],
  };
}

export default function EstimatorPlans() {
  return (
    <div className="w-full max-w-4xl">
      <Estimator inputs={inputs} formula={plans} title="What would we pay?" totalLabel="Cheapest plan that fits" totalSuffix="/ month" cta="Start a trial" onSubmit={() => {}} />
    </div>
  );
}
