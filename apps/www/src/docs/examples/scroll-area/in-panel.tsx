import { Check } from "lucide-react";
import { ScrollArea, itemVariants, itemSlots } from "@vamos-cms/ui";

const timezones = ["Europe/Istanbul", "Europe/London", "Europe/Berlin", "Europe/Madrid", "America/New_York", "America/Chicago", "America/Los_Angeles", "America/Sao_Paulo", "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"];

// A long option list in a floating panel (popover, combobox, command).
export default function ScrollAreaInPanel() {
  return (
    <div className="surface-popover w-64 rounded-ui p-1">
      <ScrollArea maxHeight={208}>
        <ul role="listbox" aria-label="Time zone" className="flex flex-col">
          {timezones.map((tz, i) => (
            <li key={tz} role="option" aria-selected={i === 0} className={itemVariants({ size: "sm", inset: true })}>
              {i === 0 ? <Check className={itemSlots.indicator} /> : null}
              <span className={itemSlots.label}>{tz.replace("_", " ")}</span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
