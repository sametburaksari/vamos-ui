import { Download, Plus } from "lucide-react";
import { Button, PageHeader } from "@vamos-cms/ui";

export default function PageHeaderDemo() {
  return (
    <PageHeader
      className="w-full"
      eyebrow="Content"
      title="Posts"
      description="128 posts · 6 scheduled for this week. Drafts older than 90 days are archived automatically."
      actions={
        <>
          <Button>
            <Download /> Export
          </Button>
          <Button variant="primary">
            <Plus /> New post
          </Button>
        </>
      }
    />
  );
}
