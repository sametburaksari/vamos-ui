import { slugify } from "@vamos-ui/react";

const rows = [
  { locale: "en", title: "Q3 Results & Next Steps" },
  { locale: "tr", title: "İşe Alım & Oryantasyon Süreci" },
  { locale: "tr", title: "Çağrı Merkezi Yönetimi" },
  { locale: "de", title: "Größe & Übersicht für Bäckereien" },
];

export default function SlugLocales() {
  return (
    <div className="w-full max-w-xl overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-start text-fg-muted">
            <th className="py-2 pe-4 text-start font-medium">Locale</th>
            <th className="py-2 pe-4 text-start font-medium">Title</th>
            <th className="py-2 text-start font-medium">Slug</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.title} className="border-b border-line last:border-0">
              <td className="py-2 pe-4 font-mono text-xs text-fg-subtle">{r.locale}</td>
              <td className="py-2 pe-4 text-fg">{r.title}</td>
              <td className="py-2 font-mono text-xs text-fg">{slugify(r.title, { locale: r.locale })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
