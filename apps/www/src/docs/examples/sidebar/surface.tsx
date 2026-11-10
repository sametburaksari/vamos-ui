"use client";

import { CalendarCheck, CreditCard, FileText, LifeBuoy, MessagesSquare, Receipt } from "lucide-react";
import { AppSwitcher, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarNav, VamosProvider, type NavNode } from "@vamos-ui/react";
import { useMemoryRouter } from "../app-shell/demo-kit";

const portal: NavNode[] = [
  { id: "overview", label: "Overview", href: "/portal", icon: CalendarCheck },
  {
    type: "group",
    id: "project",
    label: "Your project",
    items: [
      { id: "documents", label: "Documents", href: "/portal/documents", icon: FileText },
      { id: "messages", label: "Messages", href: "/portal/messages", icon: MessagesSquare, badge: 2 },
    ],
  },
  {
    type: "group",
    id: "billing",
    label: "Billing",
    items: [
      { id: "invoices", label: "Invoices", href: "/portal/invoices", icon: Receipt },
      { id: "payment", label: "Payment methods", href: "/portal/payment", icon: CreditCard },
    ],
  },
];

/** variant="surface": same background as the content — client portals and websites. */
export default function SidebarSurface() {
  const router = useMemoryRouter("/portal/documents");
  return (
    <VamosProvider Link={router.Link} currentPath={router.currentPath}>
      <div className="h-[460px] overflow-hidden rounded-ui-lg border border-line">
        <Sidebar variant="surface" collapsible={false}>
          <SidebarHeader>
            <AppSwitcher apps={[{ id: "portal", name: "Defne Spa", description: "Client portal", href: "/portal", icon: <span className="text-[13px] font-semibold">LS</span> }]} />
          </SidebarHeader>
          <SidebarContent aria-label="Portal">
            <SidebarNav items={portal} />
          </SidebarContent>
          <SidebarFooter>
            <SidebarNav aria-label="Help" items={[{ id: "help", label: "Help center", href: "https://help.example.com", icon: LifeBuoy }]} />
          </SidebarFooter>
        </Sidebar>
      </div>
    </VamosProvider>
  );
}
