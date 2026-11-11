import { blockCategories, blocks } from "@/blocks/registry";
import { BlocksBrowser } from "@/components/blocks/blocks-browser";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Blocks", description: "Whole screens built only from kit components: app shells, dashboards, sign-in, lists, detail pages, settings and 57 complete example websites. Copy any of them with one command.", path: "/blocks/" });

export default function BlocksPage() {
  // Source code is not inlined: each viewer loads /blocks/code/<name>.json when its Code tab opens.
  const withFiles = blocks.map((b) => ({
    name: b.name,
    title: b.title,
    description: b.description,
    category: b.category,
    tags: b.tags ?? ["any"],
    files: b.files,
  }));

  return (
    <main id="main" className="w-full px-5 md:px-8 xl:px-12 py-12">
      <div className="max-w-2xl">
        <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Blocks</div>
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Whole screens, ready to copy.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          App shells, dashboards and pages for any panel — CMS, CRM, HR, partner portals — and the websites around them.
          Built only from kit components, so they follow your theme, material, accent, density and font.
        </p>
      </div>
      <BlocksBrowser blocks={withFiles} categories={blockCategories} />
    </main>
  );
}
