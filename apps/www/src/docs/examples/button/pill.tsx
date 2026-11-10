import { ArrowRight } from "lucide-react";
import { Button } from "@vamos-cms/ui";

export default function ButtonPill() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button pill variant="solid">
        Get started <ArrowRight />
      </Button>
      <Button pill>Learn more</Button>
    </div>
  );
}
