import { ex, type DocEntry } from "../types";
import BackupCodesDemo from "../examples/backup-codes/demo";
import BackupCodesUsed from "../examples/backup-codes/used";
import BackupCodesSecuritySettings from "../examples/backup-codes/security-settings";

const entry: DocEntry = {
  slug: "backup-codes",
  title: "Backup codes",
  group: "Data display",
  description:
    "One-time recovery codes shown after two-factor enrolment and in security settings: a numbered monospace grid with copy, download as .txt and regenerate. Spent codes stay visible, struck through and announced as used.",
  source: ["components/backup-codes.tsx"],
  usage: `import { BackupCodes } from "@vamos-ui/react";

<BackupCodes codes={codes} used={spent} onRegenerate={regenerate} />`,
  demo: ex("demo", "Demo", "backup-codes/demo.tsx", BackupCodesDemo),
  examples: [
    ex("used", "Used codes", "backup-codes/used.tsx", BackupCodesUsed, "used marks spent codes; the header counts what is left."),
    ex("security-settings", "Security settings (admin)", "backup-codes/security-settings.tsx", BackupCodesSecuritySettings, "With a warning and regenerate — the button shows a spinner while new codes are issued."),
  ],
  api: [
    { name: "BackupCodes", props: [
      { name: "codes", type: "string[]", description: "Codes in display order." },
      { name: "used", type: "string[]", description: "Spent codes — struck through, \"(used)\" for screen readers and in the file." },
      { name: "title", type: "ReactNode | null", default: '"Backup codes"', description: "Group label; null hides the header (label the group yourself)." },
      { name: "filename", type: "string", default: '"backup-codes.txt"', description: "Downloaded file name." },
      { name: "fileNote", type: "string", description: "First line of the copied / downloaded text (service and account)." },
      { name: "onCopy", type: "(text) => void", description: "After copying. The status region announces it either way." },
      { name: "onDownload", type: "(text) => void", description: "Replace the built-in Blob download." },
      { name: "onRegenerate / regenerating", type: "() => void / boolean", description: "Shows \"New codes\" with a loading state." },
      { name: "labels", type: "Partial<BackupCodesLabels>", description: 'Dictionary namespace "backupCodes": title, copy, copied, copiedAnnouncement, download, regenerate, used, remaining ("{left} of {total} left"), fileHeader.' },
    ] },
  ],
  notes: ["Codes are rendered with translate=\"no\" and select-all, so browser translation never touches them and one click selects a code."],
  covers: [],
};

export default entry;
