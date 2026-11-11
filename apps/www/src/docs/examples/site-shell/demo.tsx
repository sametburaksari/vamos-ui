import { Footer, Hero, Navbar, PageIntro, SiteShell, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// A two-page site with its own look: one colour → the accent, editorial type, solid surfaces.
// routing="memory" keeps this docs page's URL; a real site leaves the default (?page=…).
export default function SiteShellDemo() {
  return (
    <SiteFrame>
      <SiteShell accent="#B4532A" font="editorial" material="solid" pages={["home", "workshops"]} routing="memory" className="bg-scene">
        <Navbar
          wordmark="Paperline Press"
          homeHref={sitePageHref("home")}
          items={[
            { label: "Studio", href: sitePageHref("home") },
            { label: "Workshops", href: sitePageHref("workshops") },
          ]}
          actions={[{ link: { href: sitePageHref("workshops"), label: "Book a seat" }, style: "primary" }]}
        />
        <main id="content">
          <SiteShellPage id="home">
            <Hero
              variant="statement"
              eyebrow="Letterpress studio · Kadıköy"
              title="Ink you can *feel* with a fingertip."
              lead="Wedding suites, business cards and small editions, set by hand on two 1960s Heidelberg presses."
              actions={[
                { link: { href: sitePageHref("workshops"), label: "See workshops" }, style: "primary" },
                { link: { href: "mailto:studio@example.com", label: "Ask for a quote" }, style: "secondary" },
              ]}
            />
          </SiteShellPage>
          <SiteShellPage id="workshops">
            <PageIntro
              variant="ruled"
              breadcrumb={[{ label: "Studio", href: sitePageHref("home") }, { label: "Workshops" }]}
              title="Saturday *workshops*"
              lead="Four people, one press, three hours. You leave with forty cards you set yourself."
              meta={[
                { label: "Next date", value: "Sat 6 December" },
                { label: "Seats", value: "4 per session" },
              ]}
            />
          </SiteShellPage>
        </main>
        <Footer brand={{ name: "Paperline Press", href: sitePageHref("home") }} contact={{ email: "studio@example.com", phone: "+902160000000" }} year={2026} />
      </SiteShell>
    </SiteFrame>
  );
}
