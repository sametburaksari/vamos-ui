import { blockCategories, blocks } from "@/blocks/registry";
import { highlight, readBlockFile } from "@/lib/highlight";
import { BlocksBrowser } from "@/components/blocks/blocks-browser";

export const metadata = { title: "Blocks" };

export default async function BlocksPage() {
  const withFiles = await Promise.all(
    blocks.map(async (b) => ({
      name: b.name,
      title: b.title,
      description: b.description,
      category: b.category,
      tags: b.tags ?? ["any"],
      files: await Promise.all(b.files.map(async (path) => {
        const raw = await readBlockFile(path);
        return { path, raw, html: await highlight(raw) };
      })),
    })),
  );

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
