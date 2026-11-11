import type { MetadataRoute } from "next";
import { docs } from "@/docs/registry";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const pages = [
  ["/", 1, "weekly"],
  ["/docs/", 0.9, "weekly"],
  ["/docs/installation/", 0.8, "monthly"],
  ["/docs/installation/nextjs/", 0.7, "monthly"],
  ["/docs/installation/vite/", 0.7, "monthly"],
  ["/docs/installation/react-router/", 0.7, "monthly"],
  ["/docs/migration/", 0.5, "monthly"],
  ["/docs/accessibility/", 0.6, "monthly"],
  ["/docs/security/", 0.4, "yearly"],
  ["/docs/components/", 0.9, "weekly"],
  ["/docs/theming/", 0.7, "monthly"],
  ["/docs/localization/", 0.6, "monthly"],
  ["/docs/fonts/", 0.6, "monthly"],
  ["/docs/cli/", 0.8, "monthly"],
  ["/docs/mcp/", 0.7, "monthly"],
  ["/docs/changelog/", 0.6, "weekly"],
  ["/docs/license/", 0.3, "yearly"],
  ["/privacy/", 0.3, "yearly"],
  ["/terms/", 0.3, "yearly"],
  ["/blocks/", 0.9, "weekly"],
  ["/websites/", 0.9, "weekly"],
  ["/charts/", 0.7, "monthly"],
  ["/themes/", 0.8, "monthly"],
  ["/directory/", 0.6, "weekly"],
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...pages.map(([path, priority, changeFrequency]) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority })),
    ...docs.map((d) => ({ url: `${SITE_URL}/docs/components/${d.slug}/`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
