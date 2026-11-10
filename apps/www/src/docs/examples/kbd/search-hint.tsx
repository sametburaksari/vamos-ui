import { Search } from "lucide-react";
import { Input, KbdGroup } from "@vamos-cms/ui";

export default function KbdSearchHint() {
  return (
    <Input
      aria-label="Search"
      placeholder="Search contacts, deals, invoices…"
      leading={<Search />}
      trailing={<KbdGroup keys="mod+k" size="sm" variant="ghost" />}
      className="max-w-sm"
    />
  );
}
