// vamos-ui create: starter root layout. While it is unchanged, `vamos-ui site essentials` fills it in from vamos.site.json.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "__APP_TITLE__",
  description: "Built with Vamos UI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="__LANG__" __HTML_ATTRS_JSX__>
      <body className="min-h-dvh bg-scene font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
