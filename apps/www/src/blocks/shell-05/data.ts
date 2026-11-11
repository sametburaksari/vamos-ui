// Media library for the Kiln & Linen website CMS. Photos reuse the shared product shots,
// so a mug in the shop admin is the same mug here.
import { FileText, Images, Inbox, MessageSquare, PanelsTopLeft, Settings, type LucideIcon } from "lucide-react";
import { products, productPhoto } from "../_shared/products";
import { at, minutesFromNow } from "../_shared/time";
import type { L } from "../_shared/l10n";

export type AssetKind = "image" | "video" | "document";

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  folder: string;
  /** Thumbnail URL (images and video posters). */
  thumb?: string;
  width?: number;
  height?: number;
  /** Bytes. */
  size: number;
  /** Seconds, videos only. */
  duration?: number;
  /** File extension shown on document tiles. */
  ext: string;
  alt: string;
  uploadedBy: string;
  uploadedAt: string;
  usedIn: L[];
}

export interface Folder {
  id: string;
  name: L;
  children?: Folder[];
}

export const folders: Folder[] = [
  {
    id: "products",
    name: { en: "Products", tr: "Ürünler" },
    children: [
      { id: "ceramics", name: { en: "Ceramics", tr: "Seramik" } },
      { id: "textiles", name: { en: "Textiles", tr: "Tekstil" } },
      { id: "lighting", name: { en: "Lighting", tr: "Aydınlatma" } },
      { id: "kitchen", name: { en: "Kitchen", tr: "Mutfak" } },
      { id: "decor", name: { en: "Decor", tr: "Dekorasyon" } },
    ],
  },
  { id: "lookbook", name: { en: "Lookbook AW26", tr: "Lookbook Sonbahar-Kış 26" } },
  { id: "journal", name: { en: "Journal", tr: "Günlük" } },
  { id: "brand", name: { en: "Brand & press", tr: "Marka ve basın" } },
];

export const folderName = (id: string): L | undefined => {
  for (const f of folders) {
    if (f.id === id) return f.name;
    const c = f.children?.find((x) => x.id === id);
    if (c) return c.name;
  }
  return undefined;
};

/** Leaf folders, for "Move to…". */
export const leafFolders = folders.flatMap((f) => f.children ?? [f]);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const uploaders = ["p-jun", "p-nadia", "p-camille", "p-arda"];

const productAssets: Asset[] = products.map((p, i) => ({
  id: `as-${p.id}`,
  name: `${slug(p.name.en)}-${i % 3 === 0 ? "hero" : "packshot"}.jpg`,
  kind: "image",
  folder: p.category,
  thumb: productPhoto(p, 360),
  width: i % 2 ? 2400 : 3000,
  height: i % 2 ? 3000 : 2400,
  size: 840_000 + ((i * 377_191) % 2_600_000),
  ext: "jpg",
  // Three photos ship without alt text — the "Missing alt text" collection finds them.
  alt: [4, 9, 12].includes(i) ? "" : `${p.name.en}, photographed on a linen backdrop`,
  uploadedBy: uploaders[i % uploaders.length]!,
  uploadedAt: minutesFromNow(-(i * 1_310 + 45)),
  usedIn: i % 4 === 3 ? [] : [{ en: `Product · ${p.name.en}`, tr: `Ürün · ${p.name.tr}` }, ...(i % 3 === 0 ? [{ en: "Home · Autumn edit", tr: "Ana sayfa · Sonbahar seçkisi" }] : [])],
}));

const photo = (id: string) => productPhoto(products.find((p) => p.id === id)!, 360);

