import { Minus, Plus, LocateFixed } from "lucide-react";
import { ButtonGroup, IconButton } from "@vamos-cms/ui";

export default function ButtonGroupVertical() {
  return (
    <div className="flex items-start gap-6">
      <ButtonGroup orientation="vertical" aria-label="Map zoom" variant="secondary" size="sm">
        <IconButton label="Zoom in">
          <Plus />
        </IconButton>
        <IconButton label="Zoom out">
          <Minus />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Map" variant="secondary" size="sm" attached={false}>
        <IconButton label="Show my location">
          <LocateFixed />
        </IconButton>
      </ButtonGroup>
    </div>
  );
}
