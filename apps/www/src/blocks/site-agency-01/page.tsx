import { MotionScope, ScrollProgress } from "@vamos-ui/react/motion";
import { AgencySite } from "./components/agency-site";
import { LocaleSwitch } from "./components/locale-switch";
import { agencyMotion } from "./components/motion";

/**
 * Agency website: minimal navbar with a full-screen menu, statement hero with services, client
 * grid, case study, services with a sticky image, a figures ledger, process, team, client quotes,
 * journal and a large contact link. Switch EN / TR in the navbar.
 *
 * Motion (level full — a studio shows off a little): the kit blocks run their entrance cascade,
 * count-ups and staggers; a reading bar tracks the scroll, the headline's emphasised word gets an
 * accent stroke, and the language switch cross-fades.
 */
export default function SiteAgency01() {
  return (
    <MotionScope level="full" className="ag-site">
      <style>{agencyMotion}</style>
      <ScrollProgress style={{ zIndex: 60 }} />
      <LocaleSwitch en={<AgencySite locale="en" />} tr={<AgencySite locale="tr" />} />
    </MotionScope>
  );
}
