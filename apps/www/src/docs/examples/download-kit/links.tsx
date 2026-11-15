import { DownloadKit } from "@vamos-ui/react";

/** Hosted files only, no selection: each row is a plain download link (works without JavaScript). */
export default function DownloadKitLinks() {
  return (
    <DownloadKit
      selectable={false}
      className="w-full max-w-2xl"
      assets={[
        { id: "icon", name: "Kit icon", file: "vamos-ui-icon.svg", href: "/brand/vamos-ui-icon.svg", format: "SVG", size: 1_256 },
        { id: "icon-png", name: "Kit icon, 512 px", file: "vamos-ui-icon-512.png", href: "/brand/vamos-ui-icon-512.png", format: "PNG", size: 47_956, description: "Transparent background" },
      ]}
    />
  );
}
