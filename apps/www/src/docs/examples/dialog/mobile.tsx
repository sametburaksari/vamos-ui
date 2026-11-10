import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@vamos-ui/react";

const modes = [
  { mobile: "sheet", label: "Sheet (default)", note: "Anchors to the bottom; footer buttons stack with the primary on top." },
  { mobile: "center", label: "Center", note: "Stays a centred card — good for short questions." },
  { mobile: "fullscreen", label: "Fullscreen", note: "Fills the screen — use it for long forms (iOS keyboard friendly)." },
] as const;

export default function DialogMobile() {
  return (
    <div className="grid gap-3 text-center">
      <p className="text-[13px] text-fg-muted">Narrow your browser below 640px, then open each one.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {modes.map((m) => (
          <Dialog key={m.mobile}>
            <DialogTrigger asChild>
              <Button>{m.label}</Button>
            </DialogTrigger>
            <DialogContent size="sm" mobile={m.mobile}>
              <DialogHeader title="Archive 12 orders?" description={m.note} />
              <DialogBody className="text-fg-muted">Archived orders leave the list but stay in reports and exports.</DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="primary">Archive</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
