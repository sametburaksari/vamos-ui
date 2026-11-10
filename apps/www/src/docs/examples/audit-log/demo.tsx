"use client";

import { AuditLog } from "@vamos-ui/react";
import { actionLabels, auditEvents, changeFields } from "./data";

export default function AuditLogDemo() {
  return (
    <AuditLog
      className="w-full"
      events={auditEvents}
      actionLabels={actionLabels}
      changeFields={changeFields}
      notice="Showing the last 90 days · times in UTC"
      height="28rem"
      onExport={(rows) => console.info(`Exporting ${rows.length} events`)}
    />
  );
}
