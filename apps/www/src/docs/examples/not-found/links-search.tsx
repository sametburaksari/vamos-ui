import { NotFound } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Links: a plain GET search form, popular pages in a hairline list, a phone line.
export default function NotFoundLinksSearch() {
  return (
    <SiteFrame>
      <NotFound
        variant="links"
        search={{ action: "/search", param: "q" }}
        phone="+902168072907"
        links={[
          { href: "/menu", label: "Tonight’s menu" },
          { href: "/reservations", label: "Book a table" },
          { href: "/private-dining", label: "Private dining" },
          { href: "/journal", label: "Journal" },
          { href: "/gift-cards", label: "Gift cards" },
          { href: "/contact", label: "Find us" },
        ]}
      />
    </SiteFrame>
  );
}
