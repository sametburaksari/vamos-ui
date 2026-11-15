"use client";

import { NewsTopBar, type NewsBlockLabels, type NewsTopBarProps, type WeatherData } from "@vamos-ui/react/blocks";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The top bar with its client-side adapters. In a real site `loadWeather` calls your weather API
 * (or a route that caches it) and the auth handlers call your auth backend; here they are fakes.
 */
export function TopBar({ locale, labels, place, links, social, joinHref, brand }: { locale: string; labels?: NewsBlockLabels; place: string; links: NewsTopBarProps["links"]; social: NewsTopBarProps["social"]; joinHref: string; brand: string }) {
  const loadWeather = async (): Promise<WeatherData> => {
    await wait(400);
    return { temp: 14, place, condition: "partly-cloudy", conditionLabel: locale.startsWith("tr") ? "parçalı bulutlu" : "partly cloudy" };
  };
  return (
    <NewsTopBar
      date="2026-11-15"
      weather={{ temp: 13, place, condition: "cloudy" }}
      loadWeather={loadWeather}
      links={links}
      social={social}
      locale={locale}
      labels={labels}
      auth={{
        brand,
        joinHref,
        onSignIn: async ({ email }) => {
          await wait(700);
          if (!email.endsWith("@example.com")) return locale.startsWith("tr") ? "Bu demo yalnızca @example.com adreslerini kabul ediyor." : "This demo only accepts @example.com addresses.";
        },
        onRecover: async () => {
          await wait(700);
        },
      }}
    />
  );
}
