import { Plus } from "lucide-react";
import { Button, Heading, Text } from "@vamos-cms/ui";

export default function TypographyPageHeader() {
  return (
    <header className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="grid gap-1.5">
        <Text size="xs" tone="subtle">
          CRM · Pipeline
        </Text>
        {/* level 1 for the outline, size xl for the look */}
        <Heading level={1} size="xl">
          Deals <em>in motion</em>
        </Heading>
        <Text tone="muted" size="sm">
          42 open deals worth <span className="tabular text-fg">$684,200</span> · 9 closing this month
        </Text>
      </div>
      <Button variant="primary">
        <Plus /> New deal
      </Button>
    </header>
  );
}
