import Link from "next/link";
import { Badge } from "@vamos-ui/react";

export default function BadgeAsLink() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge asChild tone="warning" size="md" dot>
        <Link href="/docs/components/badge?status=review">In review · 4</Link>
      </Badge>
      <Badge asChild tone="info" size="md" dot>
        <Link href="/docs/components/badge?status=scheduled">Scheduled · 2</Link>
      </Badge>
    </div>
  );
}
