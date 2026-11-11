"use client";

import { SignerStatus, type Signer } from "@vamos-ui/react/business";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const signers: Signer[] = [
  { id: "s1", name: "Elif Sarı", role: "Client", email: "elif@quillfeather.example.com", status: "signed", at: "2026-11-17T16:02:00+03:00" },
  { id: "s2", name: "Mert Güneş", role: "Client finance", email: "mert@quillfeather.example.com", status: "viewed", at: "2026-11-18T09:10:00+03:00" },
  { id: "s3", name: "Aylin Demirtaş", role: "Account executive", email: "aylin.demirtas@example.com", status: "sent", at: "2026-11-17T15:40:00+03:00" },
];

export default function SignerStatusDemo() {
  return (
    <div className="w-full max-w-md rounded-ui-lg border border-line bg-surface p-5">
      <SignerStatus signers={signers} now={NOW} />
    </div>
  );
}
