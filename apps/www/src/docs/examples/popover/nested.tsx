import { Palette } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "@vamos-ui/react";

const swatches = ["var(--accent)", "var(--info)", "var(--success)", "var(--warning)", "var(--danger)"];

export default function PopoverNested() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Label settings</Button>
      </PopoverTrigger>
      {/* depth 1: the only layer that blurs in glass mode */}
      <PopoverContent size="sm">
        <PopoverHeader title="Label: Priority" description="Shown on cards in every board." />
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" block>
              <Palette /> Change colour
            </Button>
          </PopoverTrigger>
          {/* depth 2: switches to the opaque --popover-nested, no second blur */}
          <PopoverContent size="auto" side="right" align="start">
            <PopoverHeader title="Colour" className="mb-2" />
            <div className="flex gap-1.5">
              {swatches.map((c) => (
                <button key={c} type="button" aria-label={c.replace(/var\(--|\)/g, "")} className="size-6 rounded-full ring-1 ring-line focus-ring" style={{ background: c }} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </PopoverContent>
    </Popover>
  );
}
