"use client";

import { BackupCodes } from "@vamos-ui/react";

const codes = ["4K7Q-PX2M", "9DTR-H3VA", "B6WN-82ZE", "JX5C-QM4T", "7HLF-R9KD", "WE3P-6YUB", "M2SG-T8NC", "Q9VZ-K4HR"];

export default function BackupCodesUsed() {
  return (
    <div className="w-full max-w-sm">
      {/* Spent codes stay in place, struck through, so the numbering still matches a printout. */}
      <BackupCodes codes={codes} used={["9DTR-H3VA", "7HLF-R9KD", "Q9VZ-K4HR"]} />
    </div>
  );
}
