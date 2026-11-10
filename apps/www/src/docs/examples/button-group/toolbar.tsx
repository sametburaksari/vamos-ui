import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Link2, Underline } from "lucide-react";
import { Separator, Toggle, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";

export default function ButtonGroupToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-ui border border-line bg-surface-2 p-1.5">
      <ToggleGroup type="multiple" variant="ghost" size="sm" aria-label="Text style" defaultValue={["bold"]}>
        <ToggleGroupItem value="bold" label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" label="Italic">
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" label="Underline">
          <Underline />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-5" />
      <ToggleGroup variant="outline" size="sm" aria-label="Alignment" defaultValue="left">
        <ToggleGroupItem value="left" label="Align left">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" label="Align centre">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" label="Align right">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-5" />
      <Toggle size="sm" label="Link">
        <Link2 />
      </Toggle>
    </div>
  );
}
