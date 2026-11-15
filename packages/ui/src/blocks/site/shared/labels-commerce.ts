// Built-in strings for the commerce and review kit: StarRating, ReviewScore, ProductCard,
// ProductGrid. Server-safe: no context. Pass `labels` (e.g. `commerceLabelsTr`) or bind them once
// with `createBlocks({ labels })`.

import { formatMessage } from "../../../lib/message-format";
import { blockLabels, type BlockLabels } from "../../labels";

/** English defaults. */
export const commerceLabels = {
  // Star rating
  ratingValue: "Rated {rating} out of {max}",
  ratingCount: "{count, plural, one {# review} other {# reviews}}",
  ratingInput: "Rating",
  ratingStars: "{value, plural, one {# star} other {# stars}}",
  ratingNone: "No rating",
  // Review score
  reviewScore: "Our score",
  scoreOutOf: "{score} out of {max}",
  criteria: "Scores by criterion",
  pros: "Pros",
  cons: "Cons",
  verdict: "Verdict",
  reviewedBy: "Reviewed by {name}",
  // Product card
  saleBadge: "Sale",
  saleOff: "−{percent}%",
  newBadge: "New",
  soldOut: "Sold out",
  priceWas: "Was {price}",
  priceNow: "Now {price}",
  priceFrom: "From {price}",
  priceRange: "{min} – {max}",
  quickAdd: "Add {name} to cart",
  quickAddVariant: "Add {name}, {variant}, to cart",
  optionsOf: "Options for {name}",
  moreOptions: "+{count} more",
  // Product grid
  products: "Products",
  noProducts: "No products here yet",
  noProductsHint: "Try another filter, or check back soon.",
};

export type CommerceLabels = typeof commerceLabels;

/** Turkish. */
export const commerceLabelsTr: CommerceLabels = {
  ratingValue: "{max} üzerinden {rating} puan",
  ratingCount: "{count} değerlendirme",
  ratingInput: "Puan",
  ratingStars: "{value} yıldız",
  ratingNone: "Puan yok",
  reviewScore: "Puanımız",
  scoreOutOf: "{max} üzerinden {score}",
  criteria: "Ölçütlere göre puanlar",
  pros: "Artılar",
  cons: "Eksiler",
  verdict: "Sonuç",
  reviewedBy: "İnceleyen: {name}",
  saleBadge: "İndirim",
  saleOff: "%{percent} indirim",
  newBadge: "Yeni",
  soldOut: "Tükendi",
  priceWas: "Eski fiyat {price}",
  priceNow: "Yeni fiyat {price}",
  priceFrom: "{price}’den başlayan",
  priceRange: "{min} – {max}",
  quickAdd: "{name} ürününü sepete ekle",
  quickAddVariant: "{name}, {variant}: sepete ekle",
  optionsOf: "{name} seçenekleri",
  moreOptions: "+{count} seçenek",
  products: "Ürünler",
  noProducts: "Burada henüz ürün yok",
  noProductsHint: "Başka bir filtre deneyin ya da yakında tekrar bakın.",
};

/** German. */
export const commerceLabelsDe: CommerceLabels = {
  ratingValue: "Bewertet mit {rating} von {max}",
  ratingCount: "{count, plural, one {# Bewertung} other {# Bewertungen}}",
  ratingInput: "Bewertung",
  ratingStars: "{value, plural, one {# Stern} other {# Sterne}}",
  ratingNone: "Keine Bewertung",
  reviewScore: "Unsere Wertung",
  scoreOutOf: "{score} von {max}",
  criteria: "Wertung nach Kriterien",
  pros: "Pro",
  cons: "Contra",
  verdict: "Fazit",
  reviewedBy: "Getestet von {name}",
  saleBadge: "Sale",
  saleOff: "−{percent} %",
  newBadge: "Neu",
  soldOut: "Ausverkauft",
  priceWas: "Vorher {price}",
  priceNow: "Jetzt {price}",
  priceFrom: "Ab {price}",
  priceRange: "{min} – {max}",
  quickAdd: "{name} in den Warenkorb",
  quickAddVariant: "{name}, {variant}, in den Warenkorb",
  optionsOf: "Varianten von {name}",
  moreOptions: "+{count} weitere",
  products: "Produkte",
  noProducts: "Hier gibt es noch keine Produkte",
  noProductsHint: "Versuchen Sie einen anderen Filter oder schauen Sie bald wieder vorbei.",
};

