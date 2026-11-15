import { Badge, Progress } from "@vamos-ui/react";

/** Small app screens made of kit components (they re-theme with the page). Shared by the examples. */
export function TodayScreen() {
  const tasks = [
    { title: "Water the herbs", time: "08:00", done: true },
    { title: "Call the plumber", time: "11:30", done: false },
    { title: "Pick up the parcel", time: "17:00", done: false },
  ];
  return (
    <div className="flex flex-1 flex-col gap-5 px-6 pt-4 pb-8">
      <div>
        <p className="m-0 text-small text-fg-muted">Tuesday</p>
        <h3 className="m-0 text-h3 font-semibold text-fg">Today</h3>
      </div>
      <div className="rounded-ui border border-line bg-surface p-4">
        <p className="m-0 mb-2 text-small text-fg-muted">1 of 3 done</p>
        <Progress value={33} aria-label="Tasks done" />
      </div>
      <ul className="m-0 grid list-none gap-2 p-0">
        {tasks.map((t) => (
          <li key={t.title} className="flex items-center justify-between rounded-ui border border-line bg-surface px-4 py-3">
            <span className={t.done ? "text-fg-muted line-through" : "text-fg"}>{t.title}</span>
            <Badge tone={t.done ? "success" : "neutral"}>{t.time}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlanScreen() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-8">
      <h3 className="m-0 text-h3 font-semibold text-fg">Plan the week</h3>
      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d, i) => (
        <div key={d} className="flex items-center gap-3">
          <span className="w-10 text-small text-fg-muted">{d}</span>
          <span className="h-3 rounded-full bg-accent" style={{ width: `${30 + ((i * 17) % 60)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function ShareScreen() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-8">
      <h3 className="m-0 text-h3 font-semibold text-fg">Share a list</h3>
      {["Household", "Garden", "Trip"].map((l, i) => (
        <div key={l} className="flex items-center justify-between rounded-ui border border-line bg-surface px-4 py-3">
          <span className="text-fg">{l}</span>
          <span className="text-small text-fg-muted">{i + 2} people</span>
        </div>
      ))}
    </div>
  );
}
