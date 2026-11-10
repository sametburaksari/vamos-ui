import { lintPage, type VamosDoc } from "@vamos-cms/ui/blocks/schema";
import { siteBlocks, kiyiPage } from "./_site-blocks";

// lintPage: structure, the "doesn't look AI-generated" rules and translation completeness.
const draft: VamosDoc = {
  ...kiyiPage,
  blocks: [
    ...kiyiPage.blocks,
    {
      id: "b_intro02",
      type: "intro",
      v: 1,
      theme: { accent: "oklch(0.62 0.2 292)" },
      props: {
        title: { en: "Unlock a seamless next-gen dining experience for the whole family tonight" },
        actions: [
          { link: { href: "/a", label: "Book now" }, style: "primary" },
          { link: { href: "/b", label: "Order online" }, style: "primary" },
        ],
      },
    },
  ],
};

const tone = { error: "tone-danger", warning: "tone-warning", info: "tone-info" } as const;

export default function BlocksApiLint() {
  const { issues, completeness } = lintPage(draft, siteBlocks);
  return (
    <div className="w-full rounded-ui border border-line bg-surface">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line px-5 py-3.5 text-small">
        <span className="font-medium text-fg">{issues.length} findings</span>
        {Object.entries(completeness).map(([locale, pct]) => (
          <span key={locale} className="tabular text-fg-muted">
            <span className="font-mono uppercase">{locale}</span> {pct}% translated
          </span>
        ))}
      </div>
      <ul className="divide-y divide-line">
        {issues.map((i, n) => (
          <li key={n} className="grid gap-x-4 gap-y-1 px-5 py-3 text-small sm:grid-cols-[5.5rem_11rem_1fr]">
            <span className={`${tone[i.severity]} tone-soft h-fit w-fit self-start rounded-full px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.06em]`}>{i.severity}</span>
            <span className="font-mono text-fg-muted">{i.code}</span>
            <span className="text-fg">
              {i.message}
              {i.path ? <span className="text-fg-subtle"> · {i.path}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
