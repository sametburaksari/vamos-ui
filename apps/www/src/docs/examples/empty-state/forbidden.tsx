import { Button, EmptyState } from "@vamos-ui/react";

export default function EmptyStateForbidden() {
  return (
    <EmptyState
      kind="forbidden"
      title="You don't have access to Payroll"
      description="Payroll is limited to the Finance role. Ask an admin — Deniz Aydın manages roles for your workspace."
      actions={<Button>Request access</Button>}
    />
  );
}
