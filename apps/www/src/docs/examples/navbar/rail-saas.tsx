import { Navbar } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// SaaS: links in one framed pill (glassy in glass mode), "Sign in" ghost + "Try free" primary.
export default function NavbarRailSaas() {
  return (
    <SiteFrame>
      <Navbar
        variant="rail"
        skipLink={false}
        wordmark="Ledgerly"
        currentPath="/pricing"
        items={[
          { label: "Product", href: "/product" },
          { label: "Pricing", href: "/pricing" },
          { label: "Customers", href: "/customers" },
          { label: "Changelog", href: "/changelog" },
        ]}
        actions={[
          { link: { href: "/login", label: "Sign in" }, style: "secondary" },
          { link: { href: "/signup", label: "Try free" }, style: "primary" },
        ]}
      />
      <div className="h-40" />
    </SiteFrame>
  );
}
