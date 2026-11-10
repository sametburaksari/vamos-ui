"use client";

import { AttachmentList, type AttachmentData } from "@vamos-cms/ui";

// Sample photos (Unsplash): a spa treatment room and a hot-stone session.
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=360&h=270&q=70&auto=format&fit=crop`;

const files: AttachmentData[] = [
  { id: "p1", name: "treatment-room-2.jpg", size: 2_400_000, mime: "image/jpeg", thumbUrl: photo("1540555700478-4be289fbecef"), url: "#", uploadedAt: "2026-11-08" },
  { id: "p2", name: "hot-stone-session.jpg", size: 3_100_000, mime: "image/jpeg", thumbUrl: photo("1544161515-4ab6ce6db874"), url: "#", uploadedAt: "2026-11-08" },
  { id: "p3", name: "floor-plan-v3.pdf", size: 640_000, mime: "application/pdf", url: "#", uploadedAt: "2026-11-07" },
  { id: "p4", name: "brand-assets.zip", size: 48_200_000, mime: "application/zip", url: "#", uploadedAt: "2026-11-05" },
  { id: "p5", name: "opening-teaser.mp4", size: 22_800_000, mime: "video/mp4", status: "processing" },
];

export default function AttachmentListGrid() {
  return <AttachmentList layout="grid" items={files} onPreview={() => {}} onRemove={() => {}} onAddFiles={() => {}} accept="image/*,.pdf,.zip,video/*" className="w-full" />;
}
