import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "__APP_TITLE__",
  description: "Built with Vamos UI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" __HTML_ATTRS_JSX__>
      <body className="min-h-dvh bg-scene font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
