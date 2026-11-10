import { MenuList } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { more, photos } from "../_site-2/data";

const TRY = (amount: string) => ({ amount, currency: "TRY" });

// Photo: a 72px square photo per item; items without one keep their alignment.
export default function MenuListPhoto() {
  return (
    <SiteFrame>
      <MenuList
        variant="photo"
        title="Weekend *brunch*"
        categories={[{ title: "Plates", items: [
          { name: "Serpme kahvaltı", description: "For two: cheeses, olives, kaymak, honey, eggs your way.", prices: [{ amount: TRY("1450") }], image: { ...more.meze, alt: "" }, allergens: ["milk", "eggs", "gluten"] },
          { name: "Menemen", description: "Eggs, tomato, green pepper, sourdough.", prices: [{ amount: TRY("320") }], tags: ["vegetarian"], image: { ...more.bread, alt: "" } },
          { name: "Fish sandwich", description: "Grilled mackerel, onion, rocket.", prices: [{ amount: TRY("380") }], image: { ...photos.plated, alt: "" }, tags: ["new"] },
          { name: "Fresh orange juice", prices: [{ amount: TRY("140") }] },
        ] }]}
        priceNote="Served Saturdays and Sundays, 09:00–14:00. VAT included."
      />
    </SiteFrame>
  );
}
