import Link from "next/link";
import { ThemeEditor } from "@/components/themes/theme-editor";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Theme editor",
  description: "Pick theme, material, accent, density, font and corners, watch real Vamos UI components and blocks change, then copy one preset code for npx vamos-ui init, theme or create.",
  path: "/themes/",
});

export default function ThemesPage() {
  return (
    <main id="main" className="w-full px-4 py-10 md:px-8 md:py-12 xl:px-12">
      <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-2 text-[11.5px] font-medium tracking-[0.14em] text-fg-subtle uppercase">Themes</div>
          <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">
            Tune the kit, <em>keep</em> the code.
          </h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
            Six axes, one short preset code. Everything below is the real kit, themed with subtree attributes, so what you see is what <code className="font-mono text-[13px]">npx vamos-ui init --preset</code> gives your app. Bring your own brand colour and the CLI derives a palette that keeps text readable.
          </p>
        </div>
        <p className="max-w-xs text-[13px] leading-relaxed text-fg-muted lg:text-end">
          How the axes work: <Link href="/docs/theming/" className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">Theming</Link> · <Link href="/docs/cli/" className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">CLI</Link>
        </p>
      </div>
      <ThemeEditor />
    </main>
  );
}
