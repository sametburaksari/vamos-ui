import { LocaleSwitch } from "./components/locale-switch";
import { SpaSite } from "./components/spa-site";

/**
 * Spa website: split hero, why-us list, service price list with booking links, visit steps,
 * gallery filmstrip, therapists, guest reviews, booking bar, hours, FAQ and a WhatsApp button.
 * Switch EN / TR in the navbar.
 */
export default function SiteSpa01() {
  return <LocaleSwitch motion="subtle" en={<SpaSite locale="en" />} tr={<SpaSite locale="tr" />} />;
}
