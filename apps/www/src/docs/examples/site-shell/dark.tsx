import { Cta, SiteShell } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// A very dark brand colour on a dark site: the shell derives a lighter dark-mode fill so the
// button stays visible, and keeps the brand colour for light sections inside.
export default function SiteShellDark() {
  return (
    <SiteFrame>
      <SiteShell accent="#0B2A17" theme="dark" font="corporate" material="solid" density="compact" routing="memory" className="bg-scene">
        <Cta
          variant="band"
          eyebrow="Quarterly review"
          title="Your numbers, *closed* by the 5th"
          actions={[
            { link: { href: "#contact", label: "Book a call" }, style: "primary" },
            { link: { href: "#fees", label: "See fees" }, style: "secondary" },
          ]}
          fineprint="Fixed monthly fee. No hourly billing."
        />
        <Cta
          variant="band"
          theme={{ mode: "light" }}
          title="Light section, *brand* fill"
          actions={[{ link: { href: "#contact", label: "Book a call" }, style: "primary" }]}
        />
      </SiteShell>
    </SiteFrame>
  );
}
