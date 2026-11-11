import { Ticker } from "@vamos-ui/react/motion";

const studios = ["Kestrel Bakery", "Harbor & Pine", "Northwind Studio", "Sable Clinic", "Quarry Lane Coffee", "Wren Island Ferries", "Atlas Bindery"];
const services = ["Websites", "Booking", "Menus", "Reviews", "Payments", "Newsletters"];

// Pure CSS, renders on the server. The copy that closes the loop is aria-hidden and inert, so
// links are met once by keyboard and screen reader. It pauses on hover and focus, and the small
// round control pauses it for good (moving content longer than 5 s needs one — WCAG 2.2.2).
// Under reduced motion or data-motion="off" it turns into a static, wrapped row.
export default function MotionTicker() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Ticker as="ul" duration={42} aria-label="Clients">
        {studios.map((s) => (
          <li key={s} className="whitespace-nowrap font-display text-h3 text-fg">
            {s}
          </li>
        ))}
      </Ticker>
      <Ticker as="ul" duration={28} direction="end" gap="1.5rem" aria-label="Services">
        {services.map((s) => (
          <li key={s} className="flex items-center gap-6 whitespace-nowrap font-mono text-small uppercase tracking-[0.08em] text-fg-muted">
            {s}
            <span aria-hidden className="size-1 rounded-full bg-fg-subtle" />
          </li>
        ))}
      </Ticker>
    </div>
  );
}
