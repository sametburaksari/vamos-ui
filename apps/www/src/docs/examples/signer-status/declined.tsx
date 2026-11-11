"use client";

import { SignerStatus, type Signer } from "@vamos-ui/react/business";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const signers: Signer[] = [
  { id: "s1", name: "Cem Arıkan", role: "Lodestar Freight · COO", status: "declined", at: "2026-11-18T09:55:00+03:00", note: "“Volume discount on line 4 doesn't match what we agreed on the call.”" },
  { id: "s2", name: "Tomás Herrera", role: "Account executive", status: "signed", at: "2026-11-15T17:30:00+03:00" },
];

export default function SignerStatusDeclined() {
  return (
    <div className="w-full max-w-md rounded-ui-lg border border-line bg-surface p-5">
      <SignerStatus title="Quote Q-2026-0412" signers={signers} now={NOW} />
    </div>
  );
}
