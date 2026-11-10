import { ArrowRight, Plus } from "lucide-react";
import { Button, IconButton } from "@vamos-ui/react";

export default function ButtonSizes() {
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="xl" variant="solid">
          Book a table <ArrowRight />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <IconButton key={size} label={`Add (${size})`} size={size} variant="secondary">
            <Plus />
          </IconButton>
        ))}
      </div>
    </div>
  );
}
