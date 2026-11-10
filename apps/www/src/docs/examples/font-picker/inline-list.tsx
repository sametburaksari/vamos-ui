"use client";

import * as React from "react";
import { Card } from "@vamos-ui/react";
import { FontPickerList } from "@vamos-ui/react/fonts";

export default function FontPickerInline() {
  const [family, setFamily] = React.useState<string | null>("Bricolage Grotesque");
  return (
    <Card className="w-full max-w-md p-3">
      <FontPickerList value={family} onValueChange={setFamily} listHeight="16rem" />
      <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-fg-muted">
        Selected: <span className="font-medium text-fg">{family ?? "none"}</span>
      </p>
    </Card>
  );
}
