import { AtSign, Check, Search } from "lucide-react";
import { Button, Input } from "@vamos-ui/react";

export default function InputAdornments() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input aria-label="Search posts" leading={<Search />} placeholder="Search posts…" />
      <Input aria-label="Username" leading={<AtSign />} placeholder="username" />
      <Input aria-label="Slug" defaultValue="qr-menu-guide" trailing={<Check className="text-success" />} />
      <Input aria-label="Site address" addonStart="https://" addonEnd=".vamos.ist" defaultValue="kadikoy-bistro" />
      <Input
        aria-label="Invite by email"
        type="email"
        placeholder="colleague@company.com"
        addonEnd={
          <Button size="xs" variant="ghost">
            Send invite
          </Button>
        }
      />
    </div>
  );
}
