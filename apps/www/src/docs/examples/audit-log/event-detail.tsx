"use client";

import { AuditEventDetail } from "@vamos-cms/ui";
import { auditEvents, changeFields } from "./data";

export default function AuditLogEventDetail() {
  return (
    <div className="w-full rounded-ui border border-line bg-surface p-4">
      <AuditEventDetail event={auditEvents[0]!} changeFields={changeFields} />
    </div>
  );
}
