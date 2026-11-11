"use client";

import * as React from "react";
import { Truck, Wrench } from "lucide-react";
import { Badge, PinMap, type MapPin, type MapPinTone } from "@vamos-ui/react";

type Status = "Unassigned" | "En route" | "On site" | "Delayed";
const jobs: Array<{ id: string; title: string; district: string; lat: number; lng: number; status: Status; tech?: string; eta?: string }> = [
  { id: "jb-1", title: "Install pendant lights", district: "Şişli", lat: 41.06, lng: 28.987, status: "On site", tech: "Malik Osei" },
  { id: "jb-2", title: "Measure for curtains", district: "Üsküdar", lat: 41.023, lng: 29.015, status: "En route", tech: "Selin Öztürk", eta: "10:38" },
  { id: "jb-3", title: "Replace damaged mirror", district: "Beylikdüzü", lat: 40.99, lng: 28.64, status: "Delayed", tech: "Baran Çelik", eta: "11:12" },
  { id: "jb-4", title: "Assemble shelving", district: "Maltepe", lat: 40.935, lng: 29.13, status: "Unassigned" },
];
const tone: Record<Status, MapPinTone> = { Unassigned: "neutral", "En route": "info", "On site": "success", Delayed: "warning" };

export default function PinMapDispatch() {
  const [selected, setSelected] = React.useState<string | null>("jb-2");
  const pins: MapPin[] = jobs.map((j) => ({
    id: j.id,
    lat: j.lat,
    lng: j.lng,
    label: `${j.title}, ${j.district}`,
    description: j.tech ? `${j.tech} · ${j.status}${j.eta ? ` · ETA ${j.eta}` : ""}` : "Not assigned yet",
    tone: tone[j.status],
    pulse: j.status === "En route",
    icon: j.status === "En route" ? <Truck /> : <Wrench />,
  }));
  return (
    <div className="grid w-full max-w-3xl gap-3 md:grid-cols-[1fr_15rem]">
      <PinMap aria-label="Today's field jobs" pins={pins} selectedId={selected} onSelectedIdChange={setSelected} aspectRatio={4 / 3} />
      <ul className="grid content-start gap-1" aria-label="Jobs">
        {jobs.map((j) => (
          <li key={j.id}>
            <button
              type="button"
              aria-pressed={selected === j.id}
              onClick={() => setSelected(selected === j.id ? null : j.id)}
              className="grid w-full gap-1 rounded-ui px-3 py-2 text-start text-[13px] hover:bg-hover aria-pressed:bg-selected focus-ring"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-fg">{j.title}</span>
                <Badge tone={j.status === "Delayed" ? "warning" : j.status === "On site" ? "success" : j.status === "En route" ? "info" : "neutral"}>{j.status}</Badge>
              </span>
              <span className="text-xs text-fg-muted">
                {j.district}
                {j.tech ? ` · ${j.tech}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
