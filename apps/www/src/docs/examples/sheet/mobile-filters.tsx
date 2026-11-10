import { SlidersHorizontal } from "lucide-react";
import { Badge, Button, Checkbox, Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "@vamos-ui/react";

const statuses = ["Paid", "Unpaid", "Overdue", "Refunded"];

export default function SheetMobileFilters() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <SlidersHorizontal /> Filters <Badge tone="accent" count={2} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" size="lg">
        <SheetHeader title="Filter invoices" description="1,284 invoices · 2 filters applied" />
        <SheetBody className="grid gap-3">
          <p className="text-[13px] font-medium text-fg-muted">Status</p>
          {statuses.map((s) => (
            <Checkbox key={s} label={s} defaultChecked={s === "Unpaid" || s === "Overdue"} />
          ))}
        </SheetBody>
        <SheetFooter align="between">
          <Button variant="ghost">Clear all</Button>
          <SheetClose asChild>
            <Button variant="primary">Show 212 invoices</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
