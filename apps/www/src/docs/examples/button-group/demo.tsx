import { Copy, Eye, Pencil } from "lucide-react";
import { Button, ButtonGroup } from "@vamos-cms/ui";

export default function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="Post actions">
      <Button>
        <Eye /> Preview
      </Button>
      <Button>
        <Pencil /> Edit
      </Button>
      <Button>
        <Copy /> Duplicate
      </Button>
    </ButtonGroup>
  );
}
