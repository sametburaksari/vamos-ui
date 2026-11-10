// Shared fixtures for the media tests (not exported from the package).
import type { MediaAsset, MediaFolder } from "./types";

const img = (id: string, filename: string, alt: string, extra: Partial<MediaAsset> = {}): MediaAsset => ({
  id,
  kind: "image",
  mime: "image/jpeg",
  filename,
  size: 482_000,
  url: `https://cdn.example.com/${filename}`,
  width: 2400,
  height: 1600,
  alt,
  createdAt: "2026-11-04T09:12:00Z",
  folderId: null,
  uploadedBy: { id: "u1", name: "Elif Demir" },
  ...extra,
});

export const mediaFolders: MediaFolder[] = [
  { id: "f_blog", name: "Blog" },
  { id: "f_team", name: "Team" },
];

export const mediaSeed: MediaAsset[] = [
  img("m1", "harbour-sunrise.jpg", "Fishing boats in Kadıköy harbour at sunrise", { folderId: "f_blog" }),
  img("m2", "team-offsite.jpg", "", { folderId: "f_team", createdAt: "2026-10-21T14:00:00Z" }),
  img("m3", "office-lobby.jpg", "Reception desk with oak panels and a green wall", { createdAt: "2026-10-02T08:30:00Z" }),
  img("m4", "small-logo.png", "Vamos logo", { mime: "image/png", width: 400, height: 210, size: 18_400 }),
  {
    id: "m5",
    kind: "document",
    mime: "application/pdf",
    filename: "q3-board-report.pdf",
    size: 2_400_000,
    url: "https://cdn.example.com/q3-board-report.pdf",
    alt: "",
    createdAt: "2026-09-18T16:45:00Z",
    folderId: null,
    uploadedBy: { id: "u2", name: "Mert Aksoy" },
  },
];
