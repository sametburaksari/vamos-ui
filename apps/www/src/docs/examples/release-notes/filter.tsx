import { ReleaseNotes } from "@vamos-ui/react";
import { releases } from "./data";

export default function ReleaseNotesFilter() {
  return (
    <div className="w-full max-w-3xl">
      <ReleaseNotes releases={releases} filter anchorPrefix="release-" />
    </div>
  );
}
