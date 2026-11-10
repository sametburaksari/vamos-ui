import { Button, EmptyState } from "@vamos-ui/react";

export default function EmptyStateNoResults() {
  return (
    <div className="w-full max-w-lg">
      {/* kind="no-results" is announced (role="status") after a search. */}
      <EmptyState
        kind="no-results"
        title="No contacts match “istanbul” + Enterprise"
        description="Try fewer filters, or check the spelling of the city."
        actions={<Button size="sm">Clear filters</Button>}
      />
    </div>
  );
}
