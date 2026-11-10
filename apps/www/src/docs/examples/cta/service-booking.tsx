import { Cta } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Spa booking with a service picker, sent as query params to the booking page (GET, no JS needed).
export default function CtaServiceBooking() {
  return (
    <SiteFrame>
      <Cta
        variant="booking"
        theme={{ surface: "surface-2", rhythm: "tight" }}
        title="Find a time"
        booking={{
          provider: "url",
          url: "https://hamam-moda.example/book",
          fields: ["service", "date", "time"],
          services: ["Hammam ritual · 75 min", "Deep tissue massage · 60 min", "Peony facial · 50 min"],
          timeZone: "Europe/Istanbul",
        }}
      />
    </SiteFrame>
  );
}
