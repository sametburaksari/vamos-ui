import { Info } from "lucide-react";
import { Badge, Tooltip } from "@vamos-ui/react";

export default function TooltipTones() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-fg-muted">
      <span className="inline-flex items-center gap-1.5">
        Net revenue
        {/* inverted (default): opaque high-contrast chip, readable on glass */}
        <Tooltip content="Gross sales minus refunds and payment fees" arrow>
          <button type="button" aria-label="About net revenue" className="rounded-full text-fg-subtle focus-ring hover:text-fg">
            <Info className="size-3.5" />
          </button>
        </Tooltip>
      </span>
      {/* default tone: the floating-layer look, for longer hints */}
      <Tooltip tone="default" content="Visible to everyone with the link. Search engines may index it." side="bottom" arrow>
        <Badge tone="success" dot tabIndex={0} className="focus-ring">
          Public
        </Badge>
      </Tooltip>
      <span>
        Billed in{" "}
        <Tooltip content="Coordinated Universal Time">
          <abbr tabIndex={0} className="cursor-help underline decoration-dotted underline-offset-4 focus-ring">
            UTC
          </abbr>
        </Tooltip>
      </span>
    </div>
  );
}
