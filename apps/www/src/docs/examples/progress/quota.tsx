import { Progress } from "@vamos-ui/react";

const quotas = [
  { label: "Team seats", value: 12, max: 25 },
  { label: "Media storage (GB)", value: 9.2, max: 10 },
  { label: "Emails this month", value: 52400, max: 50000 },
];

export default function ProgressQuota() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      {/* tone="auto": above 80% warning, at or above 100% danger. */}
      {quotas.map((q) => (
        <Progress key={q.label} label={q.label} value={q.value} max={q.max} tone="auto" display="fraction" showValue />
      ))}
    </div>
  );
}
