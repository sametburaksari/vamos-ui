import { ContactPage } from "./components/contact-page";
import { LocaleSwitch } from "./components/locale-switch";

/**
 * Contact page for a clinic with three branches: ruled page intro, contact form with KVKK
 * consent beside the contact details, a branch picker with map and hours, FAQ and a mobile
 * contact bar. Switch EN / TR in the navbar.
 */
export default function PageContact01() {
  return <LocaleSwitch en={<ContactPage locale="en" />} tr={<ContactPage locale="tr" />} />;
}