/** French. */
export const commerceLabelsFr: CommerceLabels = {
  ratingValue: "Noté {rating} sur {max}",
  ratingCount: "{count, plural, one {# avis} other {# avis}}",
  ratingInput: "Note",
  ratingStars: "{value, plural, one {# étoile} other {# étoiles}}",
  ratingNone: "Aucune note",
  reviewScore: "Notre note",
  scoreOutOf: "{score} sur {max}",
  criteria: "Notes par critère",
  pros: "Points forts",
  cons: "Points faibles",
  verdict: "Verdict",
  reviewedBy: "Testé par {name}",
  saleBadge: "Promo",
  saleOff: "−{percent} %",
  newBadge: "Nouveau",
  soldOut: "Épuisé",
  priceWas: "Avant {price}",
  priceNow: "Maintenant {price}",
  priceFrom: "À partir de {price}",
  priceRange: "{min} – {max}",
  quickAdd: "Ajouter {name} au panier",
  quickAddVariant: "Ajouter {name}, {variant}, au panier",
  optionsOf: "Options pour {name}",
  moreOptions: "+{count} autres",
  products: "Produits",
  noProducts: "Aucun produit pour l’instant",
  noProductsHint: "Essayez un autre filtre ou revenez bientôt.",
};

/** Spanish. */
export const commerceLabelsEs: CommerceLabels = {
  ratingValue: "Valorado con {rating} de {max}",
  ratingCount: "{count, plural, one {# reseña} other {# reseñas}}",
  ratingInput: "Valoración",
  ratingStars: "{value, plural, one {# estrella} other {# estrellas}}",
  ratingNone: "Sin valoración",
  reviewScore: "Nuestra nota",
  scoreOutOf: "{score} de {max}",
  criteria: "Notas por criterio",
  pros: "A favor",
  cons: "En contra",
  verdict: "Veredicto",
  reviewedBy: "Analizado por {name}",
  saleBadge: "Oferta",
  saleOff: "−{percent} %",
  newBadge: "Nuevo",
  soldOut: "Agotado",
  priceWas: "Antes {price}",
  priceNow: "Ahora {price}",
  priceFrom: "Desde {price}",
  priceRange: "{min} – {max}",
  quickAdd: "Añadir {name} al carrito",
  quickAddVariant: "Añadir {name}, {variant}, al carrito",
  optionsOf: "Opciones de {name}",
  moreOptions: "+{count} más",
  products: "Productos",
  noProducts: "Todavía no hay productos",
  noProductsHint: "Prueba otro filtro o vuelve pronto.",
};

/** Arabic. */
export const commerceLabelsAr: CommerceLabels = {
  ratingValue: "التقييم {rating} من {max}",
  ratingCount: "{count, plural, zero {لا مراجعات} one {مراجعة واحدة} two {مراجعتان} few {# مراجعات} many {# مراجعة} other {# مراجعة}}",
  ratingInput: "التقييم",
  ratingStars: "{value, plural, one {نجمة واحدة} two {نجمتان} few {# نجوم} other {# نجمة}}",
  ratingNone: "بلا تقييم",
  reviewScore: "تقييمنا",
  scoreOutOf: "{score} من {max}",
  criteria: "الدرجات حسب المعيار",
  pros: "الإيجابيات",
  cons: "السلبيات",
  verdict: "الخلاصة",
  reviewedBy: "مراجعة: {name}",
  saleBadge: "تخفيض",
  saleOff: "−{percent}٪",
  newBadge: "جديد",
  soldOut: "نفدت الكمية",
  priceWas: "كان {price}",
  priceNow: "الآن {price}",
  priceFrom: "ابتداءً من {price}",
  priceRange: "{min} – {max}",
  quickAdd: "أضف {name} إلى السلة",
  quickAddVariant: "أضف {name}، {variant}، إلى السلة",
  optionsOf: "خيارات {name}",
  moreOptions: "+{count} أخرى",
  products: "المنتجات",
  noProducts: "لا توجد منتجات بعد",
  noProductsHint: "جرّب عامل تصفية آخر أو عد لاحقًا.",
};

/** Labels accepted by the commerce blocks: infrastructure + these keys. */
export type CommerceBlockLabels = Partial<BlockLabels & CommerceLabels>;
export type CommerceKey = keyof (BlockLabels & CommerceLabels);
export type CommerceText = (key: CommerceKey, vars?: Record<string, unknown>) => string;

/** Label lookup for server components: `labels` prop → English. */
export function commerceText(labels: CommerceBlockLabels | Record<string, unknown> | undefined, locale = "en-US"): CommerceText {
  const merged: Record<string, string> = { ...blockLabels, ...commerceLabels };
  if (labels) for (const [k, v] of Object.entries(labels)) if (typeof v === "string") merged[k] = v;
  return (key, vars) => formatMessage(merged[key] ?? String(key), vars, locale);
}
