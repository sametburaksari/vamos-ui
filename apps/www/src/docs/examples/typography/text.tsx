import { Code, Text } from "@vamos-ui/react";

export default function TypographyText() {
  return (
    <div className="grid w-full max-w-lg gap-6">
      <div className="grid gap-1.5">
        <Text size="lg">Large · 16px — website body and long forms.</Text>
        <Text size="md">Medium · 14px — the panel default.</Text>
        <Text size="sm">Small · 13px — table cells, secondary actions.</Text>
        <Text size="xs">Extra small · 12px — captions and meta.</Text>
      </div>
      <div className="grid gap-1.5">
        <Text tone="muted">Muted — Last edited 3 minutes ago by Elif.</Text>
        <Text tone="subtle">Subtle — Draft · not indexed by search engines.</Text>
        <Text tone="accent" weight="medium">Accent — 12 new leads this week.</Text>
        <Text tone="success">Success — Payment of $1,260.00 received.</Text>
        <Text tone="danger">Danger — The card was declined (insufficient funds).</Text>
      </div>
      <div className="grid gap-3 rounded-ui border border-line p-4">
        <Text weight="semibold" truncate>
          Why we moved our booking flow to a single page and what happened to the conversion rate
        </Text>
        <Text tone="muted" size="sm" truncate={2}>
          We replaced a four-step wizard with one scrolling page. Abandonment dropped by a third, phone bookings halved, and the average party size went up
          — here is everything we measured over twelve weeks, including the parts that didn&apos;t work.
        </Text>
        <Text size="xs" tone="subtle">
          Slug: <Code>single-page-booking-flow</Code>
        </Text>
      </div>
    </div>
  );
}
