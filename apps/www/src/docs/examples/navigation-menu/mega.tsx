import { BarChart3, CreditCard, Megaphone, Nfc, QrCode, Smartphone } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuFeatured,
  NavigationMenuGroup,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@vamos-cms/ui";

// Company website: a product mega menu with a featured card, plus a two-column resources panel.
export default function NavigationMenuMega() {
  return (
    <header className="flex h-[26rem] w-full items-start justify-between gap-6 border-b border-line px-2 pb-3">
      <a href="/" className="font-display text-xl leading-9">
        Vamos
      </a>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent layout="featured">
              <NavigationMenuFeatured eyebrow="New" title="vMarketing" description="Ads, social and WhatsApp in one AI-assisted panel." href="/products/vmarketing" />
              <NavigationMenuGroup heading="For your business">
                <li>
                  <NavigationMenuLink href="/products/vtag" icon={<Nfc />} title="vTag" description="NFC business cards your team can update" />
                </li>
                <li>
                  <NavigationMenuLink href="/products/vrest" icon={<QrCode />} title="vRest" description="Restaurant POS with QR menus" />
                </li>
                <li>
                  <NavigationMenuLink href="/products/vmob" icon={<Smartphone />} title="vMob" description="Native apps from your catalogue" />
                </li>
              </NavigationMenuGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent layout="grid-2">
              <NavigationMenuGroup>
                <li>
                  <NavigationMenuLink href="/services/ads" icon={<Megaphone />} title="Ad management" description="Google and Meta campaigns on a monthly retainer" />
                </li>
                <li>
                  <NavigationMenuLink href="/services/analytics" icon={<BarChart3 />} title="Analytics" description="Tracking plans and dashboards that get read" />
                </li>
                <li>
                  <NavigationMenuLink href="/services/payments" icon={<CreditCard />} title="Payments" description="Checkout and subscriptions, done right" />
                </li>
                <li>
                  <NavigationMenuLink href="/services/web" icon={<Smartphone />} title="Websites" description="Fast, editable sites on Vamos CMS" />
                </li>
              </NavigationMenuGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/pricing" variant="top">
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <a href="/contact" className="text-sm font-medium leading-9 text-fg-muted hover:text-fg">
        Contact
      </a>
    </header>
  );
}
