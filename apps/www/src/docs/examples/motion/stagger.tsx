import { Stagger } from "@vamos-ui/react/motion";
import { Replay } from "./_replay";

const followUps = [
  { name: "Defne Arslan", company: "Kestrel Bakery", due: "09:30", value: "€4,200" },
  { name: "Marcus Hale", company: "Harbor & Pine Hotels", due: "11:00", value: "€18,750" },
  { name: "Ines Okafor", company: "Sable Dental Clinic", due: "13:15", value: "€2,980" },
  { name: "Tomas Brandt", company: "Northwind Studio", due: "15:40", value: "€9,600" },
  { name: "Yuki Morita", company: "Quarry Lane Coffee", due: "17:00", value: "€1,450" },
];

// Rows arrive one after another, 70 ms apart. `asChild` keeps the <ul>, so the list is still a
// list for screen readers; past the 12th child every row shares the last slot.
export default function MotionStagger() {
  return (
    <Replay>
      <div className="w-full pt-10">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h3 className="text-body font-semibold text-fg">Today’s follow-ups</h3>
          <span className="font-mono text-small tabular text-fg-muted">5 deals · €36,980</span>
        </div>
        <Stagger asChild step={70} effect="rise">
          <ul aria-label="Today’s follow-ups">
            {followUps.map((f) => (
              <li key={f.name} className="grid grid-cols-[4rem_1fr_auto] items-baseline gap-4 border-b border-line py-3.5">
                <span className="font-mono text-small tabular text-fg-subtle">{f.due}</span>
                <span className="min-w-0">
                  <span className="block truncate text-body text-fg">{f.name}</span>
                  <span className="block truncate text-small text-fg-muted">{f.company}</span>
                </span>
                <span className="font-mono text-small tabular text-fg">{f.value}</span>
              </li>
            ))}
          </ul>
        </Stagger>
      </div>
    </Replay>
  );
}
