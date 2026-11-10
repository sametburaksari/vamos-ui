import { Avatar, Switch } from "@vamos-ui/react";

const staff = [
  { name: "Elif Kaya", role: "Head chef", active: true },
  { name: "Mert Demir", role: "Sommelier", active: true },
  { name: "Zeynep Çelik", role: "Front of house", active: false },
  { name: "Can Öztürk", role: "Pastry", active: true },
];

export default function SwitchTable() {
  return (
    <table className="w-full max-w-lg text-sm">
      <thead>
        <tr className="border-b border-field-border text-start text-xs text-fg-muted">
          <th className="py-2 text-start font-medium">Staff member</th>
          <th className="py-2 text-start font-medium">Role</th>
          <th className="py-2 text-end font-medium">Bookable</th>
        </tr>
      </thead>
      <tbody>
        {staff.map((s) => (
          <tr key={s.name} className="border-b border-line last:border-0">
            <td className="py-2.5">
              <span className="flex items-center gap-2.5">
                <Avatar name={s.name} size="sm" />
                {s.name}
              </span>
            </td>
            <td className="py-2.5 text-fg-muted">{s.role}</td>
            <td className="py-2.5 text-end">
              <Switch size="sm" defaultChecked={s.active} aria-label={`${s.name} can be booked`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
