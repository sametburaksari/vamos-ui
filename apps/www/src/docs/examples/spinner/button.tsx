import { Upload } from "lucide-react";
import { Button, IconButton } from "@vamos-ui/react";

export default function SpinnerInButton() {
  // Buttons render a decorative Spinner and set aria-busy themselves.
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Button loading>
        <Upload /> Upload
      </Button>
      <Button variant="primary" loading loadingText="Publishing…">
        Publish
      </Button>
      <IconButton label="Sync" variant="secondary" loading>
        <Upload />
      </IconButton>
    </div>
  );
}
