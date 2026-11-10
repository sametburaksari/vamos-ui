import { AtSign, Check, Search } from "lucide-react";
import { Input } from "@vamos-cms/ui";

export default function InputAdornments() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input leading={<Search />} placeholder="Search posts…" />
      <Input leading={<AtSign />} placeholder="username" />
      <Input defaultValue="qr-menu-guide" trailing={<Check className="me-2 text-success" />} />
    </div>
  );
}
