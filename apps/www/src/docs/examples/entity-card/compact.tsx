import { EntityCard } from "@vamos-cms/ui";

const people = [
  { name: "Ayşe Kaya", role: "Account owner", status: { tone: "success" as const, label: "Online" }, email: "ayse.kaya@vamos.ist" },
  { name: "Mehmet Yılmaz", role: "Solutions engineer", email: "mehmet.yilmaz@vamos.ist" },
  { name: "Grace Liu", role: "Customer success", archived: true },
];

export default function EntityCardCompact() {
  return (
    <div className="w-full max-w-sm rounded-ui border border-line bg-surface p-2">
      <p className="px-2 pt-1 pb-2 text-xs font-medium text-fg-muted">Deal team</p>
      {people.map((p) => (
        <EntityCard
          key={p.name}
          variant="compact"
          name={p.name}
          subtitle={p.archived ? `${p.role} · Left the team` : p.role}
          status={p.status}
          archived={p.archived}
          href={`#${p.name}`}
          contact={p.email ? { email: p.email } : undefined}
          selected={p.name === "Ayşe Kaya"}
        />
      ))}
      <EntityCard variant="compact" loading name="Loading" />
    </div>
  );
}
