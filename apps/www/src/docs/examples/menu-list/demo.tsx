import { MenuList, type MenuCategory } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

const TRY = (amount: string) => ({ amount, currency: "TRY" });

const categories: MenuCategory[] = [
  { title: "Cold meze", note: "Made every morning; served from 17:00.", items: [
    { name: "Haydari", description: "Strained yoghurt, dill, roasted garlic, Urfa pepper.", prices: [{ amount: TRY("180") }], tags: ["vegetarian"], allergens: ["milk"] },
    { name: "Fava", description: "Broad-bean purée, red onion, Ayvalık olive oil.", prices: [{ amount: TRY("170") }], tags: ["vegan"] },
    { name: "Lakerda", description: "Bonito cured for three days, red onion, black pepper.", prices: [{ amount: TRY("420") }], tags: ["chef-pick"], allergens: ["fish"] },
    { name: "Deniz börülcesi", description: "Samphire, garlic, lemon.", prices: [{ amount: TRY("190") }], tags: ["vegan", "gluten-free"] },
  ] },
  { title: "Hot starters", items: [
    { name: "Kalamar tava", description: "Fried squid, tarator.", prices: [{ amount: TRY("390") }], allergens: ["molluscs", "gluten", "nuts"] },
    { name: "Paçanga böreği", description: "Pastırma and kaşar in yufka.", prices: [{ amount: TRY("280") }], allergens: ["gluten", "milk"], unavailable: true },
  ] },
  { title: "From the grill", note: "Priced daily by weight — ask for today’s board.", items: [
    { name: "Catch of the day", description: "Charcoal-grilled whole fish, rocket, red onion.", prices: [{}] },
    { name: "Levrek", description: "Line-caught sea bass, 400–500 g.", prices: [{ amount: TRY("950") }], allergens: ["fish"] },
  ] },
  { title: "Rakı", items: [
    { name: "Yeni Rakı Yeni Seri", prices: [{ label: "20 cl", amount: TRY("950") }, { label: "35 cl", amount: TRY("1450") }, { label: "70 cl", amount: TRY("2600") }] },
    { name: "Tekirdağ Gold", prices: [{ label: "35 cl", amount: TRY("1750") }, { label: "70 cl", amount: TRY("3200") }] },
  ] },
];

// Classic: printed-menu feel — dotted leaders, tabular prices, serif categories under a double
// rule, a sticky jump bar of plain anchors, tags as words, the 14 allergens.
export default function MenuListDemo() {
  return (
    <SiteFrame>
      <MenuList eyebrow="Menu" title="Tonight at *Kıyı*" categories={categories} priceNote="Prices in Turkish lira, VAT included. No service charge is added to the bill." />
    </SiteFrame>
  );
}
