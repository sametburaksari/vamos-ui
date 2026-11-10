import { ContactDock } from "@vamos-cms/ui/blocks";

// Both: a WhatsApp button (desktop) and a bottom action bar (phones). `contained` shows both
// inside this preview; on a site they're fixed and switch at 48rem.
export default function ContactDockDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-ui border border-line bg-surface-2 p-6">
      <ContactDock
        contained
        whatsapp="+902168072907"
        message="Hi, I’d like to book a table for Friday evening."
        phone="+902168072907"
        directionsHref="https://maps.app.goo.gl/kiyimeyhane"
        bookingHref="/reservations"
      />
    </div>
  );
}
