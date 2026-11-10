import Link from "next/link";
import { Button } from "@vamos-cms/ui";

export default function ButtonAsLink() {
  return (
    <Button asChild variant="secondary">
      <Link href="/docs/components">Browse components</Link>
    </Button>
  );
}
