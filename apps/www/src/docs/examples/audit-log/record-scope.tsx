"use client";

import { AuditLog } from "@vamos-cms/ui";
import { actionLabels, auditEvents, changeFields } from "./data";

export default function AuditLogRecordScope() {
  const forUser = auditEvents.filter((e) => e.target?.id === "usr_482");
  return (
    <div className="w-full max-w-xl">
      <AuditLog variant="timeline" showFilters={false} events={forUser} actionLabels={actionLabels} changeFields={changeFields} />
    </div>
  );
}
