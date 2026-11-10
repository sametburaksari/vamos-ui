import { Alert, Button } from "@vamos-ui/react";

export default function AlertBanner() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-ui-lg border border-line bg-surface">
      <Alert
        variant="banner"
        tone="warning"
        size="sm"
        actions={
          <Button size="xs" variant="solid">
            Renew plan
          </Button>
        }
      >
        Your Growth plan expires on <strong>Dec 1</strong>. Sites stay online, editing pauses.
      </Alert>
      <div className="grid gap-2 p-6">
        <div className="h-3 w-40 rounded-full bg-skeleton" />
        <div className="h-3 w-64 rounded-full bg-skeleton" />
        <div className="h-3 w-52 rounded-full bg-skeleton" />
      </div>
    </div>
  );
}
