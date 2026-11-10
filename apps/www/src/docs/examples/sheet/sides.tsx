import { Button, Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger, type SheetSide } from "@vamos-ui/react";

const sides: { side: SheetSide; note: string }[] = [
  { side: "start", note: "Mobile navigation. Opens from the right in RTL." },
  { side: "end", note: "Record previews and quick edits." },
  { side: "top", note: "Announcements and search." },
  { side: "bottom", note: "Mobile filters and actions." },
];

export default function SheetSides() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex">
      {sides.map(({ side, note }) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button>{side}</Button>
          </SheetTrigger>
          <SheetContent side={side} size="sm">
            <SheetHeader title={`side="${side}"`} description={note} />
            <SheetBody className="text-fg-muted">start and end are logical edges, so they follow the reading direction.</SheetBody>
          </SheetContent>
        </Sheet>
      ))}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost">end · inset</Button>
        </SheetTrigger>
        <SheetContent side="end" size="sm" inset>
          <SheetHeader title="Floating panel" description="inset adds an 8px gutter and full radius." />
        </SheetContent>
      </Sheet>
    </div>
  );
}
