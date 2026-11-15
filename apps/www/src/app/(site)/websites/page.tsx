import { blockCategories, blocks } from "@/blocks/registry";
import { BlocksBrowser } from "@/components/blocks/blocks-browser";
import { pageMeta } from "@/lib/seo";

const sites = blocks.filter((b) => b.category === "Website pages");

export const metadata = pageMeta({
  title: "Websites",
  description: "Showcase websites built only from Vamos UI components. A new site is planned with `vamos-ui new`: a recipe picks the pages and the components for every section.",
  path: "/websites/",
});

export default function WebsitesPage() {
  // Source code is not inlined: each viewer loads /blocks/code/<name>.json when its Code tab opens.
  const withFiles = sites.map((b) => ({
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
        <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Websites</div>
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Showcase sites, built from the kit.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          {sites.length} finished websites with inner pages, motion and English / Turkish copy, built only from kit components,
          so each one takes your theme, accent, density and font. They are references, not templates: run{" "}
          <code className="font-mono text-fg">npx vamos-ui new</code> and the plan picks a recipe for your kind of site, with the
          components and the facts to supply for every section.
        </p>
      </div>
      <BlocksBrowser mode="websites" blocks={withFiles} categories={blockCategories} />
    </main>
  );
}
