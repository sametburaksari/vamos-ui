import { Progress } from "@vamos-cms/ui";

export default function ProgressDemo() {
  return (
    <div className="w-full max-w-sm">
      <Progress label="Uploading 4 photos" value={42} showValue hint="About 30 seconds left" />
    </div>
  );
}
