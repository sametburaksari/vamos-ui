import { Search } from "lucide-react";
import { Input } from "@vamos-cms/ui";

export default function InputClearable() {
  // The clear button is skipped in the tab order; Esc clears too.
  return <Input aria-label="Search contacts" leading={<Search />} defaultValue="Ayşe" clearable placeholder="Search contacts" className="max-w-sm" />;
}
