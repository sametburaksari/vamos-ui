"use client";

import * as React from "react";
import { CalendarClock, CircleDollarSign, Search, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Field,
  Input,
  Progress,
  RadioGroup,
  Select,
  Stat,
  StatGroup,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  ThemeScope,
} from "@vamos-ui/react";
import { Hero } from "@vamos-ui/react/blocks";
import { describePreset, generateAccent, isNamedAccent, RADIUS, type Preset } from "@/lib/theme-codec";

/** Scope attributes + inline variables for the preview (a custom accent or radius has no kit CSS). */
export function previewScope(preset: Preset): { accent: string; style: React.CSSProperties } {
  const style: Record<string, string> = {};
  let accent: string = preset.accent;
  if (!isNamedAccent(preset.accent)) {
    accent = "brand";
    const p = generateAccent(preset.accent);
    const dark = preset.theme === "dark" && p.dark;
    style["--accent-base"] = dark ? p.dark!.base : p.base;
    style["--accent-fg"] = dark ? p.dark!.fg : p.fg;
    style["--accent-ink-light"] = p.inkLight;
    style["--accent-ink-dark"] = p.inkDark;
  }
  if (preset.radius !== "default") style["--radius"] = RADIUS[preset.radius][preset.density];
  return { accent, style: style as React.CSSProperties };
}

const deals = [
  { company: "Kadıköy Bistro", owner: "Selin Demir", stage: "Proposal", tone: "info", value: 18400 },
  { company: "Moda Dental", owner: "Omar Haddad", stage: "Won", tone: "success", value: 9200 },
  { company: "Bosphorus Rowing", owner: "Elif Kaya", stage: "Negotiation", tone: "warning", value: 26750 },
  { company: "Tarlabaşı Print Co.", owner: "Jonas Weber", stage: "Lost", tone: "danger", value: 4300 },
] as const;

const usd = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 font-mono text-[10.5px] tracking-[0.12em] text-fg-subtle uppercase">{children}</div>;
}

export function ThemePreview({ preset }: { preset: Preset }) {
  const { accent, style } = previewScope(preset);
  return (
    <section aria-label="Live preview" className="min-w-0">
      {/* Material on a wrapper, theme on the scope: the kit's "[data-material=glass] .light" and
          ".dark" rules then win over the page's own theme (a light glass preview on a dark page). */}
      <div data-material={preset.material} data-testid="theme-preview-material" className="rounded-ui-lg">
      <ThemeScope
        theme={preset.theme}
        accent={accent}
        density={preset.density}
        font={preset.font}
        style={style}
        data-testid="theme-preview"
        className="preview-stage relative overflow-hidden rounded-ui-lg border border-line bg-scene font-sans text-fg"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line bg-bar px-4 py-2.5">
          <span className="truncate font-mono text-[11px] text-fg-muted">{describePreset(preset)}</span>
          <Badge tone="success" dot>
            Live
          </Badge>
        </div>

        <div className="grid gap-(--gap) p-4 sm:p-6 [container-type:inline-size]">
          {/* Dashboard card row */}
          <div>
            <Label>Dashboard</Label>
            <StatGroup columns={3}>
              <Stat icon={CircleDollarSign} label="Won this month" value={124000} format={{ type: "currency", currency: "USD", options: { maximumFractionDigits: 0 } }} delta={0.182} trend={[62, 70, 68, 81, 90, 99, 124]} trendVariant="area" />
              <Stat icon={Users} label="Active clients" value={318} delta={0.041} trend={[290, 294, 301, 299, 306, 312, 318]} />
              <Stat icon={CalendarClock} label="Avg. reply time" value="2h 14m" delta={-0.12} intent="lower-is-better" />
            </StatGroup>
          </div>

          <div className="grid gap-(--gap) @[44rem]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Form */}
            <div className="min-w-0">
              <Label>Form</Label>
              <Card>
                <CardHeader title="New booking" description="Saltwater Spa · Moda" divider />
                <CardBody className="grid gap-3.5">
                  <Field label="Guest name">
                    <Input defaultValue="Ayşe Yılmaz" />
                  </Field>
                  <Field label="Treatment">
                    <Select
                      defaultValue="hammam"
                      items={[
                        { value: "hammam", label: "Hammam ritual · 90 min" },
                        { value: "massage", label: "Deep tissue · 60 min" },
                        { value: "facial", label: "Facial · 45 min" },
                      ]}
                    />
                  </Field>
                  <Field label="Room">
                    <RadioGroup
                      variant="segmented"
                      size="sm"
                      defaultValue="single"
                      items={[
                        { value: "single", label: "Single" },
                        { value: "couple", label: "Couple" },
                      ]}
                    />
                  </Field>
                  <Switch label="Send SMS reminder" defaultChecked />
                  <Checkbox label="Guest accepted the house rules" defaultChecked />
                </CardBody>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm">
                    Confirm booking
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Table */}
            <div className="min-w-0">
              <Label>Table</Label>
              <Card className="overflow-hidden">
                <CardHeader
                  title="Open deals"
                  action={
                    <Button size="sm" variant="secondary">
                      <Search /> Filter
                    </Button>
                  }
                />
                <div className="px-4 pb-3">
                  <Tabs defaultValue="all">
                    <TabsList aria-label="Deal filter">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="mine">Mine</TabsTrigger>
                      <TabsTrigger value="closing">Closing soon</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <TableContainer aria-label="Open deals">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead numeric>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map((d) => (
                        <TableRow key={d.company}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={d.owner} size="sm" />
                              <div className="min-w-0">
                                <div className="truncate font-medium">{d.company}</div>
                                <div className="truncate text-xs text-fg-subtle">{d.owner}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge tone={d.tone} dot>
                              {d.stage}
                            </Badge>
                          </TableCell>
                          <TableCell numeric>{usd(d.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div className="border-t border-line px-4 py-3">
                  <Progress label="Quarter target" value={68} showValue size="xs" />
                </div>
              </Card>
            </div>
          </div>

          {/* Site hero */}
          <div className="min-w-0">
            <Label>Website hero</Label>
            <div className="overflow-hidden rounded-ui-lg border border-line [--section-y:clamp(2.5rem,1.5rem+4cqi,4.5rem)] [container-type:inline-size]">
              <Hero
                variant="statement"
                headingLevel={3}
                eyebrow="Ceramics studio · Karaköy"
                title="Plates that *outlive* the restaurant."
                lead="Hand-thrown tableware for kitchens that serve two hundred covers a night."
                services={[
                  { label: "Restaurants", href: "#restaurants" },
                  { label: "Hotels", href: "#hotels" },
                  { label: "Workshops", href: "#workshops" },
                ]}
                actions={[
                  { link: { href: "#order", label: "Request a sample set" }, style: "primary" },
                  { link: { href: "#work", label: "See the work" }, style: "secondary" },
                ]}
              />
            </div>
          </div>
        </div>
      </ThemeScope>
      </div>
    </section>
  );
}
