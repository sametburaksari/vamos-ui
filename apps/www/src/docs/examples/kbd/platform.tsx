import { KbdGroup } from "@vamos-ui/react";

const shortcuts = [
  { label: "Save draft", keys: "mod+s" },
  { label: "Publish", keys: "mod+shift+enter" },
  { label: "Insert link", keys: "mod+k" },
  { label: "Toggle sidebar", keys: "mod+\\" },
];

export default function KbdPlatform() {
  // "mod" is ⌘ on macOS and iOS, Ctrl everywhere else. Modifier order follows the platform.
  return (
    <dl className="grid w-full max-w-sm gap-2.5 text-sm">
      {shortcuts.map((s) => (
        <div key={s.label} className="flex items-center justify-between gap-6">
          <dt className="text-fg-muted">{s.label}</dt>
          <dd>
            <KbdGroup keys={s.keys} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
