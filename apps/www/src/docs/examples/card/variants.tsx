import { Card, CardDescription, CardTitle } from "@vamos-ui/react";

const variants = [
  { variant: "surface", note: "Main surface — glass or solid" },
  { variant: "outline", note: "Hairline grouping on a surface" },
  { variant: "ghost", note: "Card spacing, no chrome" },
  { variant: "inset", note: "Nested tile — never blurs" },
] as const;

export default function CardVariants() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      {variants.map((v) => (
        <Card key={v.variant} variant={v.variant} padding="md">
          <CardTitle as="p">{v.variant}</CardTitle>
          <CardDescription>{v.note}</CardDescription>
        </Card>
      ))}
    </div>
  );
}
