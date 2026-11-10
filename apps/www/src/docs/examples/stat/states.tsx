import { RotateCw } from "lucide-react";
import { Button, Stat, StatGroup } from "@vamos-cms/ui";

export default function StatStates() {
  return (
    <StatGroup columns={3} className="w-full">
      <Stat label="Visitors" loading />
      <Stat label="Conversion rate" value={null} comparison="Tracking starts tomorrow" />
      <Stat
        label="Revenue"
        error="Couldn’t reach the billing service."
        errorAction={
          <Button size="xs" variant="ghost">
            <RotateCw /> Retry
          </Button>
        }
      />
    </StatGroup>
  );
}
