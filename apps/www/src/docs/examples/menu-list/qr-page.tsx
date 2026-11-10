import { MenuList } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const TRY = (amount: string) => ({ amount, currency: "TRY" });

// QR-menu page at phone width: the category bar scrolls horizontally and sticks under the top edge.
export default function MenuListQrPage() {
  return (
    <SiteFrame width={390}>
      <MenuList
        title="Menu"
        showNav
        theme={{ rhythm: "tight" }}
        categories={[
          { title: "Coffee", items: [{ name: "Türk kahvesi", prices: [{ amount: TRY("110") }] }, { name: "Flat white", prices: [{ label: "Oat +₺25", amount: TRY("150") }] }] },
          { title: "Tea", items: [{ name: "Çay", description: "Rize, brewed in a çaydanlık.", prices: [{ label: "Glass", amount: TRY("45") }, { label: "Pot", amount: TRY("180") }] }] },
          { title: "Pastry", items: [{ name: "Simit", prices: [{ amount: TRY("40") }], tags: ["vegan"] }, { name: "Poğaça", description: "Cheese or olive.", prices: [{ amount: TRY("55") }], allergens: ["gluten", "milk"] }] },
          { title: "Cold drinks", items: [{ name: "Ayran", prices: [{ amount: TRY("70") }] }, { name: "Fresh lemonade", prices: [{ amount: TRY("120") }] }] },
        ]}
        priceNote="VAT included."
      />
    </SiteFrame>
  );
}
