"use client";

import { CalendarCheck, FileText, MessagesSquare, Receipt } from "lucide-react";
import { AppShell, AppShellProvider, PageHeader, type AppDefinition } from "@vamos-cms/ui";
import { DemoPage, ShellFrame, useMemoryRouter } from "./demo-kit";

const portal: AppDefinition = {
  id: "portal",
  name: "Lena Spa",
  description: "Client portal",
  href: "/portal",
  accent: "ember",
  nav: [
    { id: "overview", label: "Overview", href: "/portal", icon: CalendarCheck },
    { id: "documents", label: "Documents", href: "/portal/documents", icon: FileText },
    { id: "messages", label: "Messages", href: "/portal/messages", icon: MessagesSquare },
    { id: "invoices", label: "Invoices", href: "/portal/invoices", icon: Receipt },
  ],
};

/** layout="topnav": portal-style — top-level links in the top bar, no sidebar (a sheet on phones). */
export default function AppShellTopnav() {
  const router = useMemoryRouter("/portal/documents");
  return (
    <ShellFrame height={520}>
      <AppShellProvider apps={[portal]} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link} shortcuts={false}>
        <AppShell height="fill" layout="topnav" user={{ name: "Mert Aydın", email: "mert@lenaspa.com", items: [{ id: "out", label: "Sign out" }] }}>
          <PageHeader title="Documents" description="Contracts, briefs and reports shared with you." />
          <DemoPage path={router.currentPath} />
        </AppShell>
      </AppShellProvider>
    </ShellFrame>
  );
}
