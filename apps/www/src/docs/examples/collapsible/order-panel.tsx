import { Package, Receipt, Truck } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@vamos-ui/react";

// A CRM order side panel: each block is independent (several may be open), so Collapsible fits better than Accordion.
const rows = {
  shipping: [["Carrier", "Northline Express"], ["Tracking", "NLX 4471 0932"], ["ETA", "Thu, 14 Nov"]],
  billing: [["Subtotal", "€1,240.00"], ["VAT 20%", "€248.00"], ["Total", "€1,488.00"]],
};

function Rows({ items }: { items: string[][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 pb-3 ps-[26px] text-[13px]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-fg-subtle">{k}</dt>
          <dd className="m-0 text-end tabular text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function CollapsibleOrderPanel() {
  return (
    <div className="surface w-full max-w-sm divide-y divide-line rounded-ui-lg px-4">
      <Collapsible defaultOpen>
        <CollapsibleTrigger icon={<Truck />} meta="In transit" className="py-3">Shipping</CollapsibleTrigger>
        <CollapsibleContent><Rows items={rows.shipping} /></CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger icon={<Receipt />} meta="€1,488.00" className="py-3">Billing</CollapsibleTrigger>
        <CollapsibleContent><Rows items={rows.billing} /></CollapsibleContent>
      </Collapsible>
      <Collapsible disabled>
        <CollapsibleTrigger icon={<Package />} meta="Not requested" className="py-3">Returns</CollapsibleTrigger>
        <CollapsibleContent />
      </Collapsible>
    </div>
  );
}
