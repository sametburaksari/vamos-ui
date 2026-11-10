import { Avatar, AvatarGroup, Badge } from "@vamos-cms/ui";

const contacts = [
  { name: "Lumen Architects", person: "Hannah Okafor", deal: "$48,000", stage: "Proposal", owners: ["Elif Kaya", "Mert Demir"] },
  { name: "Bosphorus Dental", person: "Dr. Kerem Aksoy", deal: "$12,600", stage: "Negotiation", owners: ["Zeynep Çelik"] },
  { name: "Northwind Traders", person: "Laura Chen", deal: "$96,400", stage: "Qualified", owners: ["Can Öztürk", "Elif Kaya", "Mert Demir", "Zeynep Çelik"] },
];

export default function AvatarContactList() {
  return (
    <ul className="grid w-full max-w-xl divide-y divide-line rounded-ui border border-line">
      {contacts.map((c) => (
        <li key={c.name} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={c.name} shape="square" size="lg" />
          <div className="grid min-w-0 flex-1">
            <span className="truncate text-sm font-medium">{c.name}</span>
            <span className="truncate text-xs text-fg-subtle">
              {c.person} · <span className="tabular">{c.deal}</span>
            </span>
          </div>
          <Badge tone="outline">{c.stage}</Badge>
          <AvatarGroup max={2} size="sm" aria-label={`Owners of ${c.name}`}>
            {c.owners.map((o) => (
              <Avatar key={o} name={o} />
            ))}
          </AvatarGroup>
        </li>
      ))}
    </ul>
  );
}
