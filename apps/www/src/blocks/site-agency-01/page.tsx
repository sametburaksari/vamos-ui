import { AgencySite } from "./components/agency-site";
import { LocaleSwitch } from "./components/locale-switch";

/**
 * Agency website: minimal navbar with a full-screen menu, statement hero with services, client
 * grid, case study, services with a sticky image, a figures ledger, process, team, client quotes,
 * journal and a large contact link. Switch EN / TR in the navbar.
 */
export default function SiteAgency01() {
  return <LocaleSwitch en={<AgencySite locale="en" />} tr={<AgencySite locale="tr" />} />;
}
