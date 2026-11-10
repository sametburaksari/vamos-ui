import { NavigationMenu, type SiteNavItem } from "@vamos-ui/react";

const nav: SiteNavItem[] = [
  { label: "Work", href: "/work" },
  {
    label: "Studio",
    children: [
      { label: "About", href: "/studio", description: "Twelve people, two cities, one kitchen table" },
      { label: "Careers", href: "/studio/careers", description: "3 open roles" },
      { label: "Press kit", href: "/studio/press", description: "Logos, photos and boilerplate" },
    ],
  },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

// variant="floating": a glass pill — the site's one permanent blur. Its panel stays opaque.
export default function NavigationMenuFloating() {
  return (
    <div className="flex h-72 w-full items-start justify-center pt-2">
      <NavigationMenu variant="floating" items={nav} />
    </div>
  );
}
