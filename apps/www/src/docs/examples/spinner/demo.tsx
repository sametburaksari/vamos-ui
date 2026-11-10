import { Spinner } from "@vamos-cms/ui";

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-6">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" tone="muted" />
      <Spinner size="lg" tone="accent" label="Loading dashboard" />
    </div>
  );
}
