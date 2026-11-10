import { Check } from "lucide-react";
import { ProgressCircle } from "@vamos-ui/react";

export default function ProgressCircleExample() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex items-center gap-3">
        <ProgressCircle aria-label="Profile complete" value={72} size="lg" />
        <div className="text-sm">
          <p className="font-medium">Profile 72% complete</p>
          <p className="text-[13px] text-fg-muted">Add a photo and your tax office.</p>
        </div>
      </div>
      <ProgressCircle aria-label="Onboarding steps" value={3} max={5} display="fraction" showValue />
      <ProgressCircle aria-label="Done" value={100} size="md">
        <Check className="size-4" />
      </ProgressCircle>
      <span className="flex items-center gap-2 text-[13px] text-fg-muted">
        <ProgressCircle aria-label="Syncing" size="sm" /> Syncing…
      </span>
    </div>
  );
}
