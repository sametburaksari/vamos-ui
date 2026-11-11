import { CountUp } from "@vamos-ui/react/motion";
import { Replay } from "./_replay";

const locales = [
  { code: "en-US", label: "English (US)" },
  { code: "tr-TR", label: "Türkçe" },
];

// Formatting goes through Intl for the locale: 1,240 vs 1.240, 4.8 vs 4,8, € before or after.
// A hidden copy of the final value reserves the width, so the numbers never push their
// neighbours around; screen readers only ever hear the final figure.
export default function MotionCountUp() {
  return (
    <Replay>
      <div className="grid w-full gap-px overflow-hidden rounded-ui border border-line bg-line pt-0 sm:grid-cols-2">
        {locales.map((l) => (
          <dl key={l.code} lang={l.code} className="flex flex-col gap-5 bg-surface p-6">
            <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{l.label}</p>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-small text-fg-muted">Reviews</dt>
              <dd className="font-display text-h3 text-fg">
                <CountUp value={1240} locale={l.code} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-small text-fg-muted">Average rating</dt>
              <dd className="font-display text-h3 text-fg">
                <CountUp value={4.8} locale={l.code} />
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-small text-fg-muted">Revenue, October</dt>
              <dd className="font-display text-h3 text-fg">
                <CountUp value={48250.5} locale={l.code} format={{ style: "currency", currency: "EUR" }} duration={1800} />
              </dd>
            </div>
          </dl>
        ))}
      </div>
    </Replay>
  );
}
