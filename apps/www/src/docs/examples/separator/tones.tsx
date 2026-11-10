import { Separator } from "@vamos-cms/ui";

const items = ["Dashboard", "Posts", "Media", "Comments"];

export default function SeparatorTones() {
  return (
    <div className="grid w-full max-w-md gap-6 sm:grid-cols-2">
      <div className="surface rounded-ui-lg py-2 text-sm">
        {items.map((item, i) => (
          <div key={item}>
            {i > 0 ? <Separator inset /> : null}
            <p className="px-5 py-2.5">{item}</p>
          </div>
        ))}
        <Separator tone="strong" className="mt-2" />
        <p className="flex justify-between px-5 pt-2.5 text-fg-muted">
          <span>Total items</span>
          <span className="tabular">4</span>
        </p>
      </div>
      <div className="surface-nav grid content-start rounded-ui-lg p-3 text-[13px]">
        <p className="px-2 py-1.5 text-nav-fg-strong">Content</p>
        <Separator tone="nav" className="my-1.5" />
        <p className="px-2 py-1.5">Settings</p>
      </div>
    </div>
  );
}
