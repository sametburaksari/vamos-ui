"use client";

import { BackupCodes } from "@vamos-ui/react";

const codes = ["4K7Q-PX2M", "9DTR-H3VA", "B6WN-82ZE", "JX5C-QM4T", "7HLF-R9KD", "WE3P-6YUB", "M2SG-T8NC", "Q9VZ-K4HR", "5RDA-JW7X", "ZC8E-N3LP"];

export default function BackupCodesDemo() {
  return (
    <div className="w-full max-w-sm">
      <BackupCodes codes={codes} filename="kiln-linen-backup-codes.txt" fileNote="Kiln & Linen — defne.kaya@example.com" />
    </div>
  );
}
