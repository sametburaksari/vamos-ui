import { cookies } from "next/headers";
import { parseSidebarCookie, SIDEBAR_COOKIE } from "@vamos-ui/react";
import { AdminShell } from "@/components/admin-shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Read the rail preference on the server so the sidebar doesn't flash on load.
  const collapsed = parseSidebarCookie((await cookies()).get(SIDEBAR_COOKIE)?.value);
  return <AdminShell defaultCollapsed={collapsed}>{children}</AdminShell>;
}
