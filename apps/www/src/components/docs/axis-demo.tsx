"use client";

import { Badge, Button, Card, CardBody, CardHeader, Input, cn } from "@vamos-cms/ui";

type Axis = "theme" | "material" | "accent" | "density" | "font";

const values: Record<Axis, { label: string; props: Record<string, string> }[]> = {
  theme: [
    { label: "light", props: { className: "light" } },
    { label: "dark", props: { className: "dark" } },
  ],
  material: [
    { label: "solid", props: { "data-material": "solid" } },
    { label: "glass", props: { "data-material": "glass" } },
  ],
  accent: ["lime", "ocean", "ember", "rose", "graphite"].map((a) => ({ label: a, props: { "data-accent": a } })),
  density: [
    { label: "comfortable", props: { "data-density": "comfortable" } },
    { label: "compact", props: { "data-density": "compact" } },
  ],
  font: ["editorial", "grotesk", "corporate", "system"].map((f) => ({ label: f, props: { "data-font": f } })),
};

function Mini() {
  return (
    <Card className="w-full">
      <CardHeader title={<span className="font-display text-[length:calc(22px*var(--display-scale))]">Q4 <em>plan</em></span>} action={<Badge tone="success" dot>Live</Badge>} />
      <CardBody className="grid gap-2.5">
        <Input placeholder="Search…" />
        <div className="flex gap-2">
          <Button variant="primary" size="sm">Save</Button>
          <Button size="sm">Cancel</Button>
        </div>
      </CardBody>
    </Card>
  );
}

/** Renders the same mini UI once per value of one axis, using subtree attributes only. */
export function AxisDemo({ axis }: { axis: Axis }) {
  const list = values[axis];
  return (
    <div className={cn("grid gap-3", list.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2")}>
      {list.map((v) => {
        const { className, ...data } = v.props;
        return (
          <div key={v.label} className="grid gap-1.5">
            <code className="font-mono text-[11.5px] text-fg-subtle">{axis === "theme" ? `class="${className}"` : `${Object.keys(data)[0]}="${v.label}"`}</code>
            <div
              {...data}
              className={cn("preview-stage relative overflow-hidden rounded-ui-lg border border-line bg-scene p-4 text-fg", className)}
            >
              <Mini />
            </div>
          </div>
        );
      })}
    </div>
  );
}
