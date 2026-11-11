import { LocaleSwitch } from "./components/locale-switch";
import { RestaurantSite } from "./components/restaurant-site";

/**
 * Restaurant website: full-bleed hero, story, printed-style menu, gallery, Google reviews,
 * WhatsApp booking bar, map with opening hours, FAQ and a mobile contact dock.
 * Switch EN / TR in the navbar.
 */
export default function SiteRestaurant01() {
  return <LocaleSwitch motion="full" en={<RestaurantSite locale="en" />} tr={<RestaurantSite locale="tr" />} />;
}
