import { Container, Cta, FeatureGrid, Hero } from "@vamos-ui/react/blocks";
import { featureItems, photos } from "./components/content";
import { GroupHeading, VariantLabel } from "./components/variant-label";

const groups = [
  { id: "heroes", title: "Heroes", count: 5 },
  { id: "features", title: "Feature grids", count: 4 },
  { id: "ctas", title: "Calls to action", count: 5 },
];

/**
 * Marketing sections gallery: every Hero, FeatureGrid and Cta variant on one page with
 * realistic content, so you can compare them in the current theme before picking one.
 */
export default function Sections01() {
  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <header className="py-14">
        <Container className="grid gap-6 @4xl:grid-cols-12">
          <div className="@4xl:col-span-7">
            <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">Marketing sections</p>
            <h1 className="mt-3 font-display text-display-l">Every hero, feature grid and call to action</h1>
          </div>
          <nav aria-label="Section groups" className="@4xl:col-span-4 @4xl:col-start-9 @4xl:self-end">
            <ul className="grid gap-1 border-s border-line ps-4 text-small">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="flex justify-between gap-4 rounded-[2px] text-fg-muted hover:text-fg focus-ring">
                    <span>{g.title}</span>
                    <span className="font-mono tabular-nums text-fg-muted">{g.count}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </header>

      <main id="content">
        {/* ------------------------------------------------------------ Heroes */}
        <GroupHeading {...groups[0]!} />

        <VariantLabel id="hero-editorial" block="Hero" variant="editorial" note="Studios, hotels, long-form brands: a huge title over a 21:9 photo strip." />
        <Hero
          headingLevel={3}
          variant="editorial"
          eyebrow="Boutique hotel · Galata"
          title="Six rooms above a *quiet* garden."
          lead="Linen sheets, a deep bath and windows onto the plane tree. Breakfast until eleven."
          actions={[
            { link: { href: "/rooms", label: "See the rooms" }, style: "primary" },
            { link: { href: "/journal", label: "Read the journal" }, style: "link" },
          ]}
          media={photos.hotelRoom}
          meta={[
            { label: "Rooms", value: "6" },
            { label: "Since", value: "1894" },
          ]}
        />

        <VariantLabel id="hero-split-media" block="Hero" variant="split-media" note="Spas and clinics: text beside a 4:5 portrait that bleeds off the edge." />
        <Hero
          headingLevel={3}
          variant="split-media"
          eyebrow="Hammam & spa · Moda"
          title="Warm marble, *quiet* hands."
          lead="A 19th-century hammam restored stone by stone, with six treatment rooms upstairs."
          actions={[
            { link: { href: "/book", label: "Book a treatment" }, style: "primary" },
            { link: { href: "/prices", label: "See prices" }, style: "secondary" },
          ]}
          media={photos.spaStones}
          caption="Treatment room 3, second floor"
        />

        <VariantLabel id="hero-full-bleed" block="Hero" variant="full-bleed" note="Restaurants and venues: a full photo under a scrim, today’s hours in the corner." />
        <Hero
          headingLevel={3}
          variant="full-bleed"
          eyebrow="Meyhane · Caddebostan"
          title="Dinner, *slowly*."
          lead="Twenty-two cold meze and fish from the morning boats."
          actions={[{ link: { href: "/menu", label: "Tonight’s menu" }, style: "link" }]}
          media={photos.diningRoom}
          aside={{ title: "Open today", body: "17:00 – 23:30 · kitchen until 22:45", cta: { link: { href: "/book", label: "Book a table" }, style: "primary" } }}
        />

        <VariantLabel id="hero-product" block="Hero" variant="product" note="SaaS: release chip, two actions and the product cropped by the section edge." />
        <Hero
          headingLevel={3}
          variant="product"
          release={{ tag: "v2.4", label: "November — shared inboxes", href: "/changelog/2-4" }}
          title="Every booking request in *one* inbox."
          lead="WhatsApp, Instagram and your website form, answered by the whole front desk."
          actions={[
            { link: { href: "/signup", label: "Try free for 14 days" }, style: "primary" },
            { link: { href: "/demo", label: "Watch a 3-min demo" }, style: "secondary" },
          ]}
          screenshot={photos.dashboard}
        />

        <VariantLabel id="hero-statement" block="Hero" variant="statement" note="Agencies and consultancies: one centred sentence, services as slash-separated links." />
        <Hero
          headingLevel={3}
          variant="statement"
          eyebrow="Web studio · Kadıköy"
          title="Websites for places people *actually* visit."
          services={[
            { label: "Websites", href: "/services/websites" },
            { label: "Booking systems", href: "/services/booking" },
            { label: "Google Ads", href: "/services/ads" },
            { label: "Photography", href: "/services/photography" },
          ]}
        />

        {/* ------------------------------------------------------------ Feature grids */}
        <GroupHeading {...groups[1]!} />

        <VariantLabel id="features-list" block="FeatureGrid" variant="list" note="Default: two columns of rows with mono index numbers. No cards." />
        <FeatureGrid headingLevel={3} variant="list" eyebrow="Why Relay" title="Small team, *long* list of chores" items={featureItems.map(({ title, text }) => ({ title, text }))} />

        <VariantLabel id="features-grid" block="FeatureGrid" variant="grid" note="3–4 columns with a top rule each and an optional small icon." />
        <FeatureGrid headingLevel={3} variant="grid" columns={4} title="The boring parts, *done*" items={featureItems.map(({ title, text, icon }) => ({ title, text, icon }))} />

        <VariantLabel id="features-tabs" block="FeatureGrid" variant="tabs" note="Feature titles on one side, the selected one’s image on the other." />
        <FeatureGrid headingLevel={3} variant="tabs" eyebrow="Product" title="Built for the *front desk*" items={featureItems.map(({ title, text, media }) => ({ title, text, media }))} />

        <VariantLabel id="features-sticky-media" block="FeatureGrid" variant="sticky-media" note="A sticky image that swaps as the list scrolls (CSS view timelines, no JavaScript)." />
        <FeatureGrid headingLevel={3} variant="sticky-media" eyebrow="Services" title="Four things, done *properly*" items={featureItems.map(({ title, text, media }) => ({ title, text, media }))} />

        {/* ------------------------------------------------------------ CTAs */}
        <GroupHeading {...groups[2]!} />

        <VariantLabel id="cta-band" block="Cta" variant="band" note="A full-width accent band with a phone line — the end of a landing page." />
        <Cta
          headingLevel={3}
          variant="band"
          theme={{ surface: "accent" }}
          title="Answer tonight’s messages from *one* place"
          actions={[
            { link: { href: "/signup", label: "Try free for 14 days" }, style: "primary" },
            { link: { href: "/demo", label: "Book a demo" }, style: "secondary" },
          ]}
          contact={{ phone: "+902168072907", whatsapp: "+902168072907" }}
          fineprint="No card needed. Cancel any time."
        />

        <VariantLabel id="cta-split" block="Cta" variant="split" note="Title and action beside a cropped photo." />
        <Cta
          headingLevel={3}
          variant="split"
          eyebrow="Private dining"
          title="The room upstairs seats *twelve*."
          lead="Set menus from ₺2,400 per person, wine pairing on request."
          actions={[{ link: { href: "/private-dining", label: "Ask for a date" }, style: "primary" }]}
          media={photos.mezeTable}
        />

        <VariantLabel id="cta-minimal" block="Cta" variant="minimal" note="No background: a very large title and one huge underlined link." />
        <Cta headingLevel={3} variant="minimal" eyebrow="Taking new projects from January" title="Tell us about your *place*." actions={[{ link: { href: "mailto:hello@odastudio.example", label: "hello@odastudio.example" }, style: "link" }]} />

        <VariantLabel id="cta-newsletter" block="Cta" variant="newsletter" note="Email field and button with the consent line under it." />
        <Cta
          headingLevel={3}
          variant="newsletter"
          theme={{ surface: "surface-2" }}
          title="One email when the *menu* changes"
          lead="Four times a year, with the new dishes and the dates the terrace opens."
          newsletter={{ action: "/api/newsletter", consent: "We use your email only for this newsletter. Unsubscribe from any issue. See our privacy notice." }}
        />

        <VariantLabel id="cta-booking" block="Cta" variant="booking" note="Date · time · guests bar that opens a prefilled WhatsApp message." />
        <Cta
          headingLevel={3}
          variant="booking"
          theme={{ rhythm: "tight" }}
          eyebrow="Tuesday to Sunday"
          title="Reserve a table"
          booking={{
            provider: "whatsapp",
            whatsapp: "+905321234567",
            fields: ["date", "time", "guests"],
            times: ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"],
            maxGuests: 10,
            closedDays: ["mon"],
            timeZone: "Europe/Istanbul",
          }}
          fineprint="Groups of eleven or more: call 0216 358 11 44."
        />
      </main>
    </div>
  );
}
