import { Cta } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Booking bar → prefilled WhatsApp: "Hi, I'd like to book for 4 guests on Fri, November 14 at
// 8:00 PM." Native date/select fields, past dates disabled, closed days refused (Mondays here).
export default function CtaBookingWhatsapp() {
  return (
    <SiteFrame>
      <Cta
        variant="booking"
        theme={{ rhythm: "tight" }}
        eyebrow="Tuesday to Sunday"
        title="Reserve a table"
        booking={{
          provider: "whatsapp",
          whatsapp: "+905321234567",
          fields: ["date", "time", "guests"],
          times: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
          maxGuests: 10,
          closedDays: ["mon"],
          timeZone: "Europe/Istanbul",
        }}
        fineprint="Groups of eleven or more: call 0216 000 00 00."
      />
    </SiteFrame>
  );
}
