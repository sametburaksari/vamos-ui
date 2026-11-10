import { Save } from "lucide-react";
import { Button } from "@vamos-cms/ui";

export default function ButtonLoading() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* inline: the spinner replaces the leading icon */}
      <Button loading>
        <Save /> Save draft
      </Button>
      {/* loadingText is shown and announced */}
      <Button variant="primary" loading loadingText="Publishing…">
        Publish
      </Button>
      {/* replace: label hidden, width unchanged */}
      <Button variant="solid" loading loadingMode="replace">
        Send invoice
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
