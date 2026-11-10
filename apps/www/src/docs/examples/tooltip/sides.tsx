import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { IconButton, Tooltip, TooltipProvider } from "@vamos-cms/ui";

const sides = [
  { side: "top", label: "Opens above", Icon: ArrowUp },
  { side: "right", label: "Opens to the right", Icon: ArrowRight },
  { side: "bottom", label: "Opens below", Icon: ArrowDown },
  { side: "left", label: "Opens to the left", Icon: ArrowLeft },
] as const;

export default function TooltipSides() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {sides.map(({ side, label, Icon }) => (
          // Radix flips the side automatically when there is no room.
          <Tooltip key={side} content={label} side={side} arrow>
            <IconButton label={label} variant="secondary" tooltip={false}>
              <Icon />
            </IconButton>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