const extraAssets: Asset[] = [
  { id: "as-lb-3", name: "aw26-campaign-film.mp4", kind: "video", folder: "lookbook", thumb: photo("pr-07"), width: 1920, height: 1080, size: 48_200_000, duration: 74, ext: "mp4", alt: "Campaign film: lanterns lit at dusk", uploadedBy: "p-arda", uploadedAt: at(-2, "16:12"), usedIn: [{ en: "Home · Hero", tr: "Ana sayfa · Kapak" }] },
  { id: "as-jr-2", name: "how-we-wash-linen.mp4", kind: "video", folder: "journal", thumb: photo("pr-06"), width: 1080, height: 1350, size: 22_400_000, duration: 38, ext: "mp4", alt: "Short clip of linen being stone-washed", uploadedBy: "p-jun", uploadedAt: at(-9, "09:05"), usedIn: [] },
  { id: "as-br-1", name: "kiln-linen-press-kit-2026.pdf", kind: "document", folder: "brand", size: 6_480_000, ext: "pdf", alt: "", uploadedBy: "p-camille", uploadedAt: at(-21, "14:30"), usedIn: [{ en: "Page · Press", tr: "Sayfa · Basın" }] },
  { id: "as-br-2", name: "wholesale-line-sheet-aw26.pdf", kind: "document", folder: "brand", size: 3_920_000, ext: "pdf", alt: "", uploadedBy: "p-nadia", uploadedAt: at(-4, "17:55"), usedIn: [{ en: "Page · Wholesale", tr: "Sayfa · Toptan satış" }] },
  { id: "as-br-3", name: "logo-wordmark.svg", kind: "document", folder: "brand", size: 6_200, ext: "svg", alt: "Kiln & Linen wordmark", uploadedBy: "p-nadia", uploadedAt: at(-120, "10:00"), usedIn: [{ en: "Theme · Header", tr: "Tema · Üst alan" }, { en: "Email · Footer", tr: "E-posta · Alt bilgi" }] },
  { id: "as-br-4", name: "care-guide-ceramics.pdf", kind: "document", folder: "brand", size: 1_140_000, ext: "pdf", alt: "", uploadedBy: "p-jun", uploadedAt: at(-33, "12:20"), usedIn: [] },
];

export const assets: Asset[] = [...extraAssets, ...productAssets];

/** Storage on the plan. */
export const storage = { usedBytes: 7_420_000_000, totalBytes: 10_000_000_000 };

/* Rail ------------------------------------------------------------------------ */

export type SectionId = "content" | "media" | "forms" | "comments" | "design" | "settings";

export interface RailSection {
  id: SectionId;
  label: L;
  icon: LucideIcon;
  badge?: number;
}

export const railSections: RailSection[] = [
  { id: "content", label: { en: "Content", tr: "İçerik" }, icon: FileText },
  { id: "media", label: { en: "Media", tr: "Medya" }, icon: Images },
  { id: "forms", label: { en: "Forms", tr: "Formlar" }, icon: Inbox, badge: 6 },
  { id: "comments", label: { en: "Comments", tr: "Yorumlar" }, icon: MessageSquare, badge: 3 },
  { id: "design", label: { en: "Design", tr: "Tasarım" }, icon: PanelsTopLeft },
];

export const settingsSection: RailSection = { id: "settings", label: { en: "Settings", tr: "Ayarlar" }, icon: Settings };

/** Links shown in the flyout panel of the sections that are not part of this preview. */
export const sectionLinks: Record<Exclude<SectionId, "media">, Array<{ label: L; count?: number; hint?: L }>> = {
  content: [
    { label: { en: "Pages", tr: "Sayfalar" }, count: 18 },
    { label: { en: "Journal posts", tr: "Günlük yazıları" }, count: 42 },
    { label: { en: "Drafts", tr: "Taslaklar" }, count: 5 },
    { label: { en: "Scheduled", tr: "Zamanlanmış" }, count: 2, hint: { en: "Next: Fri 09:00", tr: "Sıradaki: Cuma 09:00" } },
    { label: { en: "Redirects", tr: "Yönlendirmeler" } },
  ],
  forms: [
    { label: { en: "Wholesale enquiries", tr: "Toptan satış talepleri" }, count: 4 },
    { label: { en: "Newsletter sign-ups", tr: "Bülten kayıtları" }, count: 2 },
    { label: { en: "Contact", tr: "İletişim" } },
  ],
  comments: [
    { label: { en: "Pending review", tr: "İnceleme bekleyen" }, count: 3 },
    { label: { en: "Approved", tr: "Onaylanan" } },
    { label: { en: "Spam", tr: "Spam" }, count: 41 },
  ],
  design: [
    { label: { en: "Navigation menus", tr: "Gezinme menüleri" } },
    { label: { en: "Theme", tr: "Tema" } },
    { label: { en: "Announcement bar", tr: "Duyuru şeridi" } },
  ],
  settings: [
    { label: { en: "General", tr: "Genel" } },
    { label: { en: "Image sizes", tr: "Görsel boyutları" } },
    { label: { en: "Editors & roles", tr: "Editörler ve roller" } },
  ],
};
