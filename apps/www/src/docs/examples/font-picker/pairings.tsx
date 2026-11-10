"use client";

import * as React from "react";
import { FontPairingPicker } from "@vamos-ui/react/fonts";

export default function FontPairings() {
  const [pairing, setPairing] = React.useState<string | null>("boutique");
  return (
    <div className="w-full">
      <FontPairingPicker value={pairing} onValueChange={setPairing} />
    </div>
  );
}
