"use client";

import { CalendarDays, FileText, HeartPulse, House, Receipt, Users } from "lucide-react";
import type { AppDefinition } from "@vamos-ui/react";

/**
 * A small self-service portal: six top-level pages, no submenus, so the links sit in the top bar.
 * On phones the same items open in a sheet from the menu button.
 */
export const selfServiceApp: AppDefinition = {
  id: "me",
  name: "Kestrel People",
  description: "Employee self-service",
  icon: Users,
  href: "/me",
  nav: [
    { id: "home", label: "Home", href: "/me", icon: House },
    { id: "time-off", label: "Time off", href: "/me/time-off", icon: CalendarDays, badge: 1 },
    { id: "payslips", label: "Payslips", href: "/me/payslips", icon: Receipt },
    { id: "documents", label: "Documents", href: "/me/documents", icon: FileText },
    { id: "benefits", label: "Benefits", href: "/me/benefits", icon: HeartPulse },
    { id: "team", label: "Team", href: "/me/team", icon: Users },
  ],
  newMenu: [
    { id: "request-leave", label: "Time-off request", icon: <CalendarDays />, href: "/me/time-off/new" },
    { id: "expense", label: "Expense claim", icon: <Receipt />, href: "/me/expenses/new" },
  ],
};

export function titleFor(path: string): string {
  const it = selfServiceApp.nav.find((n) => "href" in n && n.href === path);
  return it && "label" in it && typeof it.label === "string" ? it.label : "Home";
}
