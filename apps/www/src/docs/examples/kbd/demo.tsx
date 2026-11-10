import { KbdGroup } from "@vamos-cms/ui";

export default function KbdDemo() {
  return (
    <p className="flex items-center gap-2 text-sm text-fg-muted">
      Press <KbdGroup keys="mod+k" /> to search posts, people and settings
    </p>
  );
}
