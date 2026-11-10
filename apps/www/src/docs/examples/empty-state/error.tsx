import { RotateCw } from "lucide-react";
import { Button, EmptyState } from "@vamos-ui/react";

export default function EmptyStateError() {
  return (
    <EmptyState
      kind="error"
      framed
      title="Couldn't load the pipeline"
      description="The CRM service took too long to respond. Your data is safe."
      actions={
        <Button>
          <RotateCw /> Try again
        </Button>
      }
    />
  );
}
