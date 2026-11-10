import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, type DialogSize } from "@vamos-ui/react";

const sizes: { size: DialogSize; width: string }[] = [
  { size: "sm", width: "400px" },
  { size: "md", width: "520px" },
  { size: "lg", width: "680px" },
  { size: "xl", width: "880px" },
  { size: "full", width: "viewport − 24px" },
];

export default function DialogSizes() {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size, width }) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button>{size}</Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogHeader title={`Size “${size}”`} description={`Maximum width ${width}. Height follows the content up to 85% of the viewport.`} />
            <DialogBody className="text-fg-muted">Use sm for a single question, md for short forms, lg and xl for editors and pickers, full for media and previews.</DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
