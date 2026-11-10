import { Hero } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const threads = [
  { name: "Elif Kaya", channel: "WhatsApp", text: "Table for 4 on Friday at 20:30?", time: "2m", unread: true },
  { name: "Can Demir", channel: "Instagram", text: "Do you have a vegan menu?", time: "14m", unread: true },
  { name: "Website form", channel: "Form", text: "Birthday dinner, 12 people, 21 Nov", time: "1h" },
  { name: "Zeynep Aydın", channel: "WhatsApp", text: "Thank you, see you tonight!", time: "3h" },
];

// SaaS: release chip, title, two actions; the product itself below without a device frame,
// cropped by the section's bottom edge. Pass `screenshot` (an image) or `visual` (live JSX).
export default function HeroProductSaas() {
  return (
    <SiteFrame>
      <Hero
        variant="product"
        release={{ tag: "v2.4", label: "November — shared inboxes", href: "/changelog/2-4" }}
        title="Every booking request in *one* inbox."
        lead="WhatsApp, Instagram and your website form, answered by the whole front desk. Set up in an afternoon."
        actions={[
          { link: { href: "/signup", label: "Try free for 14 days" }, style: "primary" },
          { link: { href: "/demo", label: "Watch a 3-min demo" }, style: "secondary" },
        ]}
        meta={[
          { label: "Teams", value: "1,900+" },
          { label: "Median reply", value: "11 min" },
        ]}
        visual={
          <div className="grid h-[34rem] grid-cols-[17rem_1fr] bg-scene text-small">
            <ul className="flex flex-col border-e border-line">
              {threads.map((t, i) => (
                <li key={t.name} className={`flex flex-col gap-1 border-b border-line px-4 py-3 ${i === 0 ? "bg-selected" : ""}`}>
                  <span className="flex items-center justify-between">
                    <span className={t.unread ? "font-semibold text-fg" : "text-fg"}>{t.name}</span>
                    <span className="font-mono text-[11px] text-fg-subtle">{t.time}</span>
                  </span>
                  <span className="truncate text-fg-muted">{t.text}</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">{t.channel}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-subtle">Elif Kaya · WhatsApp</p>
              <p className="w-fit max-w-sm rounded-ui bg-surface-2 px-4 py-2.5 text-fg">Hi! Table for 4 on Friday at 20:30? One of us is vegetarian.</p>
              <p className="ms-auto w-fit max-w-sm rounded-ui bg-accent-soft px-4 py-2.5 text-fg">Of course — Friday 20:30 for four, by the window. Our meze are mostly vegetarian.</p>
              <p className="ms-auto font-mono text-[11px] text-fg-subtle">Sent by Deniz · booking created</p>
            </div>
          </div>
        }
      />
    </SiteFrame>
  );
}
