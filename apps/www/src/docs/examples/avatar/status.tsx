import { Avatar } from "@vamos-ui/react";

const team = [
  { name: "Elif Kaya", status: "online" },
  { name: "Mert Demir", status: "away" },
  { name: "Zeynep Çelik", status: "busy", statusLabel: "In a meeting until 15:30" },
  { name: "Can Öztürk", status: "offline" },
] as const;

export default function AvatarStatus() {
  return (
    <ul className="grid gap-3">
      {team.map((p) => (
        <li key={p.name} className="flex items-center gap-3">
          <Avatar name={p.name} status={p.status} statusLabel={"statusLabel" in p ? p.statusLabel : undefined} />
          <div className="grid">
            <span className="text-sm">{p.name}</span>
            <span className="text-xs text-fg-subtle">{"statusLabel" in p ? p.statusLabel : p.status === "online" ? "Online" : p.status === "away" ? "Away · 12 min" : "Last seen yesterday"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
