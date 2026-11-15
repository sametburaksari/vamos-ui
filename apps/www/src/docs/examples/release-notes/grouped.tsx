import { ReleaseNotes } from "@vamos-ui/react";
import { releases } from "./data";

export default function ReleaseNotesGrouped() {
  return (
    <div className="w-full max-w-3xl">
      <ReleaseNotes releases={releases.slice(0, 2)} groupBy="type" stickyRail={false} />
    </div>
  );
}
