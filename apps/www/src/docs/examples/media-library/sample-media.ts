// Sample media for the Media library, Media picker and Image field examples.
// In an app, swap createMemoryAdapter for createRestAdapter({ baseUrl: "/api" }).
import { createMemoryAdapter, type MediaAsset, type MediaFolder } from "@vamos-ui/react/media";

const unsplash = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=78&auto=format&fit=crop`;

const elif = { id: "u_elif", name: "Elif Demir" };
const mert = { id: "u_mert", name: "Mert Aksoy" };
const deniz = { id: "u_deniz", name: "Deniz Yalçın" };

function photo(
  id: string,
  unsplashId: string,
  filename: string,
  alt: string,
  createdAt: string,
  extra: Partial<MediaAsset> = {},
): MediaAsset {
  const width = extra.width ?? 1600;
  const height = extra.height ?? 1067;
  return {
    id,
    kind: "image",
    mime: filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg",
    filename,
    size: Math.round((width * height) / 7.4),
    url: unsplash(unsplashId, 1600),
    width,
    height,
    alt,
    createdAt,
    uploadedBy: elif,
    folderId: null,
    status: "ready",
    variants: { thumb: { url: unsplash(unsplashId, 400), width: 400, height: Math.round((400 * height) / width) } },
    ...extra,
  };
}

export const demoFolders: MediaFolder[] = [
  { id: "f_blog", name: "Blog" },
  { id: "f_listings", name: "Listings" },
  { id: "f_team", name: "Team" },
  { id: "f_docs", name: "Documents" },
];

export const demoAssets: MediaAsset[] = [
  photo("m_harbour", "photo-1600596542815-ffad4c1539a9", "villa-pool-terrace.jpg", "White villa with a pool terrace at dusk", "2026-11-08T09:12:00Z", { folderId: "f_listings", focalPoint: { x: 0.62, y: 0.48 }, usage: { count: 2, items: [{ type: "Listing", id: "l_41", title: "Bodrum Yalıkavak villa" }, { type: "Page", id: "p_3", title: "Home" }] } }),
  photo("m_lobby", "photo-1497366216548-37526070297c", "office-lobby.jpg", "Bright open-plan office with long oak desks", "2026-11-07T15:40:00Z", { folderId: "f_blog", uploadedBy: mert }),
  photo("m_team", "photo-1522071820081-009f0129c71c", "team-planning.jpg", "", "2026-11-06T11:05:00Z", { folderId: "f_team", uploadedBy: deniz }),
  photo("m_bistro", "photo-1517248135467-4c7edcad34c4", "bistro-dining-room.jpg", "Dining room with pendant lights and wooden tables", "2026-11-05T19:22:00Z", { folderId: "f_blog" }),
  photo("m_kitchen", "photo-1484154218962-a197022b5858", "kitchen-renovation.jpg", "Renovated kitchen with a marble island", "2026-11-04T08:30:00Z", { folderId: "f_listings" }),
  photo("m_meeting", "photo-1556761175-b413da4baf72", "client-workshop.jpg", "", "2026-11-03T13:15:00Z", { folderId: "f_blog", uploadedBy: mert }),
  photo("m_coast", "photo-1501785888041-af3ef285b470", "coastline-hero.jpg", "Turquoise bay seen from a pine-covered cliff", "2026-10-29T07:50:00Z", { width: 1600, height: 900 }),
  photo("m_portrait_1", "photo-1494790108377-be9c29b29330", "selin-kaya.jpg", "Selin Kaya, Head of Sales", "2026-10-27T10:00:00Z", { folderId: "f_team", width: 1600, height: 2000 }),
  photo("m_portrait_2", "photo-1507003211169-0a1dd7228f2d", "emre-sahin.jpg", "Emre Şahin, Lead Engineer", "2026-10-27T10:02:00Z", { folderId: "f_team", width: 1600, height: 2000 }),
  photo("m_city", "photo-1449824913935-59a10b8d2000", "city-at-night.jpg", "City skyline at night with light trails", "2026-10-20T21:10:00Z", { uploadedBy: deniz }),
  photo("m_spa", "photo-1540555700478-4be289fbecef", "spa-treatment-room.jpg", "Candle-lit treatment room with folded towels", "2026-10-14T12:30:00Z", { folderId: "f_blog" }),
  photo("m_logo", "photo-1531297484001-80022131f5a1", "laptop-dashboard.jpg", "Laptop showing a sales dashboard", "2026-10-09T09:00:00Z", { width: 640, height: 360, tags: [] }),
  photo("m_texture", "photo-1490750967868-88aa4486c946", "spring-flowers.jpg", "", "2026-10-02T16:20:00Z", { tags: ["decorative"] }),
  {
    id: "m_report",
    kind: "document",
    mime: "application/pdf",
    filename: "q3-board-report.pdf",
    size: 2_380_000,
    url: "https://cdn.example.com/q3-board-report.pdf",
    alt: "",
    createdAt: "2026-10-01T16:45:00Z",
    uploadedBy: mert,
    folderId: "f_docs",
    usage: { count: 0 },
  },
  {
    id: "m_contract",
    kind: "document",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: "employment-contract-template.docx",
    size: 86_400,
    url: "https://cdn.example.com/employment-contract-template.docx",
    alt: "",
    createdAt: "2026-09-22T09:30:00Z",
    uploadedBy: deniz,
    folderId: "f_docs",
  },
  {
    id: "m_promo",
    kind: "video",
    mime: "video/mp4",
    filename: "autumn-campaign-15s.mp4",
    size: 14_600_000,
    url: "https://cdn.example.com/autumn-campaign-15s.mp4",
    width: 1920,
    height: 1080,
    duration: 15,
    alt: "",
    createdAt: "2026-09-18T14:00:00Z",
    uploadedBy: elif,
    folderId: "f_blog",
    variants: { poster: { url: unsplash("photo-1441974231531-c6227db76b6e", 400), width: 400, height: 225 } },
  },
  {
    id: "m_brand",
    kind: "archive",
    mime: "application/zip",
    filename: "brand-kit-2026.zip",
    size: 48_200_000,
    url: "https://cdn.example.com/brand-kit-2026.zip",
    alt: "",
    createdAt: "2026-09-02T10:10:00Z",
    uploadedBy: elif,
    folderId: "f_docs",
  },
];

/** A fresh in-memory library per example, so edits in one don't leak into another. */
export function createDemoMedia(options: Parameters<typeof createMemoryAdapter>[0] = {}) {
  return createMemoryAdapter({ seed: demoAssets, folders: demoFolders, latency: 180, uploadDuration: 1400, ...options });
}

export const demoAsset = (id: string) => demoAssets.find((a) => a.id === id)!;
