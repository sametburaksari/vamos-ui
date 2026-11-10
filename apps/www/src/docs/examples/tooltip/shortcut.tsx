import { Search, Send } from "lucide-react";
import { Button, Tooltip } from "@vamos-ui/react";

export default function TooltipShortcut() {
  return (
    <div className="flex items-center gap-3">
      <Tooltip content="Search everything" shortcut="mod+k">
        <Button variant="secondary">
          <Search /> Search
        </Button>
      </Tooltip>
      {/* ⌘ ↩ on macOS, Ctrl Enter elsewhere */}
      <Tooltip content="Send reply" shortcut={["mod", "enter"]}>
        <Button variant="primary">
          <Send /> Send
        </Button>
      </Tooltip>
    </div>
  );
}
