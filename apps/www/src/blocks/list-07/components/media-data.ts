// The Kiln & Linen website's media library: product shots (the same photos as the shop admin),
// lookbook images, two videos and the documents the press and wholesale pages link to.
import type { MediaAsset, MediaFolder } from "@vamos-ui/react/media";
import type { L } from "../../_shared/l10n";
import { people } from "../../_shared/people";
import { products } from "../../_shared/products";
import { int, pick, seeded } from "../../_shared/random";
import { at } from "../../_shared/time";

export const folders: MediaFolder[] = [
  { id: "f-products", name: "Products", parentId: null },
  { id: "f-ceramics", name: "Ceramics", parentId: "f-products" },
  { id: "f-textiles", name: "Textiles", parentId: "f-products" },
  { id: "f-lookbook", name: "Lookbook AW26", parentId: null },
  { id: "f-journal", name: "Journal", parentId: null },
  { id: "f-press", name: "Press kit", parentId: null },
];

/** Folder names in Turkish (the kit shows `MediaFolder.name` as given). */
export const folderNamesTr: Record<string, string> = {
  "f-products": "Ürünler",
  "f-ceramics": "Seramik",
  "f-textiles": "Tekstil",
  "f-lookbook": "Lookbook Sonbahar-Kış 26",
  "f-journal": "Günlük",
  "f-press": "Basın kiti",
};

const unsplash = (photo: string, w: number, h = w) => `https://images.unsplash.com/photo-${photo}?w=${w}&h=${h}&q=72&auto=format&fit=crop`;
const editors = people.filter((p) => ["design", "marketing"].includes(p.team));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function build(): MediaAsset[] {
  const rand = seeded(7070);
  const out: MediaAsset[] = [];
  products.forEach((p, i) => {
    const folderId = p.category === "ceramics" ? "f-ceramics" : p.category === "textiles" ? "f-textiles" : "f-products";
    const by = pick(rand, editors);
    const missingAlt = i % 4 === 1;
    out.push({
      id: `m-p${i + 1}`,
      kind: "image",
      mime: "image/jpeg",
      filename: `${slug(p.name.en)}-studio.jpg`,
      size: int(rand, 380, 2400) * 1024,
      url: unsplash(p.photo, 1600),
      width: 1600,
      height: 1600,
      alt: missingAlt ? "" : `${p.name.en} photographed on a linen backdrop`,
      folderId,
      tags: [p.category, "studio"],
      createdAt: at(-int(rand, 2, 160), `${String(int(rand, 9, 18)).padStart(2, "0")}:${String(int(rand, 0, 59)).padStart(2, "0")}`),
      uploadedBy: { id: by.id, name: by.name },
      usage: { count: missingAlt ? 1 : int(rand, 1, 4), items: [{ type: "product", id: p.id, title: p.name.en, href: `#/site/catalogue/${p.id}` }] },
      variants: { thumb: { url: unsplash(p.photo, 320), width: 320, height: 320 }, medium: { url: unsplash(p.photo, 800), width: 800, height: 800 } },
    });
  });
  // Lookbook: wide shots reuse four product photos at another crop.
  products.slice(0, 6).forEach((p, i) => {
    const by = pick(rand, editors);
    out.push({
      id: `m-l${i + 1}`,
      kind: "image",
      mime: "image/jpeg",
      filename: `aw26-lookbook-${String(i + 1).padStart(2, "0")}.jpg`,
      size: int(rand, 1800, 5200) * 1024,
      url: unsplash(p.photo, 2400, 1600),
      width: 2400,
      height: 1600,
      alt: i === 2 ? "" : `Autumn lookbook: ${p.name.en.toLowerCase()} in a sunlit room`,
      folderId: "f-lookbook",
      tags: ["lookbook", "aw26"],
      createdAt: at(-int(rand, 1, 12), "11:20"),
      uploadedBy: { id: by.id, name: by.name },
      usage: { count: i < 3 ? 2 : 0 },
      variants: { thumb: { url: unsplash(p.photo, 480, 320), width: 480, height: 320 } },
    });
  });
  const film = products[3]!;
  out.push(
    {
      id: "m-v1",
      kind: "video",
      mime: "video/mp4",
      filename: "aw26-campaign-film-30s.mp4",
      size: 48_200_000,
      url: "https://media.example.com/kiln-linen/aw26-campaign-film-30s.mp4",
      width: 1920,
      height: 1080,
      duration: 30,
      alt: "Thirty-second autumn campaign film",
      folderId: "f-lookbook",
      tags: ["video", "aw26"],
      createdAt: at(-3, "16:05"),
      uploadedBy: { id: "p-camille", name: "Camille Rousseau" },
      usage: { count: 1, items: [{ type: "page", id: "pg-home", title: "Home", href: "#/site/pages/home" }] },
      variants: { poster: { url: unsplash(film.photo, 640, 360), width: 640, height: 360 } },
    },
    {
      id: "m-v2",
      kind: "video",
      mime: "video/mp4",
      filename: "glaze-process-timelapse.mp4",
      size: 112_900_000,
      url: "https://media.example.com/kiln-linen/glaze-process-timelapse.mp4",
      width: 1920,
      height: 1080,
      duration: 94,
      alt: "",
      folderId: "f-journal",
      tags: ["video", "process"],
      createdAt: at(-21, "10:40"),
      uploadedBy: { id: "p-jun", name: "Jun Park" },
      usage: { count: 0 },
    },
  );
  const docs: Array<[filename: string, mime: string, folderId: string | null, size: number, by: string]> = [
    ["kiln-linen-press-kit-2026.pdf", "application/pdf", "f-press", 6_400_000, "p-camille"],
    ["brand-guidelines-v3.pdf", "application/pdf", "f-press", 14_800_000, "p-nadia"],
    ["wholesale-price-list-aw26.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", null, 182_000, "p-arda"],
    ["logo-pack.zip", "application/zip", "f-press", 3_100_000, "p-nadia"],
    ["care-guide-linen.pdf", "application/pdf", "f-journal", 920_000, "p-jun"],
  ];
  docs.forEach(([filename, mime, folderId, size, by], i) => {
    const p = people.find((x) => x.id === by)!;
    out.push({
      id: `m-d${i + 1}`,
      kind: mime.includes("zip") ? "archive" : "document",
      mime,
      filename,
      size,
      url: `https://media.example.com/kiln-linen/${filename}`,
      alt: "",
      folderId,
      tags: ["download"],
      createdAt: at(-int(rand, 5, 90), "14:00"),
      uploadedBy: { id: p.id, name: p.name },
      usage: { count: i === 2 ? 0 : 1 },
    });
  });
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const seedAssets: MediaAsset[] = build();

/** Plan storage, bytes. */
export const STORAGE_LIMIT = 5_000_000_000;
/** What older, archived campaigns already take up (not in this list). */
export const ARCHIVED_BYTES = 1_840_000_000;

export const kindLabels: Record<"image" | "video" | "document", L> = {
  image: { en: "Images", tr: "Görseller" },
  video: { en: "Video", tr: "Video" },
  document: { en: "Documents", tr: "Belgeler" },
};
