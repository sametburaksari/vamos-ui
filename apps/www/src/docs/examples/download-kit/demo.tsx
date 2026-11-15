"use client";

import { DownloadKit, type DownloadAsset } from "@vamos-ui/react";
import { FileJson, FileText, Shapes } from "lucide-react";

const logo = (ink: string, bg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="24" fill="${bg}"/><circle cx="60" cy="60" r="30" fill="none" stroke="${ink}" stroke-width="12"/></svg>`;

const assets: DownloadAsset[] = [
  { id: "logo-light", name: "Logo, light background", file: "logo-light.svg", format: "SVG", size: 190, icon: <Shapes />, data: () => new Blob([logo("#1d1d1f", "#ffffff")], { type: "image/svg+xml" }) },
  { id: "logo-dark", name: "Logo, dark background", file: "logo-dark.svg", format: "SVG", size: 190, icon: <Shapes />, data: () => new Blob([logo("#ffffff", "#1d1d1f")], { type: "image/svg+xml" }) },
  { id: "facts", name: "Fact sheet", file: "fact-sheet.txt", format: "TXT", size: 160, icon: <FileText />, description: "Founding year, team size, contact", data: () => "Founded: 2021\nTeam: 12 people\nPress contact: press@example.com\n" },
  { id: "colours", name: "Brand colours", file: "colours.json", format: "JSON", size: 80, icon: <FileJson />, data: () => JSON.stringify({ ink: "#1d1d1f", paper: "#ffffff", accent: "#3a7d44" }, null, 2) },
];

/** Every file is generated in the browser here; tick a few and download them as one ZIP. */
export default function DownloadKitDemo() {
  return <DownloadKit assets={assets} archiveName="press-kit" className="w-full max-w-2xl" />;
}
