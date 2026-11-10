import { FileImage, FileText } from "lucide-react";
import { Progress } from "@vamos-cms/ui";

const files = [
  { name: "hero-winter-menu.jpg", size: "2.4 MB", value: 100, icon: FileImage },
  { name: "lamb-tandir-close-up.jpg", size: "3.1 MB", value: 68, icon: FileImage },
  { name: "sahlep-bar.png", size: "5.8 MB", value: 21, icon: FileImage },
  { name: "allergen-list.pdf", size: "640 KB", value: null, icon: FileText },
];

export default function ProgressUploadList() {
  return (
    <ul className="grid w-full max-w-md gap-1 rounded-ui border border-line bg-surface p-2">
      {files.map(({ name, size, value, icon: Icon }) => (
        <li key={name} className="flex items-center gap-3 rounded-ui-sm px-2 py-2">
          <span className="surface-2 flex size-9 shrink-0 items-center justify-center rounded-ui-sm text-fg-muted">
            <Icon className="size-4" />
          </span>
          <div className="grid min-w-0 flex-1 gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-[13px]">
              <span className="truncate font-medium">{name}</span>
              <span className="shrink-0 font-mono text-[11px] text-fg-subtle tabular">{value === 100 ? size : value === null ? "Queued" : `${value}%`}</span>
            </div>
            <Progress aria-label={`Uploading ${name}`} value={value} size="xs" />
          </div>
        </li>
      ))}
    </ul>
  );
}
