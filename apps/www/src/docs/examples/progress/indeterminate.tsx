import { Progress } from "@vamos-cms/ui";

export default function ProgressIndeterminate() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      {/* value={null}: no aria-valuenow. Under reduced motion it shows a static hatched half fill. */}
      <Progress label="Preparing your export" value={null} hint="Large exports can take a few minutes." />
      <Progress aria-label="Loading" value={null} size="xs" />
    </div>
  );
}
