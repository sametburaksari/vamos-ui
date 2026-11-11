"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, BackupCodes } from "@vamos-ui/react";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCodes = (seed: number) =>
  Array.from({ length: 8 }, (_, i) => {
    let n = (seed * 7919 + i * 104729) >>> 0;
    const chars = Array.from({ length: 8 }, () => {
      n = (Math.imul(n, 1103515245) + 12345) >>> 0;
      return alphabet[(n >>> 16) % alphabet.length];
    });
    return `${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
  });

export default function BackupCodesSecuritySettings() {
  const [seed, setSeed] = React.useState(1);
  const [busy, setBusy] = React.useState(false);
  const regenerate = () => {
    setBusy(true);
    window.setTimeout(() => {
      setSeed((s) => s + 1);
      setBusy(false);
    }, 700);
  };
  return (
    <div className="grid w-full max-w-md gap-4 rounded-ui-lg border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 text-success" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-fg">Two-factor authentication is on</p>
          <p className="text-[13px] text-fg-muted">Authenticator app added 18 Nov 2026.</p>
        </div>
      </div>
      <Alert tone="warning">
        <AlertTitle>Save these somewhere safe</AlertTitle>
        <AlertDescription>Each code signs you in once if you lose your phone. New codes replace the old ones.</AlertDescription>
      </Alert>
      <BackupCodes codes={makeCodes(seed)} onRegenerate={regenerate} regenerating={busy} />
    </div>
  );
}
