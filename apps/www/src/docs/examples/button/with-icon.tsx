import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@vamos-ui/react";

export default function ButtonWithIcon() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="primary">
        <Plus /> New post
      </Button>
      <Button>
        <Download /> Export
      </Button>
      <Button variant="danger-ghost">
        <Trash2 /> Delete forever
      </Button>
    </div>
  );
}
