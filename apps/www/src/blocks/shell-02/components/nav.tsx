"use client";

import {
  Boxes, Building2, CircleDollarSign, Container, FileText, Gauge, LayoutDashboard, Map, Route, Settings, Truck, Users, Warehouse,
} from "lucide-react";
import type { AppDefinition, AppNotification, NavNode } from "@vamos-ui/react";

/** One operations app. The rail shows only icons; every submenu opens as a flyout. */
export const opsApp: AppDefinition = {
  id: "ops",
  name: "Fjord Freight",
  description: "Operations",
  icon: Container,
  href: "/ops",
  nav: [
    { id: "overview", label: "Overview", href: "/ops", icon: LayoutDashboard },
    {
      type: "group",
      id: "operations",
      label: "Operations",
      items: [
        {
          id: "shipments",
          label: "Shipments",
          href: "/ops/shipments",
          icon: Boxes,
          keywords: ["orders", "consignments"],
          children: [
            { id: "shipments.all", label: "All shipments", href: "/ops/shipments" },
            { id: "shipments.exceptions", label: "Exceptions", href: "/ops/shipments/exceptions", badge: { count: 4, tone: "danger" } },
            { id: "shipments.scheduled", label: "Scheduled", href: "/ops/shipments/scheduled" },
          ],
        },
        { id: "dispatch", label: "Dispatch board", href: "/ops/dispatch", icon: Route },
        { id: "fleet", label: "Fleet", href: "/ops/fleet", icon: Truck },
        { id: "map", label: "Live map", href: "/ops/map", icon: Map },
        { id: "warehouses", label: "Warehouses", href: "/ops/warehouses", icon: Warehouse },
      ],
    },
    {
      type: "group",
      id: "partners",
      label: "Partners",
      items: [
        { id: "carriers", label: "Carriers", href: "/ops/carriers", icon: Building2 },
        { id: "customers", label: "Customers", href: "/ops/customers", icon: Users },
      ],
    },
    {
      type: "group",
      id: "finance",
      label: "Finance",
      items: [
        { id: "invoices", label: "Invoices", href: "/ops/invoices", icon: FileText },
        { id: "rates", label: "Rate cards", href: "/ops/rates", icon: CircleDollarSign },
        { id: "sla", label: "SLA reports", href: "/ops/sla", icon: Gauge, disabled: "Soon" },
      ],
    },
  ],
  newMenu: [
    { id: "new-shipment", label: "Shipment", icon: <Boxes />, href: "/ops/shipments/new" },
    { id: "new-route", label: "Route", icon: <Route />, href: "/ops/dispatch/new" },
  ],
};

export const sharedNav: NavNode[] = [{ id: "settings", label: "Settings", href: "/settings", icon: Settings }];

const now = Date.now();
const minutes = (m: number) => new Date(now - m * 60_000).toISOString();

export const notifications: AppNotification[] = [
  { id: "n1", title: "FF-20418 held at customs in Gothenburg", body: "Missing commercial invoice. Broker asked for a copy.", createdAt: minutes(12), tone: "danger", important: true, href: "/ops/shipments/exceptions" },
  { id: "n2", title: "Truck NO-4471 is 38 minutes behind schedule", body: "Route E6 Oslo → Trondheim, roadworks near Hamar.", createdAt: minutes(47), tone: "warning", href: "/ops/dispatch" },
  { id: "n3", title: "Ingrid Solberg approved the Q1 rate card", actor: { name: "Ingrid Solberg" }, createdAt: minutes(190), readAt: minutes(120), href: "/ops/rates" },
];

/** Titles for the routes the preview can reach. */
export function titleFor(path: string): string {
  const all = [...opsApp.nav, ...sharedNav].flatMap((n) => ("items" in n ? n.items : "type" in n ? [] : [n]));
  for (const it of all) {
    const child = it.children?.find((c) => c.href === path);
    if (child) return child.label === "All shipments" ? it.label : child.label;
    if (it.href === path) return it.label;
  }
  return "Overview";
}
