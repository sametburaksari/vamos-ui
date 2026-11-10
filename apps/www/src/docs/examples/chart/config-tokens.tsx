import { ThemeScope } from "@vamos-cms/ui";
import { AreaChart } from "@vamos-cms/ui/charts";

const signups = [
  { week: "W40", signups: 182, trials: 96 },
  { week: "W41", signups: 214, trials: 120 },
  { week: "W42", signups: 198, trials: 131 },
  { week: "W43", signups: 263, trials: 148 },
  { week: "W44", signups: 241, trials: 162 },
  { week: "W45", signups: 298, trials: 177 },
];

const scopes = [
  { accent: "lime", material: "solid" },
  { accent: "ocean", material: "glass" },
  { accent: "ember", material: "solid" },
  { accent: "rose", material: "glass" },
  { accent: "graphite", material: "solid" },
] as const;

export default function ChartConfigTokens() {
  // Series name a token ("chart-1", "chart-3"…), never a hex value — every subtree re-colours itself.
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {scopes.map((s) => (
        <ThemeScope key={s.accent} accent={s.accent} material={s.material} className="surface rounded-ui-lg p-4">
          <p className="mb-2 font-mono text-[11px] text-fg-subtle">
            {s.accent} · {s.material}
          </p>
          <AreaChart
            title={`Sign-ups, ${s.accent}`}
            data={signups}
            x="week"
            height="sm"
            legend="none"
            config={{ signups: { label: "Sign-ups", color: "chart-1" }, trials: { label: "Trials", color: "chart-3" } }}
          />
        </ThemeScope>
      ))}
    </div>
  );
}
