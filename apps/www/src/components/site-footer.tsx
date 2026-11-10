import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-6 md:px-8 xl:px-12 text-[12.5px] text-fg-subtle">
        <span>Built by <a className="text-fg-muted underline-offset-4 hover:underline" href="https://vamos.ist">Vamos</a>. Kit source under MIT. “Vamos UI” is a trademark of Vamos.</span>
        <span className="font-mono">v{site.version}</span>
      </div>
    </footer>
  );
}
