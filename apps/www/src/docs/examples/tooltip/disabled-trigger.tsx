import { Rocket } from "lucide-react";
import { Button, Tooltip } from "@vamos-ui/react";

export default function TooltipDisabledTrigger() {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* A disabled button fires no events, so Tooltip wraps it in a focusable span. */}
      <Tooltip content="Add a featured image before publishing" side="bottom">
        <Button variant="primary" disabled>
          <Rocket /> Publish
        </Button>
      </Tooltip>
      <p className="text-xs text-fg-subtle">Hover or tab to the button to see why.</p>
    </div>
  );
}
