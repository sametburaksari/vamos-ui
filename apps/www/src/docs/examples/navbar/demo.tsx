import { Navbar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Corporate bar: logo at the start, small links beside it, phone + one CTA at the end.
export default function NavbarDemo() {
  return (
    <SiteFrame>
      <Navbar
        wordmark="Studio Arda"
        currentPath="/work"
        items={[
          { label: "Work", href: "/work" },
          { label: "Services", href: "/services" },
          { label: "About", href: "/about" },
          { label: "Journal", href: "/journal" },
        ]}
        phone="+902160000000"
        locale="tr-TR"
        actions={[{ link: { href: "/contact", label: "Get a quote" }, style: "primary" }]}
      />
      <div className="h-40" />
    </SiteFrame>
  );
}
