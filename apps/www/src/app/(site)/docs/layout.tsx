import { DocsNav } from "@/components/docs/docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pt-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100dvh-100px)] overflow-y-auto pe-2 pb-10 scrollbar-none">
          <DocsNav />
        </div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
