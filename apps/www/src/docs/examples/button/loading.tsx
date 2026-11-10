import { Button } from "@vamos-cms/ui";

export default function ButtonLoading() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button loading>Saving</Button>
      <Button variant="primary" loading>
        Publishing
      </Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}
