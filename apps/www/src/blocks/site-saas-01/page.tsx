import { LocaleSwitch } from "./components/locale-switch";
import { SaasSite } from "./components/saas-site";

/**
 * SaaS landing page: announcement, rail navbar with a submenu, product hero with a live
 * composition, customer marquee, feature tabs, sourced stats, setup steps, a customer quote,
 * pricing with a monthly/yearly switch, FAQ and an accent CTA band. Switch EN / TR in the navbar.
 */
export default function SiteSaas01() {
  return <LocaleSwitch en={<SaasSite locale="en" />} tr={<SaasSite locale="tr" />} />;
}
