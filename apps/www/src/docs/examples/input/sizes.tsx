import { Input } from "@vamos-ui/react";

export default function InputSizes() {
  // Heights follow --control-h, so they shrink with data-density="compact".
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input size="sm" aria-label="Small" placeholder="Small — table filters" />
      <Input aria-label="Medium" placeholder="Medium — forms" />
      <Input size="lg" aria-label="Large" placeholder="Large — website sign-up" />
    </div>
  );
}
