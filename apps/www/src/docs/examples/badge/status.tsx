import { Badge } from "@vamos-cms/ui";

const statuses = [
  { label: "Published", tone: "success" },
  { label: "Scheduled", tone: "info" },
  { label: "In review", tone: "warning" },
  { label: "Draft", tone: "neutral" },
] as const;

export default function BadgeStatus() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((s) => (
        <Badge key={s.label} tone={s.tone} size="md" dot>
          {s.label}
        </Badge>
      ))}
    </div>
  );
}
