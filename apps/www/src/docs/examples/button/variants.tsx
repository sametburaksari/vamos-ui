import { Button } from "@vamos-cms/ui";

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="solid">Solid</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-ghost">Danger ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
