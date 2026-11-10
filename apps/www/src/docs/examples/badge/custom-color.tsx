import { Badge } from "@vamos-ui/react";

// Colours users pick for CRM labels; any CSS colour works.
const labels = [
  { name: "Enterprise", color: "#2f6fd6" },
  { name: "Referral", color: "oklch(0.6 0.15 160)" },
  { name: "Churn risk", color: "#c94f7c" },
  { name: "Partner", color: "oklch(0.62 0.14 60)" },
];

export default function BadgeCustomColor() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((l) => (
        <Badge key={l.name} color={l.color} size="md" dot>
          {l.name}
        </Badge>
      ))}
      <Badge shape="square" tone="outline" className="font-mono">
        v2.4.1
      </Badge>
    </div>
  );
}
