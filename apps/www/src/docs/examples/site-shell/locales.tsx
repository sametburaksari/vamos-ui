import { Navbar, PageIntro, SiteShell, SiteShellLocale, siteLocaleHref } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const locales = [
  { code: "en", href: siteLocaleHref("en") },
  { code: "tr", href: siteLocaleHref("tr") },
];

// Both languages are rendered on the server; the navbar's EN / TR links swap them in place
// (each version gets its own lang attribute). On a real site: ?lang=tr, or route per locale.
export default function SiteShellLocales() {
  return (
    <SiteFrame>
      <SiteShell accent="#0F766E" font="corporate" material="solid" routing="memory" className="bg-scene">
        <SiteShellLocale code="en">
          <Navbar wordmark="Northline Family Clinic" items={[{ label: "Doctors", href: "/doctors" }]} locales={locales} locale="en-US" />
          <PageIntro title="Book an *appointment*" lead="General practice for the whole family. Same-week appointments, Monday to Saturday." />
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <Navbar wordmark="Northline Aile Kliniği" items={[{ label: "Doktorlar", href: "/doctors" }]} locales={locales} locale="tr-TR" />
          <PageIntro title="*Randevu* alın" lead="Tüm aile için genel pratisyenlik. Pazartesiden cumartesiye, aynı hafta içinde randevu." locale="tr-TR" />
        </SiteShellLocale>
      </SiteShell>
    </SiteFrame>
  );
}
