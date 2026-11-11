import { CountUp, Stagger, TextReveal, Ticker } from "@vamos-ui/react/motion";
import { Replay } from "./_replay";

const routes = ["Harbour Quay → North Pier", "Eastbank → Isle of Wren", "North Pier → Saltmarsh", "Isle of Wren → Harbour Quay", "Saltmarsh → Eastbank"];

// The motion kit on one panel: a heading that rises word by word, figures that count up in
// sequence, and a route ticker. Everything settles to plain, readable content.
export default function MotionDemo() {
  return (
    <Replay>
      <section className="w-full overflow-hidden rounded-ui-lg border border-line bg-surface">
        <div className="flex flex-col gap-8 p-[clamp(1.25rem,4vw,2.5rem)]">
          <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">Saltmarsh Ferries · Winter timetable</p>
          <TextReveal as="h2" className="max-w-[24ch] font-display text-display-m text-fg text-balance">
            Forty-one crossings a day, and the 07:40 still leaves on the minute.
          </TextReveal>
          <Stagger asChild delay={250}>
            <dl className="grid grid-cols-1 border-t border-line sm:grid-cols-3">
              <div className="flex flex-col gap-1 border-b border-line py-5 sm:border-e sm:border-b-0 sm:pe-6">
                <dt className="order-2 text-small text-fg-muted">Daily crossings</dt>
                <dd className="order-1 font-display text-display-m text-fg">
                  <CountUp value={41} />
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-b border-line py-5 sm:border-e sm:border-b-0 sm:px-6">
                <dt className="order-2 text-small text-fg-muted">On time since March</dt>
                <dd className="order-1 font-display text-display-m text-fg">
                  <CountUp value={98.6} />
                  <span className="ms-0.5 align-super font-sans text-[0.4em] text-fg-muted">%</span>
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-5 sm:ps-6">
                <dt className="order-2 text-small text-fg-muted">Passengers a week</dt>
                <dd className="order-1 font-display text-display-m text-fg">
                  <CountUp value={12480} />
                </dd>
              </div>
            </dl>
          </Stagger>
        </div>
        <Ticker as="ul" duration={36} className="border-t border-line py-4" aria-label="Routes">
          {routes.map((r) => (
            <li key={r} className="whitespace-nowrap font-mono text-small text-fg-muted">
              {r}
            </li>
          ))}
        </Ticker>
      </section>
    </Replay>
  );
}
