import { Hero } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const presets = ["editorial", "grotesk", "corporate", "system"] as const;

// One hero in the four font presets: italic serif emphasis in editorial, accent ink in the sans
// presets; display sizes shrink with each preset's --display-scale.
export default function HeroFontPresets() {
  return (
    <div className="grid w-full gap-4">
      {presets.map((font) => (
        <SiteFrame key={font}>
          <div data-font={font}>
            <Hero
              headingLevel={2}
              theme={{ rhythm: "tight" }}
              eyebrow={`data-font="${font}"`}
              title="Fish from the *morning* boats."
              lead="Twenty-two cold meze, a raki list that runs to the back page, and a table by the water from 6 pm."
              actions={[{ link: { href: "/reservations", label: "Book a table" }, style: "link" }]}
            />
          </div>
        </SiteFrame>
      ))}
    </div>
  );
}
