import { ContactDock } from "@vamos-ui/react/blocks";
import { spaHours } from "../_site-2/data";

// Fab with off-hours label: outside opening hours (computed in Europe/Istanbul on the client)
// a note says when you'll hear back. `now` pins the preview to 07:30.
export default function ContactDockFab() {
  return (
    <div className="flex w-full max-w-md justify-end rounded-ui border border-line bg-surface-2 p-6">
      <ContactDock
        variant="fab"
        contained
        whatsapp="+902163380011"
        message="Merhaba, randevu almak istiyorum."
        label="WhatsApp’tan yazın"
        hours={spaHours}
        offHours="label"
        now="2026-11-10T07:30:00+03:00"
      />
    </div>
  );
}
