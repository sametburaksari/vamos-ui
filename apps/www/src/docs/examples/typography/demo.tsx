import { Heading, Lead, Text } from "@vamos-cms/ui";

const presets = ["editorial", "grotesk", "corporate"] as const;

export default function TypographyDemo() {
  return (
    <div className="grid w-full gap-8">
      {presets.map((font) => (
        // Headings follow the data-font axis: face, weight, tracking, <em> style and scale.
        <section key={font} data-font={font} className="grid gap-3 border-b border-line pb-8 last:border-0 last:pb-0">
          <Text as="span" size="xs" tone="subtle" className="font-mono">
            data-font=&quot;{font}&quot;
          </Text>
          <Heading level={2} size="display">
            Dinner, <em>slowly</em>.
          </Heading>
          <Lead className="max-w-xl">Seasonal plates from the Aegean coast, served at one long table in Moda.</Lead>
          <div className="grid gap-1.5">
            <Heading level={3} size="xl">
              Spring menu
            </Heading>
            <Heading level={4} size="lg">
              Starters
            </Heading>
            <Heading level={5} size="md">
              Grilled octopus, fava, capers
            </Heading>
            <Heading level={6} size="sm">
              Allergens
            </Heading>
          </div>
        </section>
      ))}
    </div>
  );
}
