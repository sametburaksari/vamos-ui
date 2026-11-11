import { AspectRatio } from "@vamos-ui/react";

// Any direct child fills the box: here an embedded map on a contact page.
export default function AspectRatioMap() {
  return (
    <div className="grid w-full max-w-2xl gap-6 md:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-fg">Northwind Studio</span>
        <span className="text-fg-muted">Harbour Street 12, 3rd floor</span>
        <span className="text-fg-muted">Mon–Fri · 09:00–18:00</span>
      </div>
      <AspectRatio ratio="4/3" rounded="ui-lg" tone="inset">
        <iframe
          title="Map of Northwind Studio"
          loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=29.02%2C40.98%2C29.04%2C40.995&layer=mapnik"
        />
      </AspectRatio>
    </div>
  );
}
