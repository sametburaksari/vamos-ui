import { blockCategories, blocks } from "@/blocks/registry";
import { BlocksBrowser } from "@/components/blocks/blocks-browser";
import { pageMeta } from "@/lib/seo";

const sites = blocks.filter((b) => b.category === "Website pages");

export const metadata = pageMeta({
  title: "Websites",
  description: `${sites.length} example websites built from Vamos UI components: firms, studios, shops, SaaS. Themeable, EN / TR, one command to copy.`,
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
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Complete sites, ready to copy.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          {sites.length} example websites with inner pages, motion and English / Turkish copy. Built only from kit
          components, so each one takes your theme, accent, density and font. Open one to see it full size and copy its code.
        </p>
      </div>
      <BlocksBrowser mode="websites" blocks={withFiles} categories={blockCategories} />
    </main>
  );
}
