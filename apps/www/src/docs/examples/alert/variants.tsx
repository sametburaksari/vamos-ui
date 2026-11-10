import { Alert } from "@vamos-ui/react";

export default function AlertVariants() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Alert tone="info" variant="soft" title="Soft (default)">A tinted surface with a hairline border.</Alert>
      <Alert tone="info" variant="outline" title="Outline">No fill — for dense settings pages.</Alert>
      <Alert tone="info" size="sm">Small, without a title — inside cards and form sections.</Alert>
      <Alert tone="warning" size="sm" icon={false}>
        No icon: pass icon=&#123;false&#125;.
      </Alert>
    </div>
  );
}
