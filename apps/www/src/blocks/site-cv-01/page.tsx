import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { CvSite, cvPages } from "./components/cv-site";

/**
 * Personal site + CV for a product engineer, two pages: the site (sticky identity column,
 * numbered sections: about, experience timeline, projects, writing, skills, contact) and the
 * printable CV (`?page=cv`). “Download PDF” opens the print dialog on an A4 print stylesheet;
 * printing either page prints only the CV sheet. System font, solid, compact, one sky accent.
 */
export default function SiteCv01() {
  return (
    <SiteShell accent="#0EA5E9" motion="subtle" font="system" material="solid" density="compact" pages={cvPages} className="min-h-dvh bg-scene print:bg-transparent">
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB">
          <CvSite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" messages={tr}>
          <CvSite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </SiteShell>
  );
}
