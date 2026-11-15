import { ReleaseNotes } from "@vamos-ui/react";

export default function ReleaseNotesCustomTypes() {
  return (
    <div className="w-full max-w-3xl">
      <ReleaseNotes
        types={{
          feature: { label: "Feature", tone: "accent" },
          improvement: { label: "Improvement", tone: "info" },
          fix: { label: "Fix", tone: "neutral" },
        }}
        releases={[
          {
            version: "1.4",
            date: "2026-11-03",
            title: "Offline drafts",
            href: "#",
            changes: [
              { type: "feature", title: "Drafts are kept on the device while offline" },
              { type: "improvement", title: "The editor opens 40% faster on large documents" },
              { type: "fix", title: "Pasted tables lost their header row" },
            ],
          },
        ]}
      />
    </div>
  );
}
