import { SaveStatus } from "@vamos-ui/react";

const now = new Date("2026-11-10T10:00:00Z");

// Every SaveState. "Saved …" uses Intl.RelativeTimeFormat in the current locale.
export default function EditorLayoutSaveStatus() {
  return (
    <dl className="grid w-full max-w-md gap-3 text-[13px]">
      {(
        [
          ["dirty", <SaveStatus key="d" state="dirty" guard={false} />],
          ["saving", <SaveStatus key="s" state="saving" guard={false} />],
          ["saved", <SaveStatus key="v" state="saved" at={new Date("2026-11-10T09:58:00Z")} now={now} />],
          ["saved (hours)", <SaveStatus key="h" state="saved" at={new Date("2026-11-10T07:00:00Z")} now={now} />],
          ["error", <SaveStatus key="e" state="error" />],
          ["offline", <SaveStatus key="o" state="offline" />],
        ] as const
      ).map(([name, el]) => (
        <div key={name} className="flex items-center justify-between gap-6 border-b border-line pb-3">
          <dt className="font-mono text-[12px] text-fg-subtle">{name}</dt>
          <dd>{el}</dd>
        </div>
      ))}
    </dl>
  );
}
