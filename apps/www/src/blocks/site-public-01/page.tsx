import { LocaleProvider } from "@vamos-ui/react";
import { SiteShell, SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { A11yProvider } from "./components/a11y";
import { PublicSite, publicPages } from "./components/public-site";

/**
 * Local public office, three pages: home (task-first hero with today's desk waits, the most
 * requested tasks, dated announcements, monthly figures, hours and the accessibility
 * statement), services A–Z (search, topic and "online" filters) and one announcement (planned
 * water works). Signature: the accessibility toolbar — text size, high contrast and link
 * underlines applied to the whole site through the kit's tokens, remembered on the device.
 * System fonts, solid, deep civic blue tuned for AAA text contrast in both modes.
 */
export default function SitePublic01() {
  return (
    <SiteShell accent="#00457C" accentDark="#7FB8F5" font="system" material="solid" density="comfortable" pages={publicPages}>
      <A11yProvider>
        <SiteShellLocale code="en">
          <LocaleProvider locale="en-GB">
            <PublicSite locale="en" />
          </LocaleProvider>
        </SiteShellLocale>
        <SiteShellLocale code="tr">
          <LocaleProvider locale="tr-TR" messages={tr}>
            <PublicSite locale="tr" />
          </LocaleProvider>
        </SiteShellLocale>
      </A11yProvider>
    </SiteShell>
  );
}
