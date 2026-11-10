import { blocks } from "@/blocks/registry";
import { highlight, readBlockFile } from "@/lib/highlight";
import { BlockViewer } from "@/components/blocks/block-viewer";

export const metadata = { title: "Blocks" };

export default async function BlocksPage() {
  const withFiles = await Promise.all(
    blocks.map(async (b) => ({
      ...b,
      files: await Promise.all(b.files.map(async (path) => {
        const raw = await readBlockFile(path);
        return { path, raw, html: await highlight(raw) };
      })),
    })),
  );
  const categories = [...new Set(blocks.map((b) => b.category))];

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-12">
      <div className="max-w-2xl">
        <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Blocks</div>
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Whole screens, ready to copy.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          App shells, dashboards and pages for any panel — CMS, CRM, HR, partner portals — and the websites around them.
          Built only from kit components, so they follow your theme, material, accent, density and font.
        </p>
        <nav className="mt-5 flex flex-wrap gap-1.5" aria-label="Block categories">
          {categories.map((c) => (
            <a key={c} href={`#${blocks.find((b) => b.category === c)!.name}`} className="rounded-full border border-field-border px-3 py-1 text-[12.5px] text-fg-muted hover:bg-hover hover:text-fg">{c}</a>
          ))}
        </nav>
      </div>
      <div className="mt-12 grid gap-16">
        {withFiles.map((b) => <BlockViewer key={b.name} name={b.name} title={b.title} description={b.description} files={b.files} />)}
      </div>
    </div>
  );
}
