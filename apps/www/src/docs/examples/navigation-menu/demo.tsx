import { NavigationMenu, type SiteNavItem } from "@vamos-ui/react";

const nav: SiteNavItem[] = [
  {
    label: "Solutions",
    children: [
      { label: "Restaurants", href: "/solutions/restaurants", description: "POS, QR menus and table orders" },
      { label: "Retail", href: "/solutions/retail", description: "Stock, loyalty and e-commerce in one place" },
      { label: "Agencies", href: "/solutions/agencies", description: "Client portals, retainers and reporting" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Customers", href: "/customers" },
  { label: "Blog", href: "/blog" },
];

export default function NavigationMenuDemo() {
  return (
    <div className="flex h-72 w-full items-start justify-center">
      <NavigationMenu items={nav} />
    </div>
  );
}
