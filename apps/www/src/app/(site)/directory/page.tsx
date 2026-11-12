import { DirectoryList } from "@/components/directory-list";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Directory", description: "A directory of every Vamos UI component, block and chart in one searchable list.", path: "/directory/" });

const checklist = [
  "Styling reads Vamos UI semantic tokens only — no hard-coded colours, no dark: variants.",
  "Works in all six axes: light/dark, glass/solid, every accent, both densities, every font preset, every corner setting.",
  "Keyboard and screen-reader support for every interactive part.",
  "Built-in text comes from props or a locale dictionary, not hard-coded strings.",
  "An OSI-approved license (MIT, Apache-2.0, BSD or ISC) stated in the registry.",
  "A public source repository and a working registry URL.",
];

export default function DirectoryPage() {
  return (
    <main id="main" className="w-full px-5 md:px-8 xl:px-12 py-12">
      <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Directory</div>
      <h1 className="font-display text-[length:calc(44px*var(--display-scale))] leading-[1.05]">Registry directory</h1>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-fg-muted">
        Registries are collections of components, blocks or locale packs you can install with the CLI. This directory lists
        the first-party ones and, after review, community registries. Every entry is checked for tokens-only styling,
        accessibility and an open-source license, so whatever you install follows the same theme axes as the rest of your app.
      </p>

      <div className="mt-10"><DirectoryList /></div>

      <section id="submit" className="mt-16 scroll-mt-20">
        <h2 className="border-b border-line pb-2 text-[21px] font-semibold tracking-[-0.015em]">Submit a registry</h2>
        <p className="mt-4 text-[14.5px] text-fg-muted">Open an issue with your registry URL. It is listed once it passes this checklist:</p>
        <ol className="mt-4 grid list-decimal gap-2 ps-5 text-[14px] text-fg-muted marker:text-fg-subtle">
          {checklist.map((c) => <li key={c}>{c}</li>)}
        </ol>
      </section>
    </main>
  );
}
