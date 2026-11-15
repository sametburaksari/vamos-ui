import type { ProductCardData } from "@vamos-ui/react/blocks";

// Fictional ceramics and books. Photos: Unsplash.
const photo = (id: string, alt: string, focal?: { x: number; y: number }) => ({
  src: `https://images.unsplash.com/photo-${id}?w=900&q=72&auto=format&fit=crop`,
  alt,
  width: 900,
  height: 1125,
  ...(focal ? { focal } : null),
});
const usd = (amount: string) => ({ amount, currency: "USD" });

export const ceramics: ProductCardData[] = [
  {
    id: "tide-plates",
    title: "Tide plates, set of 4",
    href: "#tide-plates",
    vendor: "Kilnhouse",
    image: photo("1578749556568-bc2c40e68b61", "Stacked plates and bowls in a pale blue glaze on a wooden table"),
    price: usd("96"),
    compareAt: usd("120"),
    rating: { value: 4.8, count: 64 },
    swatches: [
      { name: "Sea salt", color: "oklch(0.8 0.035 232)", image: photo("1578749556568-bc2c40e68b61", "Stacked plates and bowls in a pale blue glaze on a wooden table") },
      { name: "Oat", color: "oklch(0.8 0.055 76)", image: photo("1603199506016-b9a594b593c0", "Plates in a warm oat glaze, stacked with a patterned bowl") },
    ],
  },
  {
    id: "morning-cup",
    title: "Morning cup",
    href: "#morning-cup",
    vendor: "Kilnhouse",
    image: photo("1610701596007-11502861dcfa", "Cream cups with raw terracotta feet in a row"),
    price: usd("28"),
    isNew: true,
    rating: { value: 4.6, count: 128 },
    swatches: [
      { name: "Clay foot", color: "oklch(0.86 0.03 80)", image: photo("1610701596007-11502861dcfa", "Cream cups with raw terracotta feet in a row") },
      { name: "Chalk", color: "oklch(0.95 0.008 90)", image: photo("1590422749897-47036da0b0ff", "Four chalk-white cups stacked at an angle") },
      { name: "Latte", color: "oklch(0.7 0.06 60)", image: photo("1517256064527-09c73fc73e38", "A latte-glazed cup of coffee seen from above"), soldOut: true },
    ],
  },
  {
    id: "bottle-vase",
    title: "Bottle vase",
    href: "#bottle-vase",
    vendor: "Kilnhouse",
    image: photo("1565193566173-7a0ee3dbe261", "Three bone-white bottle vases against a dark wall"),
    hoverImage: photo("1525974160448-038dacadcc71", "A tall ash-glazed bottle beside two small cups"),
    priceRange: { min: usd("54"), max: usd("88") },
    rating: { value: 4.9, count: 31 },
  },
  {
    id: "bud-vases",
    title: "Bud vase pair",
    href: "#bud-vases",
    vendor: "Kilnhouse",
    image: photo("1490312278390-ab64016e0aa9", "Two milk-white bud vases with blossom branches"),
    price: usd("62"),
    soldOut: true,
    badge: "Last batch",
  },
];

/** Rows for the list variant: a vase and two books about making things. */
export const listItems: ProductCardData[] = [
  { id: "moon-vase", title: "Moon vase, cream", href: "#moon-vase", vendor: "Kilnhouse", image: photo("1612196808214-b8e1d6145a8c", "A round cream vase with a green branch beside a framed print"), priceRange: { min: usd("140"), max: usd("210") }, rating: { value: 4.4, count: 22 } },
  { id: "field-notes", title: "Field Notes on Clay, 2nd edition", href: "#field-notes", vendor: "Harbour Press", image: photo("1493106641515-6b5631de4bb9", "Clay-covered hands shaping a pot on the wheel"), price: usd("24"), compareAt: usd("32"), rating: { value: 4.7, count: 58 } },
  { id: "quiet-workshop", title: "The Quiet Workshop", href: "#quiet-workshop", vendor: "Harbour Press", image: photo("1610701596061-2ecf227e85b2", "Cups, bowls and wooden boards on an open kitchen shelf"), price: usd("31"), isNew: true },
];
