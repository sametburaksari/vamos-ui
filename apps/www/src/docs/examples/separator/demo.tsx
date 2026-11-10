import { Separator } from "@vamos-ui/react";

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm text-sm">
      <div className="grid gap-0.5">
        <p className="font-medium">Ayşe Kaya</p>
        <p className="text-fg-muted">Account executive · Istanbul office</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-fg-muted">
        <span>12 open deals</span>
        <Separator orientation="vertical" />
        <span>$184,200 pipeline</span>
        <Separator orientation="vertical" />
        <span>Joined 2023</span>
      </div>
    </div>
  );
}
