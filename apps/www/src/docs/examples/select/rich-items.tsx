import { EyeOff, Globe, Link2, Lock } from "lucide-react";
import { Field, Select } from "@vamos-cms/ui";

export default function SelectRichItems() {
  return (
    <Field label="Visibility" className="w-full max-w-sm">
      <Select
        defaultValue="public"
        items={[
          { value: "public", label: "Public", icon: <Globe />, description: "Anyone on the web can read it" },
          { value: "unlisted", label: "Unlisted", icon: <Link2 />, description: "Only people with the link" },
          { value: "members", label: "Members only", icon: <Lock />, description: "Signed-in customers of the portal" },
          { value: "private", label: "Private", icon: <EyeOff />, description: "You and the editors on this site" },
        ]}
      />
    </Field>
  );
}
