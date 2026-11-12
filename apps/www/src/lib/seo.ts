import type { Metadata } from "next";

export const SITE_URL = "https://ui.vamos.ist";
export const SITE_NAME = "Vamos UI";
export const SITE_DESCRIPTION =
  "Open-source React kit for admin panels and websites: CMS, CRM, HR. Tailwind CSS, six theme axes, 150+ blocks, a CLI and an MCP server for AI.";
export const OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: "Vamos UI — one component kit for every admin panel and website" };

/** Page metadata with canonical URL, Open Graph and Twitter card. `path` starts with "/" and ends with "/" (trailing-slash export). */
export function pageMeta({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, url: path, title: `${title} · ${SITE_NAME}`, description, images: [OG_IMAGE], locale: "en_US" },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description, images: [OG_IMAGE.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
