import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@vamos-ui/react";

// The height animates with ui-collapse. data-motion="off" (or prefers-reduced-motion) opens it instantly.
export default function CollapsibleMotion() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      {(["subtle", "off"] as const).map((motion) => (
        <div key={motion} data-motion={motion} className="surface-2 rounded-ui-lg px-4 py-2">
          <Collapsible>
            <CollapsibleTrigger meta={`data-motion="${motion}"`}>Release notes 4.2</CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="m-0 flex list-disc flex-col gap-1 ps-5 pb-2 text-[13px] text-fg-muted">
                <li>Bulk edit for price lists</li>
                <li>Faster CSV import (up to 50k rows)</li>
                <li>Two-factor recovery codes</li>
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  );
}
