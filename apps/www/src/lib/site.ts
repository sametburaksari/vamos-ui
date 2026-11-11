export const site = {
  name: "Vamos UI",
  version: "0.1.0",
  github: "https://github.com/sametburaksari/vamos-ui",
  adminDemo: process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3100",
};

export const mainNav = [
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/docs/components" },
  { label: "Blocks", href: "/blocks" },
  { label: "Websites", href: "/websites" },
  { label: "Charts", href: "/charts" },
  { label: "Directory", href: "/directory" },
  { label: "Changelog", href: "/docs/changelog" },
];

/** "Sections" in the docs sidebar, above the component list. */
export const docSections = [
  { label: "Introduction", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
  { label: "Next.js setup", href: "/docs/installation/nextjs" },
  { label: "Vite setup", href: "/docs/installation/vite" },
  { label: "React Router setup", href: "/docs/installation/react-router" },
  { label: "Theming", href: "/docs/theming" },
  { label: "Theme editor", href: "/themes" },
  { label: "Localization", href: "/docs/localization" },
  { label: "CLI & registry", href: "/docs/cli" },
  { label: "MCP server", href: "/docs/mcp" },
  { label: "Publish a registry", href: "/docs/publish-a-registry" },
  { label: "Blocks", href: "/blocks" },
  { label: "Websites", href: "/websites" },
  { label: "Directory", href: "/directory" },
  { label: "Accessibility", href: "/docs/accessibility" },
  { label: "Security", href: "/docs/security" },
  { label: "Migration", href: "/docs/migration" },
  { label: "License", href: "/docs/license" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Changelog", href: "/docs/changelog" },
];

/** Legal pages, linked from the footer. */
export const legalNav = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
