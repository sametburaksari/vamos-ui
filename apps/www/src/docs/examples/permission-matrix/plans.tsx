"use client";

import * as React from "react";
import { PermissionMatrix, type PermissionAction, type PermissionResource, type PermissionValue } from "@vamos-ui/react/business";

// SaaS entitlements: features as rows, plans as columns, boolean cells.
const features: PermissionResource[] = [
  { id: "seats", label: "Up to 25 seats", group: "Workspace" },
  { id: "sso", label: "SAML single sign-on", group: "Workspace" },
  { id: "audit", label: "Audit log (1 year)", group: "Workspace" },
  { id: "api", label: "Public API", group: "Developers" },
  { id: "webhooks", label: "Webhooks", group: "Developers" },
  { id: "sla", label: "99.9% uptime SLA", group: "Support" },
];
const plans: PermissionAction[] = [
  { id: "starter", label: "Starter" },
  { id: "growth", label: "Growth" },
  { id: "scale", label: "Scale" },
  { id: "enterprise", label: "Enterprise" },
];

export default function PermissionMatrixPlans() {
  const [value, setValue] = React.useState<PermissionValue>({
    seats: { starter: true, growth: true, scale: true, enterprise: true },
    api: { growth: true, scale: true, enterprise: true },
    webhooks: { scale: true, enterprise: true },
    audit: { scale: true, enterprise: true },
    sso: { enterprise: true },
    sla: { enterprise: true },
  });
  return (
    <div className="w-full">
      <PermissionMatrix aria-label="Plan entitlements" resources={features} actions={plans} value={value} onValueChange={setValue} maxHeight="22rem" labels={{ resource: "Feature", granted: "Included", denied: "Not included" }} />
    </div>
  );
}
