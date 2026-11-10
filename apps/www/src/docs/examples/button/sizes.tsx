import { Button } from "@vamos-cms/ui";

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
