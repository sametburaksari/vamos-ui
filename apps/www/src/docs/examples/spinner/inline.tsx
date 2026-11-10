import { Check } from "lucide-react";
import { Spinner } from "@vamos-cms/ui";

export default function SpinnerInline() {
  return (
    <div className="grid gap-3 text-[13px]">
      <p className="flex items-center gap-2 text-fg-muted">
        <Spinner size="xs" />
        Saving changes…
      </p>
      <p className="flex items-center gap-2 text-success">
        <Check className="size-3.5" />
        All changes saved
      </p>
    </div>
  );
}
