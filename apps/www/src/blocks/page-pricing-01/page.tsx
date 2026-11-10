import { LocaleSwitch } from "./components/locale-switch";
import { PricingPage } from "./components/pricing-page";

/**
 * Pricing page: inner-page intro, three plans with a monthly/yearly switch (no JavaScript), a
 * customer row, a plan-by-feature comparison, a quote, billing FAQ and a split CTA.
 * Switch EN / TR in the navbar.
 */
export default function PagePricing01() {
  return <LocaleSwitch en={<PricingPage locale="en" />} tr={<PricingPage locale="tr" />} />;
}
