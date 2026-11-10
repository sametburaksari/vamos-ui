import { ContactDock } from "@vamos-cms/ui/blocks";

// Bar: 2–4 equal actions with icon + short label; every link carries data-track for analytics.
export default function ContactDockBarRestaurant() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-ui border border-line">
      <div className="h-40 bg-surface-2" aria-hidden />
      <ContactDock variant="bar" contained phone="+902168072907" whatsapp="+902168072907" directionsHref="https://maps.app.goo.gl/kiyimeyhane" bookingHref="/reservations" actions={["call", "directions", "booking", "whatsapp"]} />
    </div>
  );
}
