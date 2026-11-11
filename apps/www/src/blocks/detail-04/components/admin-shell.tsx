"use client";

import * as React from "react";
import {
  Boxes, Building2, CalendarDays, Contact, KanbanSquare, LayoutDashboard, LifeBuoy, Network, Package,
  ReceiptText, Settings, ShieldCheck, ShoppingBag, Store, Tags, Truck, UserRound, Users, Warehouse,
} from "lucide-react";
import { AppShell, AppShellProvider, type AppDefinition, type NavNode, type VamosLinkProps } from "@vamos-ui/react";
import { me } from "../../_shared/people";
import { useBlockFormat } from "../../_shared/format";

/** One workspace for the four record pages: CRM, Commerce and People share the sidebar. */
function useApps(): { apps: AppDefinition[]; shared: NavNode[] } {
  const { c } = useBlockFormat();
  return React.useMemo(
    () => ({
      apps: [
        {
          id: "crm", name: "CRM", description: c("Accounts & pipeline", "Hesaplar ve satış hattı"), icon: Building2, href: "/crm",
          nav: [
            { id: "crm.home", label: c("Overview", "Genel bakış"), href: "/crm", icon: LayoutDashboard },
            { type: "group", id: "crm.accounts", label: c("Accounts", "Hesaplar"), items: [
              { id: "crm.companies", label: c("Companies", "Şirketler"), href: "/crm/companies", icon: Building2, match: ["/crm/companies/*"] },
              { id: "crm.contacts", label: c("Contacts", "Kişiler"), href: "/crm/contacts", icon: Contact },
            ] },
            { type: "group", id: "crm.revenue", label: c("Revenue", "Gelir"), items: [
              { id: "crm.pipeline", label: c("Pipeline", "Satış hattı"), href: "/crm/pipeline", icon: KanbanSquare, badge: 12 },
              { id: "crm.invoices", label: c("Invoices", "Faturalar"), href: "/crm/invoices", icon: ReceiptText },
              { id: "crm.support", label: c("Support", "Destek"), href: "/crm/support", icon: LifeBuoy, badge: 4 },
            ] },
          ],
          newMenu: [
            { id: "new-company", label: c("Company", "Şirket"), href: "/crm/companies/new" },
            { id: "new-deal", label: c("Deal", "Fırsat"), href: "/crm/deals/new" },
          ],
        },
        {
          id: "commerce", name: c("Commerce", "Ticaret"), description: c("Orders & catalogue", "Siparişler ve katalog"), icon: Store, href: "/commerce",
          nav: [
            { id: "com.home", label: c("Overview", "Genel bakış"), href: "/commerce", icon: LayoutDashboard },
            { type: "group", id: "com.sales", label: c("Sales", "Satış"), items: [
              { id: "com.orders", label: c("Orders", "Siparişler"), href: "/commerce/orders", icon: ShoppingBag, badge: 9, match: ["/commerce/orders/*"] },
              { id: "com.returns", label: c("Returns", "İadeler"), href: "/commerce/returns", icon: Truck },
            ] },
            { type: "group", id: "com.catalogue", label: c("Catalogue", "Katalog"), items: [
              { id: "com.products", label: c("Products", "Ürünler"), href: "/commerce/products", icon: Package, match: ["/commerce/products/*"] },
              { id: "com.collections", label: c("Collections", "Koleksiyonlar"), href: "/commerce/collections", icon: Tags },
              { id: "com.stock", label: c("Inventory", "Stok"), href: "/commerce/inventory", icon: Warehouse },
            ] },
          ],
          newMenu: [
            { id: "new-order", label: c("Draft order", "Taslak sipariş"), href: "/commerce/orders/new" },
            { id: "new-product", label: c("Product", "Ürün"), href: "/commerce/products/new" },
          ],
        },
        {
          id: "people", name: c("People", "İK"), description: c("Team & time off", "Ekip ve izinler"), icon: Users, href: "/people",
          nav: [
            { id: "ppl.home", label: c("Overview", "Genel bakış"), href: "/people", icon: LayoutDashboard },
            { type: "group", id: "ppl.team", label: c("Team", "Ekip"), items: [
              { id: "ppl.directory", label: c("Directory", "Rehber"), href: "/people/directory", icon: UserRound, match: ["/people/directory/*"] },
              { id: "ppl.org", label: c("Org chart", "Organizasyon"), href: "/people/org", icon: Network },
            ] },
            { type: "group", id: "ppl.time", label: c("Time", "Zaman"), items: [
              { id: "ppl.leave", label: c("Leave", "İzinler"), href: "/people/leave", icon: CalendarDays, badge: 2 },
              { id: "ppl.assets", label: c("Equipment", "Demirbaş"), href: "/people/equipment", icon: Boxes },
            ] },
          ],
          newMenu: [{ id: "new-leave", label: c("Leave request", "İzin talebi"), href: "/people/leave/new" }],
        },
      ],
      shared: [
        { id: "users", label: c("Users & roles", "Kullanıcılar ve roller"), href: "/users", icon: ShieldCheck },
        { id: "settings", label: c("Settings", "Ayarlar"), href: "/settings", icon: Settings, match: ["/settings/*"] },
      ],
    }),
    [c],
  );
}

/** Clicks in the preview move the active menu item instead of leaving the page. */
function useMemoryRouter(initial: string) {
  const [currentPath, setPath] = React.useState(initial);
  const navigate = React.useCallback((href: string) => setPath(href), []);
  const Link = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function MemoryLink({ href, onClick, replace: _r, prefetch: _p, ...props }, ref) {
        return (
          <a
            ref={ref}
            href={href}
            onClick={(e) => {
              onClick?.(e);
              if (e.defaultPrevented || /^(https?:|mailto:|tel:|#)/.test(href)) return;
              e.preventDefault();
              setPath(href);
            }}
            {...props}
          />
        );
      }),
    [],
  );
  return { currentPath, navigate, Link };
}

/**
 * Workspace shell shared by the record pages detail-04 … detail-07. In your app pass Next's
 * `Link`, `usePathname()` and `router.push` to AppShellProvider instead of the memory router.
 */
export function AdminShell({ path, children }: { path: string; children: React.ReactNode }) {
  const { apps, shared } = useApps();
  const { c } = useBlockFormat();
  const router = useMemoryRouter(path);
  return (
    <AppShellProvider apps={apps} sharedNav={shared} currentPath={router.currentPath} navigate={router.navigate} linkComponent={router.Link}>
      <AppShell
        user={{
          name: me.name,
          email: me.email,
          items: [
            { id: "profile", label: c("Profile", "Profil"), href: "/settings/profile" },
            { type: "separator", id: "sep" },
            { id: "signout", label: c("Sign out", "Çıkış yap") },
          ],
        }}
      >
        {children}
      </AppShell>
    </AppShellProvider>
  );
}
