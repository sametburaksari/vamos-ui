import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@vamos-cms/ui";

export default function ButtonAsLinkDisabled() {
  // asChild + disabled/loading: aria-disabled, out of the tab order, clicks blocked.
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button asChild loading>
        <Link href="/docs/components/button">
          <Download /> Export CSV
        </Link>
      </Button>
      <Button asChild disabled variant="ghost">
        <Link href="/docs/components/button">Billing history</Link>
      </Button>
    </div>
  );
}
