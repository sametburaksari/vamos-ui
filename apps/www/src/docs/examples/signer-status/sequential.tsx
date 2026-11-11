"use client";

import { toast } from "@vamos-ui/react";
import { SignerStatus, type Signer } from "@vamos-ui/react/business";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const signers: Signer[] = [
  { id: "s1", name: "Kaan Toprak", role: "Velvet Anchor Hotels", email: "kaan@velvetanchor.example.com", status: "signed", at: "2026-11-16T11:20:00+03:00" },
  { id: "s2", name: "Pınar Ilgaz", role: "Velvet Anchor Hotels · Finance", email: "pinar@velvetanchor.example.com", status: "viewed", at: "2026-11-18T08:47:00+03:00" },
  { id: "s3", name: "Defne Kaya", role: "Kiln & Linen · Countersigner", email: "defne.kaya@example.com", status: "waiting" },
];

export default function SignerStatusSequential() {
  return (
    <div className="w-full max-w-md rounded-ui-lg border border-line bg-surface p-5">
      {/* sequential: numbered badges; the last signer waits for the previous one. */}
      <SignerStatus
        title="Master services agreement · v3"
        signers={signers}
        sequential
        now={NOW}
        onRemind={(s) =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              toast.success(`Reminder sent to ${s.email}`);
              resolve();
            }, 600),
          )
        }
      />
    </div>
  );
}
