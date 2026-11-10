import { Button, MobileNav, NavigationMenu, type SiteNavItem } from "@vamos-ui/react";

const nav: SiteNavItem[] = [
  {
    label: "Products",
    children: [
      { label: "vTag", href: "/products/vtag", description: "NFC business cards" },
      { label: "vRest", href: "/products/vrest", description: "Restaurant POS and QR menus" },
      { label: "vMob", href: "/products/vmob", description: "Native apps from your catalogue" },
    ],
  },
  {
    label: "Resources",
    children: [
      { label: "Blog", href: "/blog" },
      { label: "Case studies", href: "/customers" },
      { label: "Help centre", href: "/help" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

// One `nav` array feeds both: the desktop menu above md, the sheet below it (narrow the window to try it).
export default function NavigationMenuMobile() {
  return (
    <header className="flex h-14 w-full items-center justify-between gap-4 rounded-ui-lg border border-line px-4">
      <span className="font-display text-lg">Vamos</span>
      <NavigationMenu items={nav} className="max-md:hidden" />
      <MobileNav
        items={nav}
        className="md:hidden"
        title="Vamos"
        footer={
          <Button variant="primary" block>
            Book a demo
          </Button>
        }
      />
    </header>
  );
}
