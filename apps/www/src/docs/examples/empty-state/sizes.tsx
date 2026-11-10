import { Inbox } from "lucide-react";
import { Button, EmptyState } from "@vamos-cms/ui";

export default function EmptyStateSizes() {
  return (
    <div className="grid w-full items-start gap-4 lg:grid-cols-[1fr_1.4fr]">
      <EmptyState size="sm" framed icon={<Inbox />} title="No messages" description="Small — inside a card or popover." />
      <EmptyState
        size="lg"
        framed
        as="h2"
        title="Launch your first site"
        description="Large — a whole page. The title switches to the display font."
        actions={<Button variant="primary">Create a site</Button>}
      />
    </div>
  );
}
