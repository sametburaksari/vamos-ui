import { Copy, Eye, Pencil, Trash2 } from "lucide-react";
import { KbdGroup, Separator, itemSlots, itemVariants } from "@vamos-cms/ui";

const actions = [
  { label: "Edit", icon: Pencil, keys: "e" },
  { label: "Preview", icon: Eye, keys: "mod+p" },
  { label: "Duplicate", icon: Copy, keys: "mod+d" },
];

// A static menu surface. The real Dropdown Menu uses the same itemVariants + Kbd.
export default function KbdInMenu() {
  return (
    <div className="surface-popover grid w-64 rounded-ui p-1">
      {actions.map(({ label, icon: Icon, keys }) => (
        <button key={label} type="button" className={itemVariants()}>
          <Icon className={itemSlots.icon} />
          <span className={itemSlots.label}>{label}</span>
          <KbdGroup keys={keys} size="sm" variant="ghost" />
        </button>
      ))}
      <Separator className="my-1" />
      <button type="button" className={itemVariants({ tone: "danger" })}>
        <Trash2 className={itemSlots.icon} />
        <span className={itemSlots.label}>Move to trash</span>
        <KbdGroup keys="mod+backspace" size="sm" variant="ghost" />
      </button>
    </div>
  );
}
