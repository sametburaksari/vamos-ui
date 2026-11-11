"use client";

import * as React from "react";
import { PageHeader, TabsLink, TabsLinkList } from "@vamos-ui/react";
import { AdminShell } from "../../detail-04/components/admin-shell";
import { useBlockFormat } from "../../_shared/format";

export type SettingsSection = "general" | "billing" | "developers" | "notifications" | "security";

/**
 * Account settings frame shared by settings-03 … settings-05: the workspace shell, one page
 * header and route tabs for every settings area. The active tab is fixed per screen here;
 * in your app derive it from the router.
 */
export function SettingsFrame({
  section,
  title,
  description,
  meta,
  actions,
  children,
}: {
  section: SettingsSection;
  title: string;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { c } = useBlockFormat();
  const tabs: Array<{ id: SettingsSection; href: string; label: string }> = [
    { id: "general", href: "/settings", label: c("General", "Genel") },
    { id: "billing", href: "/settings/billing", label: c("Plan & billing", "Plan ve faturalama") },
    { id: "developers", href: "/settings/developers", label: c("API & webhooks", "API ve webhook") },
    { id: "notifications", href: "/settings/notifications", label: c("Notifications", "Bildirimler") },
    { id: "security", href: "/settings/security", label: c("Security", "Güvenlik") },
  ];
  const path = tabs.find((t) => t.id === section)!.href;
  return (
    <AdminShell path={path}>
      <div className="mx-auto w-full min-w-0 max-w-[1320px]">
        <PageHeader
          eyebrow={c("Settings · Kiln & Linen", "Ayarlar · Kiln & Linen")}
          title={title}
          description={description}
          meta={meta}
          actions={actions}
        />
        {/* Outside the header so the scrolling strip can't widen it on phones. */}
        <TabsLinkList aria-label={c("Settings areas", "Ayar bölümleri")} className="mt-5 border-b border-line">
          {tabs.map((t) => (
            <TabsLink key={t.id} href={t.href} active={t.id === section} exact>
              {t.label}
            </TabsLink>
          ))}
        </TabsLinkList>
        <div className="mt-6 min-w-0">{children}</div>
      </div>
    </AdminShell>
  );
}
