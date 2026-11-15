"use client";

import { Estimator, Progress, type EstimateResult, type EstimatorInput, type EstimatorValues } from "@vamos-ui/react";

const goals: Record<string, number> = { trip: 3000, deposit: 25000, cushion: 8000 };
const RATE = 0.003; // illustrative net monthly rate

const inputs: EstimatorInput[] = [
  {
    type: "select",
    id: "goal",
    label: "Saving for",
    options: [
      { value: "trip", label: "A trip — $3,000" },
      { value: "cushion", label: "A safety cushion — $8,000" },
      { value: "deposit", label: "A home deposit — $25,000" },
    ],
    defaultValue: "cushion",
  },
  { type: "slider", id: "monthly", label: "Each month", min: 50, max: 2000, step: 50, defaultValue: 300, format: (v) => `$${v.toLocaleString("en-US")}` },
  { type: "slider", id: "months", label: "For", min: 6, max: 60, defaultValue: 24, format: (v) => `${v} months`, marks: [12, 24, 36, 48, 60] },
];

function plan(v: EstimatorValues): EstimateResult {
  const target = goals[v.goal as string]!;
  const monthly = v.monthly as number;
  const months = v.months as number;
  let balance = 0;
  let reached: number | null = null;
  for (let i = 1; i <= months; i++) {
    balance = balance * (1 + RATE) + monthly;
    if (reached == null && balance >= target) reached = i;
  }
  const deposited = monthly * months;
  return {
    total: Math.round(balance),
    lines: [
      { id: "deposits", label: "Your deposits", amount: deposited },
      { id: "interest", label: "Interest", amount: Math.round(balance - deposited) },
    ],
    facts: [
      { label: "Goal", value: `$${target.toLocaleString("en-US")}` },
      { label: "Reached in", value: reached ? `month ${reached}` : "not yet" },
    ],
    notes: ["Illustrative rate of 3.6% a year, compounded monthly. Not a forecast."],
  };
}

export default function EstimatorPlanner() {
  return (
    <div className="w-full max-w-4xl">
      <Estimator
        inputs={inputs}
        formula={plan}
        title="Savings plan"
        totalLabel="Balance at the end"
        summaryExtra={(v, r) => <Progress label="Towards the goal" value={r.total ?? 0} max={goals[v.goal as string]} showValue />}
      />
    </div>
  );
}
